import type {
  AIAnalysis,
  CrewInstruction,
  DashboardStats,
  EstimateLineItem,
  Job,
  JobBundle,
  JobFile,
  MaterialItem,
  Profile,
  Proposal,
  SimilarJob
} from "@/lib/types";

export const demoProfile: Profile = {
  id: "demo-user",
  email: "owner@evergreen-demo.com",
  company_name: "Evergreen Outdoor Services",
  company_logo_url: null,
  phone: "(555) 018-4400",
  address: "124 Willow Street, Portland, OR",
  default_labour_rate: 72,
  default_markup: 28,
  tax_rate: 8.5,
  proposal_terms:
    "50% deposit due on acceptance. Balance due on substantial completion. Changes require written approval.",
  preferred_suppliers: "SiteOne, Local Stone Yard, Green Valley Nursery",
  service_area: "Portland metro and surrounding suburbs",
  ai_tone: "Professional",
  created_at: "2026-01-03T14:20:00.000Z"
};

export const demoJobs: Job[] = [
  {
    id: "demo-1",
    user_id: "demo-user",
    job_name: "Maple Ridge Front Yard Refresh",
    client_name: "Avery Thompson",
    client_email: "avery@example.com",
    client_phone: "(555) 018-1020",
    property_address: "44 Maple Ridge Lane",
    job_type: "Garden bed installation",
    status: "Estimating",
    budget_range: "$8,000 - $12,000",
    desired_timeline: "Before Memorial Day weekend",
    client_notes:
      "Client wants curb appeal before listing the home. Existing beds are overgrown. Interested in low-maintenance planting and fresh edging.",
    site_visit_notes:
      "Front bed is roughly 52 linear feet. Soil is compacted near driveway. Downspout discharge should be redirected before mulch install.",
    measurements:
      "Front bed: 52 ft x 5 ft average. Walkway edge: 34 ft. Mulch depth requested: 3 in.",
    estimated_value: 10850,
    final_value: null,
    actual_labour_hours: null,
    profit_margin: null,
    lessons_learned: null,
    issues_encountered: null,
    created_at: "2026-04-18T13:15:00.000Z",
    updated_at: "2026-04-24T10:30:00.000Z"
  },
  {
    id: "demo-2",
    user_id: "demo-user",
    job_name: "Cedar Court Sod Replacement",
    client_name: "Marcus Lee",
    client_email: "marcus@example.com",
    client_phone: "(555) 018-2085",
    property_address: "91 Cedar Court",
    job_type: "Sod installation",
    status: "Completed",
    budget_range: "$5,000 - $7,500",
    desired_timeline: "Completed in March",
    client_notes:
      "Replace patchy back lawn after drainage work. Client wanted resilient turf for kids and dog.",
    site_visit_notes:
      "Backyard had low corner near patio. Added soil amendment and minor regrading.",
    measurements: "Back lawn: 1,180 sq ft. Access width: 42 in gate.",
    estimated_value: 6420,
    final_value: 6750,
    actual_labour_hours: 46,
    profit_margin: 31,
    lessons_learned:
      "Add a half-day buffer when gate access is under 48 inches. Crew spent extra time hand-carrying rolls.",
    issues_encountered: "Drainage remained soft after rain and needed additional topsoil.",
    created_at: "2026-03-02T11:00:00.000Z",
    updated_at: "2026-03-20T16:00:00.000Z"
  },
  {
    id: "demo-3",
    user_id: "demo-user",
    job_name: "Oak Hollow Paver Patio",
    client_name: "Priya Shah",
    client_email: "priya@example.com",
    client_phone: "(555) 018-9133",
    property_address: "8 Oak Hollow Drive",
    job_type: "Interlock/pavers",
    status: "Proposal Sent",
    budget_range: "$18,000 - $25,000",
    desired_timeline: "Early summer",
    client_notes:
      "Client wants a 420 sq ft patio with seating wall and premium pavers. Asked for lighting as optional add-on.",
    site_visit_notes:
      "Good access from side yard. Existing slope toward house requires base and drainage attention.",
    measurements:
      "Patio area: 420 sq ft. Seating wall: 22 linear ft. Excavation depth: 9 in.",
    estimated_value: 23800,
    final_value: null,
    actual_labour_hours: null,
    profit_margin: null,
    lessons_learned: null,
    issues_encountered: null,
    created_at: "2026-04-08T15:45:00.000Z",
    updated_at: "2026-04-23T18:10:00.000Z"
  }
];

