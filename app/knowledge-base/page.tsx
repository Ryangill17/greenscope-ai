import Link from "next/link";
import { BookOpenText, Search } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/jobs/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { getCurrentProfile, getJobs } from "@/lib/data";
import { formatCurrency, tokenize } from "@/lib/utils";

export default async function KnowledgeBasePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [profile, jobs] = await Promise.all([getCurrentProfile(), getJobs()]);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const queryTokens = tokenize(query);

  const completedJobs = jobs.filter((job) => job.status === "Completed");
  const results = queryTokens.length
    ? completedJobs.filter((job) => {
        const haystack = [
          job.job_name,
          job.job_type,
          job.client_notes,
          job.site_visit_notes,
          job.measurements,
          job.lessons_learned,
          job.issues_encountered,
          job.final_value?.toString()
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return queryTokens.some((token) => haystack.includes(token));
      })
    : completedJobs;

  return (
    <AppShell
      profile={profile}
      title="Knowledge Base"
      description="Search completed jobs for pricing examples, supplier notes, crew lessons, risks, and client issues."
    >
      <div className="mb-5">
        <form className="relative max-w-3xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-12 pl-9"
            name="q"
            defaultValue={query}
            placeholder="Show me past sod jobs over 1000 square feet"
          />
        </form>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {[
            "Find jobs where drainage was an issue",
            "What did we charge for interlock patios?",
            "Which suppliers had delays?"
          ].map((example) => (
            <Link
              key={example}
              href={`/knowledge-base?q=${encodeURIComponent(example)}`}
              className="rounded-full border bg-white px-3 py-1 hover:bg-secondary"
            >
              {example}
            </Link>
          ))}
        </div>
      </div>

      {results.length ? (
        <div className="grid gap-4">
          {results.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.job_name}
                      </Link>
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.client_name} · {job.job_type}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs uppercase text-muted-foreground">Final price</p>
                  <p className="mt-2 font-semibold">{formatCurrency(job.final_value)}</p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs uppercase text-muted-foreground">Actual labour</p>
                  <p className="mt-2 font-semibold">
                    {job.actual_labour_hours ? `${job.actual_labour_hours} hrs` : "Not tracked"}
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs uppercase text-muted-foreground">Profit margin</p>
                  <p className="mt-2 font-semibold">
                    {job.profit_margin ? `${job.profit_margin}%` : "Not tracked"}
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <p className="text-xs uppercase text-muted-foreground">Measurements</p>
                  <p className="mt-2 text-sm">{job.measurements ?? "Not tracked"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Lessons learned</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {job.lessons_learned ?? "No lessons captured yet."}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Issues encountered</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {job.issues_encountered ?? "No issues captured yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpenText}
          title="No completed jobs found"
          description="Completed jobs with lessons learned, pricing, crew notes, and issues will become searchable here."
        />
      )}
    </AppShell>
  );
}
