-- Function to create admin_settings table
create or replace function create_admin_settings()
returns void
language plpgsql
security definer
as $$
begin
  -- Create admin_settings table if it doesn't exist
  create table if not exists public.admin_settings (
    id uuid default uuid_generate_v4() primary key,
    openai_api_key text,
    openai_model text default 'gpt-4',
    twilio_account_sid text,
    twilio_auth_token text,
    twilio_phone_number text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  -- Enable RLS
  alter table public.admin_settings enable row level security;

  -- Drop existing policy if it exists
  drop policy if exists "Allow full access to admins" on public.admin_settings;

  -- Create RLS policy for admin access
  create policy "Allow full access to admins" on public.admin_settings
    using (
      exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    );

  -- Create updated_at trigger function if it doesn't exist
  create or replace function update_updated_at_column()
  returns trigger as $$
  begin
      new.updated_at = now();
      return new;
  end;
  $$ language plpgsql;

  -- Drop existing trigger if it exists
  drop trigger if exists update_admin_settings_updated_at on public.admin_settings;

  -- Create trigger for updated_at
  create trigger update_admin_settings_updated_at
    before update on public.admin_settings
    for each row
    execute function update_updated_at_column();

  -- Insert default row if table is empty
  if not exists (select 1 from public.admin_settings) then
    insert into public.admin_settings (id, openai_model)
    values ('00000000-0000-0000-0000-000000000000', 'gpt-4');
  end if;
end;
$$;