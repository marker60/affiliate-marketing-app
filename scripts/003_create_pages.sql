-- Create pages table
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content jsonb,
  slug text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pages enable row level security;

-- RLS Policies
create policy "pages_select_own"
  on public.pages for select
  using (auth.uid() = user_id);

create policy "pages_insert_own"
  on public.pages for insert
  with check (auth.uid() = user_id);

create policy "pages_update_own"
  on public.pages for update
  using (auth.uid() = user_id);

create policy "pages_delete_own"
  on public.pages for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists pages_project_id_idx on public.pages(project_id);
create index if not exists pages_user_id_idx on public.pages(user_id);
create index if not exists pages_slug_idx on public.pages(slug);
