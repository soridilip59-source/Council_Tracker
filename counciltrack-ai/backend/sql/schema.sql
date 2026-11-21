create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('super_admin','admin','council_member','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists councils (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category_id uuid references categories(id) on delete restrict,
  designation text not null,
  description text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists council_members (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references councils(id) on delete cascade,
  name text not null,
  email text,
  profile text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (council_id, name)
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references councils(id) on delete restrict,
  title text not null,
  description text not null default '',
  start_date date,
  deadline date not null,
  period text,
  status text not null default 'Not Started',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  assigned_member_id uuid references council_members(id) on delete set null,
  title text not null,
  description text not null default '',
  priority text not null default 'Medium',
  deadline date,
  status text not null default 'Pending',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function enforce_council_member_limit()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and (
    select count(*) from council_members where council_id = new.council_id
  ) >= 3 then
    raise exception 'A council can have a maximum of 3 members';
  end if;
  return new;
end;
$$;

drop trigger if exists council_members_limit on council_members;
create trigger council_members_limit before insert on council_members
for each row execute function enforce_council_member_limit();

create index if not exists idx_council_members_council_id on council_members(council_id);
create index if not exists idx_goals_council_id on goals(council_id);
create index if not exists idx_goals_deadline on goals(deadline);
create index if not exists idx_tasks_goal_id on tasks(goal_id);
create index if not exists idx_tasks_assigned_member_id on tasks(assigned_member_id);
create index if not exists idx_tasks_status on tasks(status);
