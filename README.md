# GreenScope AI

AI-powered operating system for landscaping companies. This MVP is a workflow-based SaaS dashboard for job intake, AI analysis, estimates, proposals, material takeoffs, crew instructions, and searchable completed-job knowledge.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Supabase Auth, Postgres, Storage, and RLS
- OpenAI API with structured JSON validation via zod

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Without Supabase/OpenAI environment variables, the app runs in demo mode with seeded in-code landscaping jobs and deterministic AI fallbacks. Add real credentials to use authentication, persistence, uploads, and OpenAI generation.

## Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is reserved for future admin/background tasks; the MVP uses user-scoped Supabase clients and RLS.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create a Supabase Auth user.
4. Optional: update the UUID in `supabase/seed.sql` to that user id and run it for demo records.
5. Add the Supabase URL and anon key to `.env.local`.

The schema creates:

- `profiles`
- `jobs`
- `job_files`
- `ai_analyses`
- `estimate_line_items`
- `proposals`
- `material_items`
- `crew_instructions`
- `job-files` storage bucket
- RLS policies so users only access their own rows and files

## AI Workflows

Backend routes:

- `POST /api/ai/analyze`
- `POST /api/ai/estimate`
- `POST /api/ai/proposal`
- `POST /api/ai/materials`
- `POST /api/ai/crew`
- `POST /api/ai/similar`

AI responses are validated with zod before saving. Estimate, proposal, material, and crew generation routes return `requiresConfirmation: true` when saved content already exists, so user edits are not overwritten without explicit confirmation.

## Product Areas

- Landing page with landscaping SaaS positioning
- Supabase login/signup/logout
- Dashboard metrics and recent jobs
- Jobs table/card list with search
- Create job form with uploads
- Job detail workflow tabs:
  - Overview
  - Files
  - AI Analysis
  - Estimate
  - Proposal
  - Materials
  - Crew Instructions
  - Similar Past Jobs
- Knowledge Base search over completed jobs
- Settings for company defaults, proposal terms, suppliers, service area, and AI tone

## Useful Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```
