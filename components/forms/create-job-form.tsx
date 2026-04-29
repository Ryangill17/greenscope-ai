import { createJobAction } from "@/app/actions/jobs";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { jobTypes } from "@/lib/types";

export function CreateJobForm({ error }: { error?: string }) {
  return (
    <form action={createJobAction} className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Client and job details</CardTitle>
          <CardDescription>
            Capture the core information estimators and sales reps need before AI workflows run.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="job_name">Job name</Label>
            <Input id="job_name" name="job_name" required placeholder="Maple Ridge Front Yard Refresh" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client_name">Client name</Label>
            <Input id="client_name" name="client_name" required placeholder="Avery Thompson" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client_email">Client email</Label>
            <Input id="client_email" name="client_email" type="email" placeholder="client@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client_phone">Client phone</Label>
            <Input id="client_phone" name="client_phone" placeholder="(555) 018-1020" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="property_address">Property address</Label>
            <Input id="property_address" name="property_address" placeholder="44 Maple Ridge Lane" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="job_type">Job type</Label>
            <Select id="job_type" name="job_type" defaultValue="Garden bed installation">
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budget_range">Budget range</Label>
            <Input id="budget_range" name="budget_range" placeholder="$8,000 - $12,000" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desired_timeline">Desired timeline</Label>
            <Input id="desired_timeline" name="desired_timeline" placeholder="Before Memorial Day weekend" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimated_value">Initial estimated value</Label>
            <Input id="estimated_value" name="estimated_value" type="number" min="0" step="0.01" placeholder="10850" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scope notes</CardTitle>
          <CardDescription>
            Messy information is fine; GreenScope AI will organize it into structured outputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client_notes">Notes from client</Label>
            <Textarea id="client_notes" name="client_notes" placeholder="Client goals, preferences, pain points, photos described, budget comments..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="site_visit_notes">Site visit notes</Label>
            <Textarea id="site_visit_notes" name="site_visit_notes" placeholder="Access, drainage, slope, existing materials, removals, constraints..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="measurements">Measurements</Label>
            <Textarea id="measurements" name="measurements" placeholder="Square footage, linear feet, depths, areas, counts, access dimensions..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="files">Upload files, photos, plans, notes, or supplier lists</Label>
            <Input id="files" name="files" type="file" multiple />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Create job</Button>
      </div>
    </form>
  );
}
