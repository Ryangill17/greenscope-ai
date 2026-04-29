import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  PencilLine,
  Plus,
  Search
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/jobs/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDashboardData } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { profile, stats, recentJobs } = await getDashboardData();

  return (
    <AppShell
      profile={profile}
      title="Dashboard"
      description="Track active opportunities, estimates, proposals, and completed work."
      action={
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4" />
            New job
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total jobs"
          value={stats.totalJobs}
          helper="Across all pipeline stages"
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Draft estimates"
          value={stats.draftEstimates}
          helper="Ready for pricing review"
          icon={PencilLine}
        />
        <StatCard
          label="Proposals sent"
          value={stats.proposalsSent}
          helper="Awaiting client response"
          icon={FileText}
        />
        <StatCard
          label="Completed jobs"
          value={stats.completedJobs}
          helper="Available for knowledge search"
          icon={CheckCircle2}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent jobs</CardTitle>
              <CardDescription>
                Open a job to run analysis, build an estimate, generate a proposal, or prepare crews.
              </CardDescription>
            </div>
            <form action="/jobs" className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" name="q" placeholder="Search jobs" />
            </form>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="grid gap-3 rounded-lg border bg-background p-4 transition-colors hover:bg-secondary/40 md:grid-cols-[1fr_auto_auto] md:items-center"
                >
                  <div>
                    <div className="font-medium">{job.job_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.client_name} · {job.job_type}
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                  <div className="text-sm md:text-right">
                    <div className="font-medium">{formatCurrency(job.estimated_value)}</div>
                    <div className="text-muted-foreground">{formatDate(job.updated_at)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI workflow queue</CardTitle>
            <CardDescription>
              Suggested next actions based on active jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              "Analyze missing info for estimating-stage jobs",
              "Generate draft proposal for sent-ready estimates",
              "Create crew instructions before accepted jobs start",
              "Capture lessons learned after completion"
            ].map((item) => (
              <div key={item} className="rounded-md border bg-background p-3 text-sm">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
