import OpenAI from "openai";
import type { z } from "zod";

import {
  analysisResponseSchema,
  crewInstructionsResponseSchema,
  estimateResponseSchema,
  materialListResponseSchema,
  proposalResponseSchema,
  type AnalysisResponse,
  type CrewInstructionsResponse,
  type EstimateResponse,
  type MaterialListResponse,
  type ProposalResponse
} from "@/lib/ai/schemas";
import { isOpenAIConfigured } from "@/lib/env";
import { scoreSimilarJobs } from "@/lib/data";
import type { Job, JobFile, Profile, SimilarJob } from "@/lib/types";

type JobAIContext = {
  job: Job;
  files: JobFile[];
  profile: Profile;
};

const systemPrompt = `You are GreenScope AI, a structured operating assistant for landscaping companies.
Return only valid JSON matching the requested schema.
Do not pretend exact pricing is known unless supplier pricing, uploaded price lists, or company defaults are provided.
When a number is uncertain, use a reasonable placeholder and clearly mark the assumption.
Always flag missing information before recommending final estimate or proposal decisions.
Separate client-facing proposal language from internal crew notes.`;

function compactContext({ job, files, profile }: JobAIContext) {
  return {
    company: {
      name: profile.company_name,
      default_labour_rate: profile.default_labour_rate,
      default_markup: profile.default_markup,
      tax_rate: profile.tax_rate,
      preferred_suppliers: profile.preferred_suppliers,
      service_area: profile.service_area,
      ai_tone: profile.ai_tone
    },
    job: {
      job_name: job.job_name,
      client_name: job.client_name,
      property_address: job.property_address,
      job_type: job.job_type,
      status: job.status,
      budget_range: job.budget_range,
      desired_timeline: job.desired_timeline,
      client_notes: job.client_notes,
      site_visit_notes: job.site_visit_notes,
      measurements: job.measurements,
      estimated_value: job.estimated_value,
      lessons_learned: job.lessons_learned
    },
    files: files.map((file) => ({
      file_name: file.file_name,
      file_type: file.file_type,
      extracted_text: file.extracted_text
    }))
  };
}

async function completeJson<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  userPrompt: string,
  fallback: () => z.output<TSchema>
): Promise<z.output<TSchema>> {
  if (!isOpenAIConfigured) return fallback();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response");

  const parsed = JSON.parse(content);
  return schema.parse(parsed);
}

export function calculateLineTotal(item: {
  quantity: number;
  unit_cost: number;
  labour_hours: number;
  labour_rate: number;
  markup_percentage: number;
}) {
  const material = item.quantity * item.unit_cost;
  const labour = item.labour_hours * item.labour_rate;
  const markup = (material + labour) * (item.markup_percentage / 100);
  return Number((material + labour + markup).toFixed(2));
}

export async function analyzeJob(context: JobAIContext): Promise<AnalysisResponse> {
  return completeJson(
    analysisResponseSchema,
    `Analyze this landscaping job and return JSON with keys: project_summary, missing_information, risks, suggested_questions, upsells, complexity_rating, recommended_next_step.\n\nContext:\n${JSON.stringify(compactContext(context), null, 2)}`,
    () => ({
      project_summary: `${context.job.job_name} is a ${context.job.job_type.toLowerCase()} opportunity for ${context.job.client_name}. The available notes point to scope planning, measurements validation, material selection, labour planning, and client expectation alignment before a final proposal is issued.`,
      missing_information: [
        "Confirm final material selections and supplier availability.",
        "Confirm access constraints, disposal requirements, and utility/irrigation locations.",
        "Confirm whether drainage, grading, or site repairs are included in the base scope."
      ],
      risks: [
        "Pricing may change if site measurements or material selections shift.",
        "Subsurface conditions, drainage, or compacted soil could add labour.",
        "Timeline depends on supplier availability and weather."
      ],
      suggested_questions: [
        "Which finish/material options should be priced as base versus premium?",
        "Are there irrigation lines, utilities, pets, gates, or access constraints the crew should know about?",
        "Should cleanup, haul-away, and ongoing maintenance be included?"
      ],
      upsells: [
        "Seasonal maintenance plan",
        "Lighting or irrigation upgrades",
        "Premium edging, soil amendments, or extended warranty care"
      ],
      complexity_rating: context.job.job_type.includes("Interlock") ? 4 : 3,
      recommended_next_step:
        "Collect missing scope details, confirm measurements, and generate a draft estimate with assumptions clearly labeled."
    })
  );
}

