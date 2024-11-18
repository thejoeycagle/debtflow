-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'agent')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create debtors table
create table public.debtors (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text,
  phone text,
  total_debt numeric not null default 0,
  status text check (status in ('new', 'in_progress', 'pending', 'resolved')) not null default 'new',
  last_contact timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) policies
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Admin users can view all profiles"
  on profiles for select
  using ( exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  ));

-- Enable RLS on tables
alter table public.profiles enable row level security;
alter table public.debtors enable row level security;

-- Create stored procedures for table creation
create or replace function create_profiles_table()
returns void as $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    create table public.profiles (
      id uuid references auth.users on delete cascade not null primary key,
      email text unique not null,
      full_name text,
      role text check (role in ('admin', 'agent')) not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    
    alter table public.profiles enable row level security;
  end if;
end;
$$ language plpgsql security definer;

create or replace function create_debtors_table()
returns void as $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'debtors') then
    create table public.debtors (
      id uuid default uuid_generate_v4() primary key,
      full_name text not null,
      email text,
      phone text,
      total_debt numeric not null default 0,
      status text check (status in ('new', 'in_progress', 'pending', 'resolved')) not null default 'new',
      last_contact timestamp with time zone,
      notes text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    
    alter table public.debtors enable row level security;
  end if;
end;
$$ language plpgsql security definer;