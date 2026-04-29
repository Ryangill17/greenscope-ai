create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  company_name text,
  company_logo_url text,
  phone text,
  address text,
  default_labour_rate numeric default 72,
  default_markup numeric default 25,
  tax_rate numeric default 0,
  proposal_terms text,
  preferred_suppliers text,
  service_area text,
  ai_tone text default 'Professional' check (ai_tone in ('Professional', 'Friendly', 'Premium', 'Simple')),
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_name text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  property_address text,
  job_type text not null,
  status text not null default 'Lead' check (status in ('Lead', 'Site Visit', 'Estimating', 'Proposal Sent', 'Accepted', 'In Progress', 'Completed', 'Lost')),
  budget_range text,
  desired_timeline text,
  client_notes text,
  site_visit_notes text,
  measurements text,
  estimated_value numeric default 0,
  final_value numeric,
  actual_labour_hours numeric,
  profit_margin numeric,
  lessons_learned text,
  issues_encountered text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_files (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  extracted_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_summary text not null,
  missing_information text[] not null default '{}',
  risks text[] not null default '{}',
  suggested_questions text[] not null default '{}',
  upsells text[] not null default '{}',
  complexity_rating integer not null check (complexity_rating between 1 and 5),
  recommended_next_step text not null,
  raw_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.estimate_line_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  description text not null,
  quantity numeric not null default 0,
  unit text not null,
  unit_cost numeric not null default 0,
  labour_hours numeric not null default 0,
  labour_rate numeric not null default 0,
  markup_percentage numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  price numeric not null default 0,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  material_name text not null,
  quantity numeric not null default 0,
  unit text not null,
  supplier text,
  estimated_cost numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.crew_instructions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_proposals_updated_at on public.proposals;
create trigger set_proposals_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

drop trigger if exists set_crew_instructions_updated_at on public.crew_instructions;
create trigger set_crew_instructions_updated_at
before update on public.crew_instructions
for each row execute function public.set_updated_at();

create index if not exists jobs_user_id_updated_at_idx on public.jobs(user_id, updated_at desc);
create index if not exists jobs_user_id_status_idx on public.jobs(user_id, status);
create index if not exists job_files_job_id_idx on public.job_files(job_id);
create index if not exists estimate_line_items_job_id_idx on public.estimate_line_items(job_id);
create index if not exists material_items_job_id_idx on public.material_items(job_id);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_files enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.estimate_line_items enable row level security;
alter table public.proposals enable row level security;
alter table public.material_items enable row level security;
alter table public.crew_instructions enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Jobs are owned by user"
on public.jobs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Job files are owned by user"
on public.job_files for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "AI analyses are owned by user"
on public.ai_analyses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Estimate items are owned by user"
on public.estimate_line_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Proposals are owned by user"
on public.proposals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Material items are owned by user"
on public.material_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Crew instructions are owned by user"
on public.crew_instructions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, company_name)
  values (new.id, new.email, new.raw_user_meta_data->>'company_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('job-files', 'job-files', true)
on conflict (id) do nothing;

create policy "Users can read their own job files"
on storage.objects for select
using (
  bucket_id = 'job-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their own job files"
on storage.objects for insert
with check (
  bucket_id = 'job-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own job files"
on storage.objects for update
using (
  bucket_id = 'job-files'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'job-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own job files"
on storage.objects for delete
using (
  bucket_id = 'job-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);