export async function generateEstimate(
  context: JobAIContext
): Promise<EstimateResponse> {
  const labourRate = context.profile.default_labour_rate ?? 72;
  const markup = context.profile.default_markup ?? 25;

  const response = await completeJson(
    estimateResponseSchema,
    `Create a draft landscaping estimate. Return JSON with keys: items, missing_information_warning, pricing_assumptions. Each item must have category, description, quantity, unit, unit_cost, labour_hours, labour_rate, markup_percentage, assumptions. Use company defaults when available and mark placeholder pricing clearly.\n\nContext:\n${JSON.stringify(compactContext(context), null, 2)}`,
    () => ({
      missing_information_warning:
        "Draft only: verify final measurements, selected materials, supplier prices, disposal, access, and drainage scope before client approval.",
      pricing_assumptions: [
        "Supplier pricing is estimated unless a file provides exact costs.",
        `Labour rate uses ${labourRate}/hr from company settings or demo defaults.`,
        `Markup uses ${markup}% unless changed by the estimator.`
      ],
      items: [
        {
          category: "Site preparation",
          description: "Site protection, layout confirmation, removals, and disposal allowance",
          quantity: 1,
          unit: "allowance",
          unit_cost: 650,
          labour_hours: 16,
          labour_rate: labourRate,
          markup_percentage: markup,
          assumptions: "Placeholder until removals and disposal volume are confirmed."
        },
        {
          category: "Materials",
          description: `${context.job.job_type} material package based on notes and measurements`,
          quantity: 1,
          unit: "package",
          unit_cost: context.job.job_type.includes("Interlock") ? 7200 : 3400,
          labour_hours: 0,
          labour_rate: labourRate,
          markup_percentage: markup,
          assumptions: "Supplier quote required before final price."
        },
        {
          category: "Installation labour",
          description: "Crew installation, finish grading, cleanup, and quality check",
          quantity: 1,
          unit: "crew package",
          unit_cost: 0,
          labour_hours: context.job.job_type.includes("Interlock") ? 96 : 44,
          labour_rate: labourRate,
          markup_percentage: markup,
          assumptions: "Weather, access, and site conditions can affect hours."
        }
      ]
    })
  );

  return {
    ...response,
    items: response.items.map((item) => ({
      ...item,
      labour_rate: item.labour_rate || labourRate,
      markup_percentage: item.markup_percentage || markup
    }))
  };
}

export async function generateMaterialList(
  context: JobAIContext
): Promise<MaterialListResponse> {
  return completeJson(
    materialListResponseSchema,
    `Generate a material takeoff for this landscaping job. Return JSON with keys: items and assumptions. Each item must have material_name, quantity, unit, supplier, estimated_cost, notes. Use uploaded supplier price text if present; otherwise label costs as estimates.\n\nContext:\n${JSON.stringify(compactContext(context), null, 2)}`,
    () => ({
      assumptions: [
        "Quantities are based on provided measurements and should be field-verified.",
        "Supplier costs are placeholders unless an uploaded price list provides exact pricing."
      ],
      items: [
        {
          material_name: context.job.job_type.includes("Sod") ? "Premium sod rolls" : "Plant and landscape material package",
          quantity: context.job.job_type.includes("Sod") ? 1200 : 1,
          unit: context.job.job_type.includes("Sod") ? "sq ft" : "package",
          supplier: context.profile.preferred_suppliers?.split(",")[0]?.trim() ?? null,
          estimated_cost: context.job.job_type.includes("Sod") ? 900 : 3400,
          notes: "Confirm supplier availability before scheduling."
        },
        {
          material_name: "Soil amendment and mulch allowance",
          quantity: 1,
          unit: "allowance",
          supplier: context.profile.preferred_suppliers?.split(",")[1]?.trim() ?? null,
          estimated_cost: 520,
          notes: "Adjust after final bed square footage and depth are confirmed."
        }
      ]
    })
  );
}

