# Arquitetura — FolcLib

Plataforma educacional colaborativa sobre cultura e folclore brasileiro. Documento de arquitetura **modular** que orienta o desenvolvimento. Base: `Req-software_FOLCLIB` (RF01–RF08, NF01–NF05, requisitos éticos e técnicos) + protótipos em `DesignPdf/`.

> **Divergência registrada:** o RE03 do documento especifica backend em **Laravel (MVC)**. O projeto adota **NestJS** (decisão do time). NestJS atende ao mesmo princípio — arquitetura modular em camadas (Controller → Service → Repository), APIs REST e middleware de autenticação — então o requisito é cumprido em espírito com stack diferente. O RE04 pede **React**; **Next.js** satisfaz (é React).

## Princípios

1. **Modularidade por domínio** — cada funcionalidade é um módulo isolado, com fronteiras claras, para que manutenção e evolução sejam locais (não rippling).
2. **Backend primeiro** — o backend define o contrato (tipos + endpoints). O frontend consome. Ver [TAREFAS.md](./TAREFAS.md).
3. **Contrato único** — tipos de request/response são a fonte da verdade compartilhada. Ver [CONTRATOS-API.md](./CONTRATOS-API.md).
4. **Segurança por padrão** — RLS no banco, service role só no servidor, RBAC por perfil, LGPD desde o desenho.
5. **Camadas finas e testáveis** — regra de negócio no service; controller/route só orquestram.

## Atores e perfis (RF02)

| Perfil | Papel | Acesso principal |
|---|---|---|
| **Aluno** | Consome o acervo, trilhas, recebe recomendações | acervo, conteúdo, perfil, turmas (como membro) |
| **Professor** | Acompanha alunos, monta turmas e prazos | acervo, turmas, prazos, progresso dos alunos |
| **Avaliador** | Curadoria do conteúdo (aprova/rejeita) | painel de curadoria |
| **Colaborador** | Envia conteúdo para o acervo | formulário de colaboração |
| **Visitante** | Consome acervo público e pode colaborar | acervo (público), colaborar |

RBAC: papel guardado em `profiles.role`; aplicado por `RolesGuard` (back) e por guards de rota (front).

---

## Backend — NestJS (modular)

Cada módulo de domínio segue o mesmo formato:

```
backend/src/<modulo>/
├── <modulo>.module.ts        # wiring do módulo
├── <modulo>.controller.ts    # rotas HTTP (camada fina)
├── <modulo>.service.ts       # regra de negócio
├── <modulo>.repository.ts    # acesso a dados (Supabase/Postgres)
├── dto/                      # DTOs de entrada (class-validator)
└── entities/                 # tipos de domínio / contrato de saída
```

### Módulos de domínio

| Módulo | Requisitos | Responsabilidade |
|---|---|---|
| `auth` | RF01, NF05, RE01(ético) | Cadastro, login, sessão (Supabase Auth + JWT), aceite de termos/LGPD |
| `users` | RF02 | Perfis (aluno/professor/avaliador/colaborador), dados, segurança da conta |
| `content` (acervo) | RF03, RF08 | Conteúdos (vídeo/poema/lenda/texto/imagem/receita/música), categorias, filtros, busca |
| `curation` | RF04, RE02–RE04 | Fila de avaliação; aprovar/solicitar ajuste/rejeitar; bloqueio de conteúdo sensível |
| `contributions` | RF05 | Envio de conteúdo por colaboradores/comunidades → encaminha à curadoria |
| `classes` (turmas) | DesignPdf (professor) | Turmas, vínculo de alunos, prazos/atividades, calendário |
| `progress` | RF03, RF07 | Histórico de acesso, acompanhamento do professor, base p/ recomendações |
| `recommendations` | RF07 | Sugestões por histórico/preferência; fallback por popularidade |
| `support` | NF02, NF04 | FAQ; reportar erro |
| `offline` | RF06 (desejável) | Marcação/registro de conteúdo para download offline |

### Módulos transversais (cross-cutting)

| Módulo | Conteúdo |
|---|---|
| `common` | DTOs base, envelope de resposta, `HttpExceptionFilter`, interceptors, `@Roles()` decorator, paginação |
| `auth/guards` | `SupabaseAuthGuard` (valida JWT), `RolesGuard` (RBAC) |
| `supabase` | `SupabaseService` global (service role) — **já existe** |
| `config` | `ConfigModule` global — **já existe** |

### Convenções de API

