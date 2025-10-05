-- Create usage table for tracking user activity/limits
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type in ('project', 'page', 'link', 'click')),
  count integer default 0,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, resource_type, period_start)
);

-- Enable RLS
alter table public.usage enable row level security;

-- RLS Policies
create policy "usage_select_own"
  on public.usage for select
  using (auth.uid() = user_id);

create policy "usage_insert_own"
  on public.usage for insert
  with check (auth.uid() = user_id);

create policy "usage_update_own"
  on public.usage for update
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists usage_user_id_idx on public.usage(user_id);
create index if not exists usage_period_idx on public.usage(period_start, period_end);
