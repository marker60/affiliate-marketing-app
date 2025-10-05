-- Create clicks table
create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  ip_address text,
  user_agent text,
  referer text,
  country text,
  city text,
  clicked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.clicks enable row level security;

-- RLS Policies - users can view clicks for their own links
create policy "clicks_select_own"
  on public.clicks for select
  using (
    exists (
      select 1 from public.links
      where links.id = clicks.link_id
      and links.user_id = auth.uid()
    )
  );

create policy "clicks_insert_any"
  on public.clicks for insert
  with check (true);

-- Create indexes
create index if not exists clicks_link_id_idx on public.clicks(link_id);
create index if not exists clicks_clicked_at_idx on public.clicks(clicked_at);
