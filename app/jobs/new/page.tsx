import { AppShell } from "@/components/layout/app-shell";
import { CreateJobForm } from "@/components/forms/create-job-form";
import { getCurrentProfile } from "@/lib/data";

export default async function NewJobPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const profile = await getCurrentProfile();

  return (
    <AppShell
      profile={profile}
      title="Create Job"
      description="Upload messy job information and turn it into structured estimate and production workflows."
    >
      <CreateJobForm error={resolvedSearchParams.error} />
    </AppShell>
  );
}