export const demoFiles: JobFile[] = [
  {
    id: "file-1",
    job_id: "demo-1",
    user_id: "demo-user",
    file_name: "front-yard-site-notes.pdf",
    file_url: "#",
    file_type: "application/pdf",
    extracted_text:
      "Photo notes: compacted soil near driveway, downspout at bed corner, existing shrubs to remove.",
    created_at: "2026-04-18T14:10:00.000Z"
  },
  {
    id: "file-2",
    job_id: "demo-1",
    user_id: "demo-user",
    file_name: "nursery-price-list.csv",
    file_url: "#",
    file_type: "text/csv",
    extracted_text:
      "Boxwood 3 gal $32, hydrangea 5 gal $48, mulch cubic yard $42, steel edging ft $5.60.",
    created_at: "2026-04-19T09:15:00.000Z"
  }
];

export const demoAnalysis: AIAnalysis = {
  id: "analysis-1",
  job_id: "demo-1",
  user_id: "demo-user",
  project_summary:
    "Refresh the front landscape beds with removals, soil preparation, low-maintenance planting, edging, mulch, and drainage attention near the driveway.",
  missing_information: [
    "Confirm plant palette preference and deer resistance needs.",
    "Confirm whether downspout redirection is included or handled by another contractor.",
    "Confirm disposal expectations for removed shrubs and soil."
  ],
  risks: [
    "Compacted soil may require additional amendment or excavation.",
    "Downspout discharge can wash out mulch if not corrected.",
    "Listing deadline creates schedule pressure."
  ],
  suggested_questions: [
    "Do you want evergreen structure, flowering color, or a mix?",
    "Should the proposal include downspout extension and splash control?",
    "Are there HOA or listing-photo timing constraints?"
  ],
  upsells: [
    "Low-voltage path lighting",
    "Seasonal maintenance package",
    "Premium steel edging upgrade"
  ],
  complexity_rating: 3,
  recommended_next_step:
    "Confirm drainage scope and planting preferences before issuing a final proposal.",
  raw_json: {},
  created_at: "2026-04-21T09:25:00.000Z"
};

export const demoEstimateLineItems: EstimateLineItem[] = [
  {
    id: "line-1",
    job_id: "demo-1",
    user_id: "demo-user",
    category: "Site prep",
    description: "Remove overgrown shrubs, weeds, and existing mulch",
    quantity: 1,
    unit: "allowance",
    unit_cost: 450,
    labour_hours: 14,
    labour_rate: 72,
    markup_percentage: 20,
    total: 1749.6,
    created_at: "2026-04-21T09:40:00.000Z"
  },
  {
    id: "line-2",
    job_id: "demo-1",
    user_id: "demo-user",
    category: "Materials",
    description: "Plants, compost, mulch, edging, and fasteners",
    quantity: 1,
    unit: "package",
    unit_cost: 3850,
    labour_hours: 0,
    labour_rate: 72,
    markup_percentage: 28,
    total: 4928,
    created_at: "2026-04-21T09:40:00.000Z"
  },
  {
    id: "line-3",
    job_id: "demo-1",
    user_id: "demo-user",
    category: "Installation",
    description: "Install bed edge, soil amendments, plants, and mulch",
    quantity: 1,
    unit: "crew day",
    unit_cost: 0,
    labour_hours: 42,
    labour_rate: 72,
    markup_percentage: 18,
    total: 3568.32,
    created_at: "2026-04-21T09:40:00.000Z"
  }
];

export const demoMaterials: MaterialItem[] = [
  {
    id: "mat-1",
    job_id: "demo-1",
    user_id: "demo-user",
    material_name: "Triple-shred hardwood mulch",
    quantity: 2.5,
    unit: "cu yd",
    supplier: "Green Valley Nursery",
    estimated_cost: 105,
    notes: "Assumes 3 inch depth across 260 sq ft",
    created_at: "2026-04-21T09:50:00.000Z"
  },
  {
    id: "mat-2",
    job_id: "demo-1",
    user_id: "demo-user",
    material_name: "Powder-coated steel edging",
    quantity: 86,
    unit: "ft",
    supplier: "SiteOne",
    estimated_cost: 481.6,
    notes: "Includes front bed and walkway transitions",
    created_at: "2026-04-21T09:50:00.000Z"
  }
];

