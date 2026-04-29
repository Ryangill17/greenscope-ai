export const jobTypes = [
  "Lawn maintenance",
  "Garden bed installation",
  "Sod installation",
  "Interlock/pavers",
  "Retaining wall",
  "Deck/patio",
  "Fence",
  "Irrigation",
  "Tree/shrub planting",
  "Seasonal cleanup",
  "Snow removal",
  "Custom"
] as const;

export const jobStatuses = [
  "Lead",
  "Site Visit",
  "Estimating",
  "Proposal Sent",
  "Accepted",
  "In Progress",
  "Completed",
  "Lost"
] as const;

export const aiTones = ["Professional", "Friendly", "Premium", "Simple"] as const;

export type JobType = (typeof jobTypes)[number];
export type JobStatus = (typeof jobStatuses)[number];
export type AITone = (typeof aiTones)[number];

export type Profile = {
  id: string;
  email: string;
  company_name: string | null;
  company_logo_url: string | null;
  phone: string | null;
  address: string | null;
  default_labour_rate: number | null;
  default_markup: number | null;
  tax_rate: number | null;
  proposal_terms: string | null;
  preferred_suppliers: string | null;
  service_area: string | null;
  ai_tone: AITone | null;
  created_at: string;
};

export type Job = {
  id: string;
  user_id: string;
  job_name: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  property_address: string | null;
  job_type: JobType;
  status: JobStatus;
  budget_range: string | null;
  desired_timeline: string | null;
  client_notes: string | null;
  site_visit_notes: string | null;
  measurements: string | null;
  estimated_value: number | null;
  final_value: number | null;
  actual_labour_hours: number | null;
  profit_margin: number | null;
  lessons_learned: string | null;
  issues_encountered?: string | null;
  created_at: string;
  updated_at: string;
};

export type JobFile = {
  id: string;
  job_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  extracted_text: string | null;
  created_at: string;
};

export type AIAnalysis = {
  id: string;
  job_id: string;
  user_id: string;
  project_summary: string;
  missing_information: string[];
  risks: string[];
  suggested_questions: string[];
  upsells: string[];
  complexity_rating: number;
  recommended_next_step: string;
  raw_json: Record<string, unknown>;
  created_at: string;
};

export type EstimateLineItem = {
  id: string;
  job_id: string;
  user_id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  labour_hours: number;
  labour_rate: number;
  markup_percentage: number;
  total: number;
  created_at: string;
};

export type Proposal = {
  id: string;
  job_id: string;
  user_id: string;
  title: string;
  content: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type MaterialItem = {
  id: string;
  job_id: string;
  user_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  supplier: string | null;
  estimated_cost: number;
  notes: string | null;
  created_at: string;
};

export type CrewInstruction = {
  id: string;
  job_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  totalJobs: number;
  draftEstimates: number;
  proposalsSent: number;
  completedJobs: number;
};

export type JobBundle = {
  job: Job;
  files: JobFile[];
  analysis: AIAnalysis | null;
  estimateLineItems: EstimateLineItem[];
  proposal: Proposal | null;
  materialItems: MaterialItem[];
  crewInstruction: CrewInstruction | null;
  similarJobs: SimilarJob[];
};

export type SimilarJob = {
  id: string;
  job_name: string;
  job_type: JobType;
  final_price: number | null;
  actual_labour_hours: number | null;
  profit_margin: number | null;
  lessons_learned: string | null;
  issues_encountered: string | null;
  similarity_reason: string;
  score: number;
};