- Prefixo global `/api` (já configurado em `main.ts`).
- Envelope padrão de resposta e erros: ver [CONTRATOS-API.md](./CONTRATOS-API.md#envelope).
- Validação por `ValidationPipe` global (`whitelist + transform`).
- Paginação por `?page=&limit=`; filtros por query string (RF08).
- Autorização: `@UseGuards(SupabaseAuthGuard, RolesGuard)` + `@Roles('professor')`.

---

## Frontend — Next.js (modularizado por feature)

O App Router fica **fino**: cada rota apenas compõe um módulo de `features/`. Toda lógica, UI e acesso a dados vivem na feature correspondente.

```
frontend/src/
├── app/                       # ROTAS (App Router) — camada fina, só compõe features
│   ├── (public)/              # rotas públicas: home, acervo, conteúdo, sobre, faq
│   ├── (auth)/                # login, cadastro, esqueci-senha
│   ├── (aluno)/               # área do aluno
│   ├── (professor)/           # turmas, prazos, alunos
│   ├── (avaliador)/           # painel de curadoria
│   └── layout.tsx
├── features/                  # MÓDULOS por domínio (espelham o backend)
│   ├── auth/
│   ├── acervo/
│   ├── content/
│   ├── curation/
│   ├── contributions/
│   ├── classes/
│   ├── profile/
│   ├── recommendations/
│   └── support/
├── components/                # design system compartilhado (Button, Card, Modal, Table…)
├── lib/                       # apiClient, supabase (browser), utils, env
├── hooks/                     # hooks compartilhados (useAuth, useDebounce…)
├── types/                     # contratos compartilhados (espelham as entities do back)
└── styles/
```

### Anatomia de uma feature (frontend)

```
features/<dominio>/
├── components/      # UI específica do domínio
├── hooks/           # hooks do domínio (ex.: useAcervo, useFiltros)
├── services/        # chamadas à API via lib/apiClient (1 arquivo por recurso)
├── types.ts         # tipos do domínio (importam/espelham types/ do contrato)
└── index.ts         # superfície pública do módulo (o que outras partes podem importar)
```

Regra de ouro: **um módulo só importa de outro através do seu `index.ts`** — nunca alcançando arquivos internos. Isso mantém as fronteiras e facilita refatorar por dentro.

### Mapeamento telas (DesignPdf) → feature

| Tela (DesignPdf) | Feature |
|---|---|
| `Desktop/log in`, `Criar conta`, `Esqueci minha senha`, `Email enviado` | `auth` |
| `Main`, `Navegacao select`, `Profile dropdown` | `app` (home/shell) + `components` |
| `Acervo Categorias`, `Acervo completo`, `Categoria *`, `Container`, `Content Box`, `Table Template` | `acervo` |
| `Visualização de conteúdo`, `Visualização receita`, `Visu Conteudo Pedag` | `content` |
| `Colaborar`, `ENVIAR COLAB`, `colab enviada` | `contributions` |
| (painel do avaliador — curadoria) | `curation` |
| `Perfil professor *`, `conteudo dessa turma`, `Prazo calendar`, `prazo feito` | `classes` |
| `Perfil aluno`, `Perfil aluno segurança` | `profile` |
| `F.A.Q.`, `Relatar erro no site`, `Erro relatado`, `Sobre Nós` | `support` |

### Padrão MVC no frontend (atende RE04)

- **Model** → `types/` + `features/*/services/` (dados e contrato)
- **View** → `components/` + `features/*/components/`
- **Controller** → `features/*/hooks/` (orquestram estado e chamadas)

---

## Banco de dados (PostgreSQL / Supabase)

- Postgres via Supabase (RE técnico). RLS habilitado em **todas** as tabelas, com políticas explícitas por perfil.
- Migrations versionadas em `supabase/migrations/` (aplicadas no boot). Modelo completo de tabelas em [CONTRATOS-API.md](./CONTRATOS-API.md#modelo-de-dados).
- Service role só no backend; frontend usa anon key + RLS.

## Infraestrutura (requisitos técnicos)

- **Docker** (RE02) — já configurado (`docker-compose.yml`).
- **Nginx** (RE01) — proxy reverso/TLS a adicionar como serviço no compose, roteando `/api` → backend e `/` → frontend (tarefa da Fase 4).
- **LGPD** (RE01 ético) — consentimento registrado, dados mínimos, logs sem dados sensíveis.

## Estratégia de testes

| Camada | Ferramentas | Escopo |
|---|---|---|
| Backend unidade | Jest | services (regra de negócio) |
| Backend e2e | Jest + Supertest | endpoints por módulo contra o contrato |
| Frontend unidade | Vitest + Testing Library | hooks e componentes |
| Frontend e2e | Playwright | fluxos críticos (login, acervo, colaborar) |

Skills `back-end`, `front-end` e `fullstack` (em `.claude/skills/`) executam e validam cada camada.