export async function generateProposal(
  context: JobAIContext,
  estimateTotal: number
): Promise<ProposalResponse> {
  const tone = context.profile.ai_tone ?? "Professional";

  return completeJson(
    proposalResponseSchema,
    `Write a client-facing landscaping proposal in a ${tone.toLowerCase()} tone. Return JSON with title, content, price, assumptions, exclusions, optional_add_ons. Include professional intro, scope of work, materials included, timeline, investment/price, assumptions, exclusions, optional add-ons, terms and next steps. Do not include internal crew instructions.\n\nContext:\n${JSON.stringify({ ...compactContext(context), estimate_total: estimateTotal }, null, 2)}`,
    () => ({
      title: `${context.job.job_name} Proposal`,
      price: estimateTotal || context.job.estimated_value || 0,
      assumptions: [
        "Final price assumes measurements and material choices remain consistent.",
        "Supplier availability and weather may affect the installation schedule."
      ],
      exclusions: [
        "Permit fees unless explicitly listed.",
        "Hidden drainage, irrigation, utility, or subsurface repairs not visible during review."
      ],
      optional_add_ons: [
        "Seasonal maintenance package",
        "Low-voltage lighting",
        "Premium plant warranty care"
      ],
      content: `Dear ${context.job.client_name},\n\nThank you for considering ${context.profile.company_name ?? "our team"} for ${context.job.job_name}. Based on the information provided, we recommend a structured ${context.job.job_type.toLowerCase()} scope that balances curb appeal, durability, and efficient installation.\n\nScope of Work\n- Review site conditions and confirm layout before work begins.\n- Prepare the work area, protect adjacent surfaces, and complete required removals.\n- Supply and install the agreed landscaping materials.\n- Complete finish details, cleanup, and a final quality walkthrough.\n\nMaterials Included\nMaterials will be selected based on approved options and supplier availability. Placeholder pricing should be confirmed against supplier quotes before final acceptance.\n\nTimeline\nTarget timeline: ${context.job.desired_timeline ?? "to be scheduled after approval and deposit"}.\n\nInvestment\nEstimated project investment: ${estimateTotal || context.job.estimated_value || 0}.\n\nAssumptions\nThis proposal assumes final measurements, material selections, access conditions, and drainage scope remain consistent with the notes provided.\n\nExclusions\nThis proposal excludes hidden utility, irrigation, drainage, permit, or subsurface repairs unless added in writing.\n\nTerms and Next Steps\n${context.profile.proposal_terms ?? "Approve the proposal to reserve your installation window. Any scope changes will be documented before work proceeds."}`
    })
  );
}

export async function generateCrewInstructions(
  context: JobAIContext
): Promise<CrewInstructionsResponse> {
  return completeJson(
    crewInstructionsResponseSchema,
    `Generate internal crew instructions for this landscaping job. Return JSON with key: content. Include job summary, arrival notes, tools needed, materials needed, step-by-step work plan, safety notes, quality checklist, cleanup checklist, and client-specific notes. This is internal only and should not use client-facing sales language.\n\nContext:\n${JSON.stringify(compactContext(context), null, 2)}`,
    () => ({
      content: `Job Summary: ${context.job.job_name} is a ${context.job.job_type.toLowerCase()} job for ${context.job.client_name}.\n\nArrival Notes: Confirm property address, access, parking, staging area, and any client-specific constraints before unloading.\n\nTools Needed: PPE, shovels, rakes, wheelbarrows, measuring tape, marking paint/flags, hand tools, cleanup tools, and job-specific equipment.\n\nMaterials Needed: Review material list before departure. Verify quantities, substitutions, and supplier pickup notes.\n\nStep-by-Step Work Plan:\n1. Walk the site and verify scope, utilities, irrigation, access, and protection areas.\n2. Stage materials safely without blocking client access.\n3. Complete removals or site preparation.\n4. Install materials according to approved layout and measurements.\n5. Complete finish grading, detailing, and quality checks.\n6. Photograph completed work and report any changes.\n\nSafety Notes: Watch for buried utilities, irrigation, uneven ground, equipment movement, heat, and lifting hazards.\n\nQuality Checklist: Confirm layout, levels, alignment, plant spacing, material depth, and clean transitions.\n\nCleanup Checklist: Remove debris, sweep hard surfaces, wash down affected areas if needed, and leave site photo-ready.\n\nClient-Specific Notes: ${context.job.client_notes ?? "No special client notes provided."}`
    })
  );
}

export function findSimilarJobs(job: Job, completedJobs: Job[]): SimilarJob[] {
  return scoreSimilarJobs(job, completedJobs);
}