export const demoProposal: Proposal = {
  id: "proposal-1",
  job_id: "demo-1",
  user_id: "demo-user",
  title: "Front Yard Landscape Refresh Proposal",
  content:
    "Dear Avery,\n\nThank you for inviting Evergreen Outdoor Services to prepare a front yard refresh for Maple Ridge Lane. This proposal includes bed cleanup, soil preparation, new low-maintenance plantings, steel edging, mulch, and cleanup.\n\nScope of Work\n- Remove overgrown shrubs, weeds, and tired mulch from front beds.\n- Prepare soil with compost amendments where needed.\n- Install selected shrubs and perennial accents.\n- Install clean edging transitions along lawn and walkway.\n- Apply hardwood mulch and complete final cleanup.\n\nAssumptions\n- Plant selections are based on mid-range nursery availability.\n- Downspout redirection is priced as an allowance and should be confirmed before final acceptance.\n\nNext Steps\nApprove the proposal and deposit to reserve the installation window.",
  price: 10850,
  status: "Draft",
  created_at: "2026-04-22T10:00:00.000Z",
  updated_at: "2026-04-22T10:00:00.000Z"
};

export const demoCrewInstruction: CrewInstruction = {
  id: "crew-1",
  job_id: "demo-1",
  user_id: "demo-user",
  content:
    "Job Summary: Front bed refresh with removals, soil prep, edging, planting, mulch, and drainage attention.\n\nArrival Notes: Park along curb without blocking driveway. Confirm plant layout with estimator before digging.\n\nTools Needed: Shovels, edging spade, wheelbarrows, tarp, pruners, compact rake, drill, PPE.\n\nWork Plan:\n1. Walk site and mark utilities/irrigation heads.\n2. Remove existing shrubs and weeds.\n3. Prep compacted soil near driveway.\n4. Install edging and verify curves from street view.\n5. Set plants before digging final holes.\n6. Install mulch and clean hard surfaces.\n\nSafety Notes: Watch for irrigation lines and downspout discharge area.\n\nQuality Checklist: Edges smooth, plants plumb, mulch depth consistent, driveway swept.\n\nCleanup Checklist: Remove debris, rinse walkway, photograph final beds.",
  created_at: "2026-04-22T10:20:00.000Z",
  updated_at: "2026-04-22T10:20:00.000Z"
};

export const demoSimilarJobs: SimilarJob[] = [
  {
    id: "demo-2",
    job_name: "Cedar Court Sod Replacement",
    job_type: "Sod installation",
    final_price: 6750,
    actual_labour_hours: 46,
    profit_margin: 31,
    lessons_learned:
      "Add a half-day buffer when gate access is under 48 inches.",
    issues_encountered: "Drainage remained soft after rain.",
    similarity_reason:
      "Both jobs include residential curb appeal work with drainage considerations and constrained install timing.",
    score: 0.68
  },
  {
    id: "demo-3",
    job_name: "Oak Hollow Paver Patio",
    job_type: "Interlock/pavers",
    final_price: null,
    actual_labour_hours: null,
    profit_margin: null,
    lessons_learned: null,
    issues_encountered: "Slope toward house requires drainage attention.",
    similarity_reason:
      "Drainage risk and proposal-stage questions overlap with the current job.",
    score: 0.53
  }
];

export function getDemoStats(): DashboardStats {
  return {
    totalJobs: demoJobs.length,
    draftEstimates: demoJobs.filter((job) => job.status === "Estimating").length,
    proposalsSent: demoJobs.filter((job) => job.status === "Proposal Sent").length,
    completedJobs: demoJobs.filter((job) => job.status === "Completed").length
  };
}

export function getDemoJobBundle(id: string): JobBundle | null {
  const job = demoJobs.find((item) => item.id === id) ?? demoJobs[0];
  if (!job) return null;
  return {
    job,
    files: demoFiles.filter((file) => file.job_id === job.id),
    analysis: job.id === "demo-1" ? demoAnalysis : null,
    estimateLineItems: job.id === "demo-1" ? demoEstimateLineItems : [],
    proposal: job.id === "demo-1" ? demoProposal : null,
    materialItems: job.id === "demo-1" ? demoMaterials : [],
    crewInstruction: job.id === "demo-1" ? demoCrewInstruction : null,
    similarJobs: demoSimilarJobs
  };
}
