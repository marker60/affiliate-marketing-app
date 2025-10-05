-- Create links table
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  short_code text unique not null,
  original_url text not null,
  title text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.links enable row level security;

-- RLS Policies
create policy "links_select_own"
  on public.links for select
  using (auth.uid() = user_id);

create policy "links_insert_own"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "links_update_own"
  on public.links for update
  using (auth.uid() = user_id);

create policy "links_delete_own"
  on public.links for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists links_page_id_idx on public.links(page_id);
create index if not exists links_user_id_idx on public.links(user_id);
create index if not exists links_short_code_idx on public.links(short_code);
