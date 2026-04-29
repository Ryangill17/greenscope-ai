import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  ClipboardCheck,
  FileText,
  Hammer,
  Layers3,
  ListChecks,
  Search,
  Sparkles,
  Sprout
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI Job Analysis",
    description:
      "Turn messy notes, photos, measurements, and files into risk flags, missing details, questions, and recommended next steps.",
    icon: Sparkles
  },
  {
    title: "Estimate Builder",
    description:
      "Create structured line items with material, labour, markup, tax, and assumptions your estimator can edit before sending.",
    icon: ClipboardCheck
  },
  {
    title: "Proposal Generator",
    description:
      "Produce polished client-ready proposals with clear scope, exclusions, timeline, add-ons, terms, and pricing.",
    icon: FileText
  },
  {
    title: "Material Takeoff",
    description:
      "Generate supplier-aware material lists from measurements, job type, notes, and uploaded pricing information.",
    icon: Layers3
  },
  {
    title: "Crew Instructions",
    description:
      "Separate internal work plans from client-facing language with tools, steps, safety notes, and quality checklists.",
    icon: ListChecks
  },
  {
    title: "Searchable Past Jobs",
    description:
      "Find comparable completed jobs, pricing examples, supplier issues, crew notes, and lessons learned.",
    icon: BookOpenText
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <Image
          src="/images/greenscope-hero.png"
          alt="Landscaping estimator reviewing a residential project site with digital planning tools"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-950/55 to-emerald-950/20" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/15 backdrop-blur">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold">GreenScope AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/82 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#workflow" className="hover:text-white">
              Workflow
            </a>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-84px)] max-w-7xl items-center px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Workflow-based AI for landscaping operators
            </div>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-normal sm:text-6xl">
              AI estimating and proposal software for landscaping companies
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/88">
              Upload notes, photos, plans, and supplier pricing. GreenScope AI
              turns them into accurate scopes, estimates, proposals, and crew
              instructions.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-emerald-950 hover:bg-white/90">
                <Link href="/signup">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/dashboard">Book Demo</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="relative z-10 bg-background/95 px-4 py-4 backdrop-blur md:absolute md:bottom-0 md:left-0 md:right-0">
          <div className="mx-auto grid max-w-7xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Search past jobs and lessons
            </div>
            <div className="flex items-center gap-2">
              <Hammer className="h-4 w-4 text-primary" />
              Plan materials and crews
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Generate client-ready proposals
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-primary">
              Structured AI features
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Built around the way landscaping teams actually sell and deliver work
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-secondary">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">
              From lead to lessons learned
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              One operating system for estimates, proposals, production, and knowledge
            </h2>
            <p className="mt-4 text-muted-foreground">
              GreenScope AI organizes job intake into repeatable workflows. Your
              team keeps control of pricing and edits, while AI prepares drafts,
              flags risk, and turns completed work into searchable company memory.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard">
                Explore demo workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {[
              "Capture client request, notes, files, plans, and supplier pricing",
              "Analyze missing information, risks, upsells, and client questions",
              "Generate editable estimates, material takeoffs, and proposals",
              "Create internal crew instructions and quality checklists",
              "Search completed jobs for pricing, supplier, and production lessons"
            ].map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-4 rounded-lg border bg-background p-4"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
