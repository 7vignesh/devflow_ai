create table if not exists users (
  id uuid primary key,
  email text unique not null,
  plan text default 'free',
  stripe_customer_id text,
  runs_this_month int default 0,
  runs_month text not null default to_char(timezone('utc', now()), 'YYYY-MM'),
  created_at timestamptz default now()
);

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  tool text not null,
  input jsonb,
  output text,
  tokens_used int,
  created_at timestamptz default now()
);

create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  description text,
  steps jsonb,
  created_at timestamptz default now()
);
