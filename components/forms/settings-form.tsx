import { updateSettingsAction } from "@/app/actions/settings";
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
import { aiTones, type Profile } from "@/lib/types";

export function SettingsForm({
  profile,
  saved
}: {
  profile: Profile;
  saved?: string;
}) {
  return (
    <form action={updateSettingsAction} className="grid gap-6">
      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Settings saved.
        </div>
      ) : null}
      <input type="hidden" name="existing_logo_url" value={profile.company_logo_url ?? ""} />

      <Card>
        <CardHeader>
          <CardTitle>Company profile</CardTitle>
          <CardDescription>
            Used in proposals, default estimate settings, and crew documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input id="company_name" name="company_name" defaultValue={profile.company_name ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" name="logo" type="file" accept="image/*" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={profile.email} disabled />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={profile.address ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service_area">Service area</Label>
            <Input id="service_area" name="service_area" defaultValue={profile.service_area ?? ""} placeholder="Portland metro" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ai_tone">AI tone</Label>
            <Select id="ai_tone" name="ai_tone" defaultValue={profile.ai_tone ?? "Professional"}>
              {aiTones.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimating defaults</CardTitle>
          <CardDescription>
            AI drafts use these values unless supplier pricing or job files provide better data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="default_labour_rate">Default labour rate</Label>
            <Input id="default_labour_rate" name="default_labour_rate" type="number" step="0.01" defaultValue={profile.default_labour_rate ?? 72} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default_markup">Default markup percentage</Label>
            <Input id="default_markup" name="default_markup" type="number" step="0.01" defaultValue={profile.default_markup ?? 25} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tax_rate">Tax rate</Label>
            <Input id="tax_rate" name="tax_rate" type="number" step="0.01" defaultValue={profile.tax_rate ?? 0} />
          </div>
          <div className="grid gap-2 md:col-span-3">
            <Label htmlFor="preferred_suppliers">Preferred suppliers</Label>
            <Textarea id="preferred_suppliers" name="preferred_suppliers" defaultValue={profile.preferred_suppliers ?? ""} placeholder="SiteOne, Local Stone Yard, Green Valley Nursery" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposal terms</CardTitle>
          <CardDescription>
            Default terms appended to generated proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="proposal_terms"
            name="proposal_terms"
            className="min-h-[180px]"
            defaultValue={profile.proposal_terms ?? ""}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save settings</Button>
      </div>
    </form>
  );
}
