-- ============================================================================
-- FolcLib — Migration 0003: seed inicial
-- Categorias (RF08) e FAQ (NF02) sao inseridos em qualquer ambiente.
-- Usuarios de teste e conteudo de exemplo so sao inseridos em ambiente LOCAL
-- (sem o schema auth do Supabase), pois profiles.id referencia auth.users na
-- nuvem — la os usuarios devem ser criados via Auth/signup.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Categorias (RF08)
-- ----------------------------------------------------------------------------
insert into public.categories (nome, slug, tipo) values
  ('Costumes',     'costumes',     'tema'),
  ('Folclore',     'folclore',     'tema'),
  ('Gastronomica', 'gastronomica', 'tema'),
  ('Lendas',       'lendas',       'formato'),
  ('Musica',       'musica',       'formato'),
  ('Receitas',     'receitas',     'formato')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- FAQ (NF02)
-- ----------------------------------------------------------------------------
insert into public.faq (pergunta, resposta, ordem) values
  ('O que e a plataforma FolcLib?',
   'E uma plataforma educacional colaborativa sobre cultura e folclore brasileiro, com acervo multimidia para alunos, professores e a comunidade.', 1),
  ('Preciso criar conta para acessar o acervo?',
   'Nao. Visitantes podem explorar o acervo publico. O cadastro libera recursos personalizados como trilhas, recomendacoes e turmas.', 2),
  ('Como contribuo com um conteudo?',
   'Acesse o menu "Colaborar", preencha o formulario e anexe os arquivos. O conteudo passa por curadoria antes de ser publicado.', 3),
  ('Como funciona a curadoria?',
   'Avaliadores verificam veracidade, representatividade e adequacao cultural de cada conteudo antes da publicacao.', 4),
  ('Encontrei um erro. Como reporto?',
   'Use a opcao "Relatar erro" disponivel no site, descrevendo o problema. A equipe sera notificada.', 5)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Usuarios de teste + conteudo de exemplo (somente ambiente LOCAL)
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'auth' and table_name = 'users'
  ) then
    raise notice 'Ambiente Supabase detectado: pulando seed de usuarios de teste.';
    return;
  end if;

  -- Um usuario por perfil (UUIDs fixos para reprodutibilidade)
  insert into public.profiles (id, nome, email, role) values
    ('11111111-1111-1111-1111-111111111111', 'Aluno Teste',       'aluno@folclib.test',       'aluno'),
    ('22222222-2222-2222-2222-222222222222', 'Professor Teste',   'professor@folclib.test',   'professor'),
    ('33333333-3333-3333-3333-333333333333', 'Avaliador Teste',   'avaliador@folclib.test',   'avaliador'),
    ('44444444-4444-4444-4444-444444444444', 'Colaborador Teste', 'colaborador@folclib.test', 'colaborador')
  on conflict (id) do nothing;

  -- Conteudo de exemplo (aprovado) ligado a categorias
  insert into public.contents (id, titulo, descricao, tipo, status, autor_id, origem_cultural, estado, pedagogico, published_at)
  values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'Lenda do Saci-Perere',
     'Conheca a lenda do Saci, figura marcante do folclore brasileiro.',
     'lenda', 'aprovado', '44444444-4444-4444-4444-444444444444', 'Sudeste', 'SP', true, now()),
    ('aaaaaaaa-0000-0000-0000-000000000002', 'Receita de Acaraje',
     'Quitute baiano de origem afro-brasileira.',
     'receita', 'aprovado', '44444444-4444-4444-4444-444444444444', 'Nordeste', 'BA', false, now())
  on conflict (id) do nothing;

  insert into public.content_categories (content_id, category_id)
  select c.id, cat.id
  from public.contents c
  join public.categories cat on (
    (c.tipo = 'lenda'   and cat.slug = 'folclore') or
    (c.tipo = 'receita' and cat.slug = 'gastronomica')
  )
  where c.id in (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002'
  )
  on conflict do nothing;

  raise notice 'Seed local aplicado: 4 usuarios de teste e 2 conteudos de exemplo.';
end $$;
