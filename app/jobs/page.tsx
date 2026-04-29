import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { JobList } from "@/components/jobs/job-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { getCurrentProfile, getJobs } from "@/lib/data";

export default async function JobsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [profile, jobs] = await Promise.all([
    getCurrentProfile(),
    getJobs(resolvedSearchParams.q)
  ]);

  return (
    <AppShell
      profile={profile}
      title="Jobs"
      description="Manage leads, site visits, estimates, proposals, production, and completed jobs."
      action={
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4" />
            New job
          </Link>
        </Button>
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            name="q"
            defaultValue={resolvedSearchParams.q}
            placeholder="Search by job, client, type, or status"
          />
        </form>
      </div>

      {jobs.length ? (
        <JobList jobs={jobs} />
      ) : (
        <EmptyState
          icon={Search}
          title="No jobs found"
          description="Create a job or change your search to see landscaping opportunities."
          actionLabel="Create job"
          actionHref="/jobs/new"
        />
      )}
    </AppShell>
  );
}
