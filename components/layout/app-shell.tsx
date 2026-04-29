import Link from "next/link";
import { Sprout } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { SidebarNav, MobileBrand } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

type AppShellProps = {
  profile: Profile;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  profile,
  title,
  description,
  action,
  children
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r bg-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-2 border-b px-5">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sprout className="h-5 w-5" />
              </span>
              <span>GreenScope AI</span>
            </Link>
          </div>
          <div className="flex-1 p-4">
            <SidebarNav />
          </div>
          <div className="border-t p-4">
            <div className="mb-3 rounded-md bg-secondary/80 p-3">
              <p className="truncate text-sm font-medium">
                {profile.company_name ?? "Demo landscaping company"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <form action={signOutAction}>
              <Button className="w-full" variant="outline" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="lg:hidden">
                <MobileBrand />
              </div>
              <div className="hidden min-w-0 lg:block">
                <h1 className="truncate text-2xl font-semibold">{title}</h1>
                {description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">{action}</div>
            </div>
            <div className="border-t px-4 py-2 lg:hidden">
              <SidebarNav />
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 lg:hidden">
              <h1 className="text-2xl font-semibold">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
