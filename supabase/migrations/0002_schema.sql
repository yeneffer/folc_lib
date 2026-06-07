-- ============================================================================
-- FolcLib — Migration 0002: schema completo do dominio
-- Base: documentacao/CONTRATOS-API.md (modelo de dados)
-- Tabelas com RLS habilitado e politicas por perfil.
-- Compativel com Postgres local (docker) e Supabase (cloud): a FK para
-- auth.users so e aplicada quando o schema auth existe.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Enums compartilhados (espelham CONTRATOS-API.md)
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('aluno', 'professor', 'avaliador', 'colaborador');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_type as enum ('video', 'poema', 'lenda', 'texto', 'imagem', 'receita', 'musica');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum ('rascunho', 'em_avaliacao', 'aprovado', 'rejeitado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type curation_decision as enum ('aprovado', 'ajustes_solicitados', 'rejeitado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contribution_status as enum ('recebida', 'em_avaliacao', 'aprovada', 'rejeitada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type assignment_status as enum ('pendente', 'concluido', 'atrasado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type error_report_status as enum ('aberto', 'em_analise', 'resolvido');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Helpers: updated_at automatico + papel do usuario logado
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Retorna o papel do usuario autenticado (usado nas politicas RLS).
-- security definer para conseguir ler profiles sem recursao de RLS.
create or replace function public.current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ----------------------------------------------------------------------------
-- profiles (RF02) — 1:1 com auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  email       text not null unique,
  role        user_role not null default 'aluno',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- FK para auth.users apenas se o schema auth existir (Supabase)
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'auth' and table_name = 'users'
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey foreign key (id)
      references auth.users (id) on delete cascade;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- terms_acceptances (RF01, NF05, LGPD)
-- ----------------------------------------------------------------------------
create table if not exists public.terms_acceptances (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  terms_version text not null,
  ip            text,
  accepted_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- categories (RF08)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  slug        text not null unique,
  tipo        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- contents (RF03) — acervo
-- ----------------------------------------------------------------------------
create table if not exists public.contents (
  id              uuid primary key default uuid_generate_v4(),
  titulo          text not null,
  descricao       text,
  tipo            content_type not null,
  status          content_status not null default 'em_avaliacao',
  autor_id        uuid references public.profiles (id) on delete set null,
  origem_cultural text,
  estado          text,
  evento          text,
  comunidade      text,
  ano             int,
  media_url       text,
  thumb_url       text,
  pedagogico      boolean not null default false,
  metadata        jsonb not null default '{}'::jsonb,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_contents_status on public.contents (status);
create index if not exists idx_contents_tipo on public.contents (tipo);
create index if not exists idx_contents_estado on public.contents (estado);

-- ----------------------------------------------------------------------------
-- content_categories (N:N)
-- ----------------------------------------------------------------------------
create table if not exists public.content_categories (
  content_id  uuid not null references public.contents (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (content_id, category_id)
);

-- ----------------------------------------------------------------------------
-- curation_reviews (RF04)
-- ----------------------------------------------------------------------------
create table if not exists public.curation_reviews (
  id           uuid primary key default uuid_generate_v4(),
  content_id   uuid not null references public.contents (id) on delete cascade,
  avaliador_id uuid not null references public.profiles (id) on delete cascade,
  decisao      curation_decision not null,
  comentario   text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_reviews_content on public.curation_reviews (content_id);

-- ----------------------------------------------------------------------------
-- contributions (RF05) — permite visitante (colaborador_id nulo)
-- ----------------------------------------------------------------------------
create table if not exists public.contributions (
  id             uuid primary key default uuid_generate_v4(),
  colaborador_id uuid references public.profiles (id) on delete set null,
  titulo         text not null,
  descricao      text not null,
  arquivos       jsonb not null default '[]'::jsonb,
  status         contribution_status not null default 'recebida',
  nome_contato   text,
  email_contato  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- classes / turmas (DesignPdf professor)
-- ----------------------------------------------------------------------------
create table if not exists public.classes (
  id           uuid primary key default uuid_generate_v4(),
  professor_id uuid not null references public.profiles (id) on delete cascade,
  nome         text not null,
  codigo       text not null unique,
  descricao    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.class_students (
  class_id   uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- ----------------------------------------------------------------------------
-- assignments (prazos) + assignment_progress (prazo feito)
-- ----------------------------------------------------------------------------
create table if not exists public.assignments (
  id          uuid primary key default uuid_generate_v4(),
  class_id    uuid not null references public.classes (id) on delete cascade,
  titulo      text not null,
  descricao   text,
  content_id  uuid references public.contents (id) on delete set null,
  due_date    timestamptz not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.assignment_progress (
  id            uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  status        assignment_status not null default 'pendente',
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (assignment_id, student_id)
);

-- ----------------------------------------------------------------------------
-- content_access_history (RF07) — progresso/recomendacao
-- ----------------------------------------------------------------------------
create table if not exists public.content_access_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  content_id  uuid not null references public.contents (id) on delete cascade,
  accessed_at timestamptz not null default now()
);
create index if not exists idx_history_user on public.content_access_history (user_id);

-- ----------------------------------------------------------------------------
-- favorites (RF06 offline / favoritar)
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null references public.contents (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- ----------------------------------------------------------------------------
-- faq (NF02)
-- ----------------------------------------------------------------------------
create table if not exists public.faq (
  id         uuid primary key default uuid_generate_v4(),
  pergunta   text not null,
  resposta   text not null,
  ordem      int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- error_reports (NF04) — permite visitante (user_id nulo)
-- ----------------------------------------------------------------------------
create table if not exists public.error_reports (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles (id) on delete set null,
  descricao  text not null,
  url        text,
  status     error_report_status not null default 'aberto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Triggers updated_at
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','categories','contents','contributions','classes',
    'assignments','assignment_progress','faq','error_reports'
  ] loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;

-- ============================================================================
-- Row Level Security — habilitar e definir politicas por perfil
-- (o backend usa service role e ignora RLS; estas politicas protegem o
--  acesso direto do frontend com a anon key.)
-- ============================================================================
alter table public.profiles              enable row level security;
alter table public.terms_acceptances     enable row level security;
alter table public.categories            enable row level security;
alter table public.contents              enable row level security;
alter table public.content_categories    enable row level security;
alter table public.curation_reviews      enable row level security;
alter table public.contributions         enable row level security;
alter table public.classes               enable row level security;
alter table public.class_students        enable row level security;
alter table public.assignments           enable row level security;
alter table public.assignment_progress   enable row level security;
alter table public.content_access_history enable row level security;
alter table public.favorites             enable row level security;
alter table public.faq                   enable row level security;
alter table public.error_reports         enable row level security;

-- profiles: cada um le/edita o proprio; avaliador/professor leem todos
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.current_user_role() in ('professor','avaliador'));
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());

-- terms_acceptances: dono
create policy terms_select_self on public.terms_acceptances
  for select using (user_id = auth.uid());
create policy terms_insert_self on public.terms_acceptances
  for insert with check (user_id = auth.uid());

-- categories e faq: leitura publica
create policy categories_public_read on public.categories for select using (true);
create policy faq_public_read on public.faq for select using (true);

-- contents: leitura publica do que esta aprovado; autor e avaliador veem o resto
create policy contents_public_read on public.contents
  for select using (
    status = 'aprovado'
    or autor_id = auth.uid()
    or public.current_user_role() = 'avaliador'
  );
create policy contents_insert on public.contents
  for insert with check (
    public.current_user_role() in ('colaborador','avaliador','professor')
  );
create policy contents_update on public.contents
  for update using (
    autor_id = auth.uid() or public.current_user_role() = 'avaliador'
  );

-- content_categories: segue visibilidade do conteudo (leitura publica simples)
create policy content_categories_read on public.content_categories for select using (true);

-- curation_reviews: somente avaliador
create policy reviews_avaliador on public.curation_reviews
  for all using (public.current_user_role() = 'avaliador')
  with check (public.current_user_role() = 'avaliador');

-- contributions: dono ve as proprias; avaliador ve todas; insert aberto (visitante)
create policy contributions_select on public.contributions
  for select using (colaborador_id = auth.uid() or public.current_user_role() = 'avaliador');
create policy contributions_insert on public.contributions
  for insert with check (true);

-- classes: professor dono; aluno membro
create policy classes_professor on public.classes
  for all using (professor_id = auth.uid()) with check (professor_id = auth.uid());
create policy classes_student_read on public.classes
  for select using (
    exists (select 1 from public.class_students cs
            where cs.class_id = id and cs.student_id = auth.uid())
  );

-- class_students: professor da turma gerencia; aluno ve o proprio vinculo
create policy class_students_professor on public.class_students
  for all using (
    exists (select 1 from public.classes c
            where c.id = class_id and c.professor_id = auth.uid())
  ) with check (
    exists (select 1 from public.classes c
            where c.id = class_id and c.professor_id = auth.uid())
  );
create policy class_students_self_read on public.class_students
  for select using (student_id = auth.uid());

-- assignments: professor da turma gerencia; aluno membro le
create policy assignments_professor on public.assignments
  for all using (
    exists (select 1 from public.classes c
            where c.id = class_id and c.professor_id = auth.uid())
  ) with check (
    exists (select 1 from public.classes c
            where c.id = class_id and c.professor_id = auth.uid())
  );
create policy assignments_student_read on public.assignments
  for select using (
    exists (select 1 from public.class_students cs
            where cs.class_id = class_id and cs.student_id = auth.uid())
  );

-- assignment_progress: aluno gerencia o proprio; professor da turma le
create policy progress_student on public.assignment_progress
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy progress_professor_read on public.assignment_progress
  for select using (
    exists (
      select 1 from public.assignments a
      join public.classes c on c.id = a.class_id
      where a.id = assignment_id and c.professor_id = auth.uid()
    )
  );

-- content_access_history e favorites: dono
create policy history_self on public.content_access_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy favorites_self on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- error_reports: insert aberto (visitante); dono e avaliador leem
create policy error_reports_insert on public.error_reports
  for insert with check (true);
create policy error_reports_select on public.error_reports
  for select using (user_id = auth.uid() or public.current_user_role() = 'avaliador');
