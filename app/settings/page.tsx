import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/forms/settings-form";
import { getCurrentProfile } from "@/lib/data";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const profile = await getCurrentProfile();

  return (
    <AppShell
      profile={profile}
      title="Settings"
      description="Configure company defaults for estimating, proposals, suppliers, service area, and AI tone."
    >
      <SettingsForm profile={profile} saved={resolvedSearchParams.saved} />
    </AppShell>
  );
}
