"use client";

import * as React from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  FileUp,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

import { uploadJobFilesAction } from "@/app/actions/jobs";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
  AIAnalysis,
  EstimateLineItem,
  JobBundle,
  MaterialItem,
  Profile,
  Proposal,
  SimilarJob
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type EstimateDraftItem = Omit<
  EstimateLineItem,
  "job_id" | "user_id" | "created_at"
> & {
  assumptions?: string;
};

type MaterialDraftItem = Omit<
  MaterialItem,
  "job_id" | "user_id" | "created_at"
>;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function lineTotal(item: EstimateDraftItem) {
  const material = item.quantity * item.unit_cost;
  const labour = item.labour_hours * item.labour_rate;
  const markup = (material + labour) * (item.markup_percentage / 100);
  return Number((material + labour + markup).toFixed(2));
}

function toDraftItem(item: EstimateLineItem): EstimateDraftItem {
  return {
    id: item.id,
    category: item.category,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_cost: item.unit_cost,
    labour_hours: item.labour_hours,
    labour_rate: item.labour_rate,
    markup_percentage: item.markup_percentage,
    total: item.total
  };
}

function Field({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm">{value || "Not provided"}</div>
    </div>
  );
}

export function JobDetailWorkspace({
  bundle,
  profile
}: {
  bundle: JobBundle;
  profile: Profile;
}) {
  const { job } = bundle;
  const [analysis, setAnalysis] = React.useState<AIAnalysis | null>(
    bundle.analysis
  );
  const [estimateItems, setEstimateItems] = React.useState<EstimateDraftItem[]>(
    bundle.estimateLineItems.map(toDraftItem)
  );
  const [proposal, setProposal] = React.useState<Proposal | null>(
    bundle.proposal
  );
  const [proposalTitle, setProposalTitle] = React.useState(
    bundle.proposal?.title ?? `${job.job_name} Proposal`
  );
  const [proposalContent, setProposalContent] = React.useState(
    bundle.proposal?.content ?? ""
  );
  const [proposalPrice, setProposalPrice] = React.useState(
    bundle.proposal?.price ?? job.estimated_value ?? 0
  );
  const [materials, setMaterials] = React.useState<MaterialDraftItem[]>(
    bundle.materialItems.map((item) => ({
      id: item.id,
      material_name: item.material_name,
      quantity: item.quantity,
      unit: item.unit,
      supplier: item.supplier,
      estimated_cost: item.estimated_cost,
      notes: item.notes
    }))
  );
  const [crewContent, setCrewContent] = React.useState(
    bundle.crewInstruction?.content ?? ""
  );
  const [similarJobs, setSimilarJobs] = React.useState<SimilarJob[]>(
    bundle.similarJobs
  );
  const [loading, setLoading] = React.useState<string | null>(null);

  const totals = React.useMemo(() => {
    const materialTotal = estimateItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0
    );
    const labourTotal = estimateItems.reduce(
      (sum, item) => sum + item.labour_hours * item.labour_rate,
      0
    );
    const grandBeforeTax = estimateItems.reduce(
      (sum, item) => sum + lineTotal(item),
      0
    );
    const markup = grandBeforeTax - materialTotal - labourTotal;
    const tax = grandBeforeTax * ((profile.tax_rate ?? 0) / 100);
    const grandTotal = grandBeforeTax + tax;
    return { materialTotal, labourTotal, markup, tax, grandTotal };
  }, [estimateItems, profile.tax_rate]);

  async function runWorkflow<T>(
    key: string,
    endpoint: string,
    body: Record<string, unknown>,
    onData: (data: T) => void
  ) {
    setLoading(key);
    try {
      let response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      let payload = await response.json();

      if (payload.requiresConfirmation) {
        const confirmed = window.confirm(
          "This workflow already has saved content. Replace it with a new AI draft?"
        );
        if (!confirmed) {
          toast.info("Kept the current saved draft.");
          return;
        }
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, confirmOverwrite: true })
        });
        payload = await response.json();
      }

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "AI workflow failed");
      }

      onData(payload.data);
      toast.success("AI draft generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  function addEstimateItem() {
    setEstimateItems((items) => [
      ...items,
      {
        id: newId(),
        category: "Custom",
        description: "",
        quantity: 1,
        unit: "each",
        unit_cost: 0,
        labour_hours: 0,
        labour_rate: profile.default_labour_rate ?? 72,
        markup_percentage: profile.default_markup ?? 25,
        total: 0
      }
    ]);
  }

  function updateEstimateItem(
    id: string,
    key: keyof EstimateDraftItem,
    value: string
  ) {
    setEstimateItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const next = {
          ...item,
          [key]:
            key === "category" || key === "description" || key === "unit"
              ? value
              : Number(value)
        };
        return { ...next, total: lineTotal(next) };
      })
    );
  }

  async function saveEstimate() {
    setLoading("save-estimate");
    try {
      const response = await fetch("/api/estimate-line-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, items: estimateItems })
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error);
      setEstimateItems(
        payload.data.items.map((item: EstimateDraftItem) => ({
          ...item,
          id: item.id ?? newId()
        }))
      );
      toast.success("Estimate saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save estimate");
    } finally {
      setLoading(null);
    }
  }

  async function saveProposal() {
    setLoading("save-proposal");
    try {
      const response = await fetch("/api/proposal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          title: proposalTitle,
          content: proposalContent,
          price: proposalPrice,
          status: proposal?.status ?? "Draft"
        })
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error);
      toast.success("Proposal saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save proposal");
    } finally {
      setLoading(null);
    }
  }

  const loadingIcon = (key: string) =>
    loading === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />;

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        <TabsTrigger value="estimate">Estimate</TabsTrigger>
        <TabsTrigger value="proposal">Proposal</TabsTrigger>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="crew">Crew Instructions</TabsTrigger>
        <TabsTrigger value="similar">Similar Past Jobs</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Job name" value={job.job_name} />
          <Field label="Client" value={job.client_name} />
          <Field label="Status" value={<StatusBadge status={job.status} />} />
          <Field label="Client email" value={job.client_email} />
          <Field label="Client phone" value={job.client_phone} />
          <Field label="Property address" value={job.property_address} />
          <Field label="Job type" value={job.job_type} />
          <Field label="Budget range" value={job.budget_range} />
          <Field label="Desired timeline" value={job.desired_timeline} />
          <Field label="Estimated value" value={formatCurrency(job.estimated_value)} />
          <Field label="Created" value={formatDate(job.created_at)} />
          <Field label="Updated" value={formatDate(job.updated_at)} />
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Notes from client" value={job.client_notes} />
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Site visit notes" value={job.site_visit_notes} />
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Measurements" value={job.measurements} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="files">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded files</CardTitle>
              <CardDescription>
                Images, PDFs, plans, supplier price lists, and notes stored with this job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bundle.files.length ? (
                <div className="grid gap-3">
                  {bundle.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      className="rounded-lg border bg-background p-4 transition-colors hover:bg-secondary/40"
                    >
                      <div className="font-medium">{file.file_name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {file.file_type ?? "Unknown type"} · Uploaded {formatDate(file.created_at)}
                      </div>
                      {file.extracted_text ? (
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                          {file.extracted_text}
                        </p>
                      ) : null}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
                  No files uploaded yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add files</CardTitle>
              <CardDescription>
                File metadata and text files can be used by AI workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={uploadJobFilesAction.bind(null, job.id)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="files">Files</Label>
                  <Input id="files" name="files" type="file" multiple />
                </div>
                <Button type="submit">
                  <FileUp className="h-4 w-4" />
                  Upload
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="analysis">
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() =>
              runWorkflow("analysis", "/api/ai/analyze", { jobId: job.id }, (data: AIAnalysis) =>
                setAnalysis({
                  ...data,
                  id: newId(),
                  job_id: job.id,
                  user_id: profile.id,
                  raw_json: data,
                  created_at: new Date().toISOString()
                })
              )
            }
            disabled={loading !== null}
          >
            {loadingIcon("analysis")}
            Analyze Job
          </Button>
        </div>
        {analysis ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {analysis.project_summary}
                </p>
              </CardContent>
            </Card>
            <InsightCard title="Missing information" items={analysis.missing_information} icon="warning" />
            <InsightCard title="Key risks" items={analysis.risks} icon="warning" />
            <InsightCard title="Suggested client questions" items={analysis.suggested_questions} />
            <InsightCard title="Potential upsells" items={analysis.upsells} />
            <Card>
              <CardHeader>
                <CardTitle>Complexity rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-3 flex-1 rounded-full ${
                        index < analysis.complexity_rating ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {analysis.complexity_rating} out of 5
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recommended next step</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {analysis.recommended_next_step}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <EmptyWorkflow message="Run AI analysis to organize notes, risks, questions, and next steps." />
        )}
      </TabsContent>

      <TabsContent value="estimate">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={addEstimateItem}
            disabled={loading !== null}
          >
            <Plus className="h-4 w-4" />
            Add line item
          </Button>
          <Button
            variant="outline"
            onClick={saveEstimate}
            disabled={loading !== null}
          >
            {loading === "save-estimate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Estimate
          </Button>
          <Button
            onClick={() =>
              runWorkflow(
                "estimate",
                "/api/ai/estimate",
                { jobId: job.id },
                (data: { items: EstimateDraftItem[] }) =>
                  setEstimateItems(
                    data.items.map((item) => ({
                      ...item,
                      id: newId(),
                      total: lineTotal(item)
                    }))
                  )
              )
            }
            disabled={loading !== null}
          >
            {loadingIcon("estimate")}
            Generate Draft Estimate with AI
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="px-2 py-3">Category</th>
                    <th className="px-2 py-3">Description</th>
                    <th className="px-2 py-3">Qty</th>
                    <th className="px-2 py-3">Unit</th>
                    <th className="px-2 py-3">Unit cost</th>
                    <th className="px-2 py-3">Labour hrs</th>
                    <th className="px-2 py-3">Rate</th>
                    <th className="px-2 py-3">Markup %</th>
                    <th className="px-2 py-3">Total</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {estimateItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-2 py-3">
                        <Input value={item.category} onChange={(event) => updateEstimateItem(item.id, "category", event.target.value)} />
                      </td>
                      <td className="px-2 py-3">
                        <Input value={item.description} onChange={(event) => updateEstimateItem(item.id, "description", event.target.value)} />
                      </td>
                      <td className="px-2 py-3">
                        <Input type="number" value={item.quantity} onChange={(event) => updateEstimateItem(item.id, "quantity", event.target.value)} />
                      </td>
                      <td className="px-2 py-3">
                        <Input value={item.unit} onChange={(event) => updateEstimateItem(item.id, "unit", event.target.value)} />
                      </td>
                      <td className="px-2 py-3">
                        <Input type="number" value={item.unit_cost} onChange={(event) => updateEstimateItem(item.id, "unit_cost", event.target.value)} />
                      </td>
                      <td className="px-2 py-3">
                        <Input type="number" value={item.labour_hours} onChange={(event) => updateEstimateItem(item.id, "labour_hours", event.target.value)} />
                      </td>
                      <td className="px-2 py-3">
                        <Input type="number" value={item.labour_rate} onChange={(event) => updateEstimateItem(item.id, "labour_rate", event.target.value)} />
                      </td>
                      <td className="px-2 py-3">
                        <Input type="number" value={item.markup_percentage} onChange={(event) => updateEstimateItem(item.id, "markup_percentage", event.target.value)} />
                      </td>
                      <td className="px-2 py-3 font-medium">{formatCurrency(lineTotal(item))}</td>
                      <td className="px-2 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEstimateItems((items) => items.filter((existing) => existing.id !== item.id))}
                          title="Delete line item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!estimateItems.length ? (
              <EmptyWorkflow message="Add line items manually or generate a draft estimate with AI." />
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <TotalCard label="Material total" value={totals.materialTotal} />
          <TotalCard label="Labour total" value={totals.labourTotal} />
          <TotalCard label="Markup" value={totals.markup} />
          <TotalCard label={`Tax ${profile.tax_rate ?? 0}%`} value={totals.tax} />
          <TotalCard label="Grand total" value={totals.grandTotal} strong />
        </div>
      </TabsContent>

      <TabsContent value="proposal">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={saveProposal}
            disabled={loading !== null}
          >
            {loading === "save-proposal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Proposal
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Download as PDF
          </Button>
          <Button
            onClick={() =>
              runWorkflow(
                "proposal",
                "/api/ai/proposal",
                { jobId: job.id, estimateTotal: totals.grandTotal },
                (data: { title: string; content: string; price: number }) => {
                  setProposalTitle(data.title);
                  setProposalContent(data.content);
                  setProposalPrice(data.price);
                  setProposal({
                    id: proposal?.id ?? newId(),
                    job_id: job.id,
                    user_id: profile.id,
                    title: data.title,
                    content: data.content,
                    price: data.price,
                    status: "Draft",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                }
              )
            }
            disabled={loading !== null}
          >
            {loadingIcon("proposal")}
            Generate Client Proposal
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Editable proposal</CardTitle>
            <CardDescription>
              Client-facing language only. Internal crew notes stay in the crew tab.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="proposal-title">Title</Label>
              <Input id="proposal-title" value={proposalTitle} onChange={(event) => setProposalTitle(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proposal-price">Investment</Label>
              <Input id="proposal-price" type="number" value={proposalPrice} onChange={(event) => setProposalPrice(Number(event.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proposal-content">Proposal content</Label>
              <Textarea
                id="proposal-content"
                className="min-h-[520px] font-mono text-sm leading-6"
                value={proposalContent}
                onChange={(event) => setProposalContent(event.target.value)}
                placeholder="Generate or write a client-ready proposal..."
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="materials">
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() =>
              runWorkflow(
                "materials",
                "/api/ai/materials",
                { jobId: job.id },
                (data: { items: MaterialDraftItem[] }) =>
                  setMaterials(data.items.map((item) => ({ ...item, id: newId() })))
              )
            }
            disabled={loading !== null}
          >
            {loadingIcon("materials")}
            Generate Material List with AI
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            {materials.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Estimated cost</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.material_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.supplier ?? "TBD"}</TableCell>
                      <TableCell>{formatCurrency(item.estimated_cost)}</TableCell>
                      <TableCell>{item.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyWorkflow message="Generate a material takeoff from job notes, measurements, and supplier files." />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="crew">
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() =>
              runWorkflow(
                "crew",
                "/api/ai/crew",
                { jobId: job.id },
                (data: { content: string }) => setCrewContent(data.content)
              )
            }
            disabled={loading !== null}
          >
            {loadingIcon("crew")}
            Generate Crew Instructions with AI
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Internal crew instructions</CardTitle>
            <CardDescription>
              Arrival notes, tools, materials, work plan, safety, quality, cleanup, and client-specific notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {crewContent ? (
              <Textarea
                className="min-h-[520px] font-mono text-sm leading-6"
                value={crewContent}
                onChange={(event) => setCrewContent(event.target.value)}
              />
            ) : (
              <EmptyWorkflow message="Generate internal instructions before handing the job to a crew manager." />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="similar">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() =>
              runWorkflow(
                "similar",
                "/api/ai/similar",
                { jobId: job.id },
                (data: { jobs: SimilarJob[] }) => setSimilarJobs(data.jobs)
              )
            }
            disabled={loading !== null}
          >
            {loadingIcon("similar")}
            Refresh Similar Jobs
          </Button>
        </div>
        {similarJobs.length ? (
          <div className="grid gap-4">
            {similarJobs.map((similar) => (
              <Card key={similar.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{similar.job_name}</CardTitle>
                      <CardDescription>{similar.job_type}</CardDescription>
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {Math.round(similar.score * 100)}% similar
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                  <Field label="Final price" value={formatCurrency(similar.final_price)} />
                  <Field label="Actual labour" value={similar.actual_labour_hours ? `${similar.actual_labour_hours} hrs` : null} />
                  <Field label="Profit margin" value={similar.profit_margin ? `${similar.profit_margin}%` : null} />
                  <Field label="Reason" value={similar.similarity_reason} />
                  <div className="md:col-span-2">
                    <Field label="Lessons learned" value={similar.lessons_learned} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Issues encountered" value={similar.issues_encountered} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyWorkflow message="Completed jobs with related project types, risks, measurements, or lessons will appear here." />
        )}
      </TabsContent>
    </Tabs>
  );
}

function InsightCard({
  title,
  items,
  icon
}: {
  title: string;
  items: string[];
  icon?: "warning";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon === "warning" ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="rounded-md bg-background p-3">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No items returned.</p>
        )}
      </CardContent>
    </Card>
  );
}

function TotalCard({
  label,
  value,
  strong
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <Card className={strong ? "border-primary" : undefined}>
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className={`mt-2 ${strong ? "text-2xl" : "text-xl"} font-semibold`}>
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyWorkflow({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
      <Calculator className="mx-auto mb-3 h-6 w-6 text-primary" />
      {message}
    </div>
  );
}
