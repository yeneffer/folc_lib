-- ============================================================================
-- Migration inicial do FolcLib
-- Executada automaticamente pelo Postgres na primeira subida do container
-- (volume montado em /docker-entrypoint-initdb.d).
-- ============================================================================

create extension if not exists "uuid-ossp";

create table if not exists public.items (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Habilita Row Level Security (boa pratica no padrao Supabase)
alter table public.items enable row level security;

-- Politica de exemplo: leitura publica
create policy "Leitura publica de items"
  on public.items
  for select
  using (true);

-- Dados de exemplo
insert into public.items (title, description)
values
  ('Primeiro item', 'Criado pela migration inicial'),
  ('Segundo item', 'Edite ou remova a vontade')
on conflict do nothing;
