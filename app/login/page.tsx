import Link from "next/link";
import { Leaf } from "lucide-react";

import { signInAction } from "@/app/actions/auth";
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

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          GreenScope AI
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to manage landscaping jobs, estimates, proposals, and crew plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resolvedSearchParams.error ? (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {resolvedSearchParams.error}
              </div>
            ) : null}
            <form action={signInAction} className="grid gap-4">
              <input type="hidden" name="next" value={resolvedSearchParams.next ?? "/dashboard"} />
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="owner@company.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Start free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
