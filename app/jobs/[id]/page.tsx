import { notFound } from "next/navigation";

import { JobDetailWorkspace } from "@/components/jobs/job-detail-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile, getJobBundle } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [profile, bundle] = await Promise.all([
    getCurrentProfile(),
    getJobBundle(resolvedParams.id)
  ]);

  if (!bundle) notFound();

  return (
    <AppShell
      profile={profile}
      title={bundle.job.job_name}
      description={`${bundle.job.client_name} · ${bundle.job.job_type} · ${formatCurrency(bundle.job.estimated_value)}`}
    >
      <JobDetailWorkspace bundle={bundle} profile={profile} />
    </AppShell>
  );
}
