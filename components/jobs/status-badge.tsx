import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/lib/types";

const variantByStatus: Record<JobStatus, "default" | "secondary" | "warning" | "success" | "muted" | "outline"> = {
  Lead: "secondary",
  "Site Visit": "outline",
  Estimating: "warning",
  "Proposal Sent": "default",
  Accepted: "success",
  "In Progress": "default",
  Completed: "success",
  Lost: "muted"
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return <Badge variant={variantByStatus[status]}>{status}</Badge>;
}
