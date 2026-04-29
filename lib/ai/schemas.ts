import { z } from "zod";

export const analysisResponseSchema = z.object({
  project_summary: z.string().min(10),
  missing_information: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  suggested_questions: z.array(z.string()).default([]),
  upsells: z.array(z.string()).default([]),
  complexity_rating: z.coerce.number().min(1).max(5),
  recommended_next_step: z.string().min(5)
});

export const estimateItemSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  unit_cost: z.coerce.number().nonnegative(),
  labour_hours: z.coerce.number().nonnegative(),
  labour_rate: z.coerce.number().nonnegative(),
  markup_percentage: z.coerce.number().nonnegative(),
  assumptions: z.string().optional()
});

export const estimateResponseSchema = z.object({
  items: z.array(estimateItemSchema).min(1),
  missing_information_warning: z.string().optional(),
  pricing_assumptions: z.array(z.string()).default([])
});

export const materialItemSchema = z.object({
  material_name: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  supplier: z.string().nullable().optional(),
  estimated_cost: z.coerce.number().nonnegative(),
  notes: z.string().nullable().optional()
});

export const materialListResponseSchema = z.object({
  items: z.array(materialItemSchema).min(1),
  assumptions: z.array(z.string()).default([])
});

export const proposalResponseSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(50),
  price: z.coerce.number().nonnegative(),
  assumptions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  optional_add_ons: z.array(z.string()).default([])
});

export const crewInstructionsResponseSchema = z.object({
  content: z.string().min(50)
});

export const similarJobResponseSchema = z.object({
  jobs: z.array(
    z.object({
      id: z.string(),
      job_name: z.string(),
      job_type: z.string(),
      final_price: z.coerce.number().nullable(),
      actual_labour_hours: z.coerce.number().nullable(),
      profit_margin: z.coerce.number().nullable(),
      lessons_learned: z.string().nullable(),
      issues_encountered: z.string().nullable(),
      similarity_reason: z.string(),
      score: z.coerce.number().min(0).max(1)
    })
  )
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
export type EstimateResponse = z.infer<typeof estimateResponseSchema>;
export type MaterialListResponse = z.infer<typeof materialListResponseSchema>;
export type ProposalResponse = z.infer<typeof proposalResponseSchema>;
export type CrewInstructionsResponse = z.infer<
  typeof crewInstructionsResponseSchema
>;
