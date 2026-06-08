# Tarefas — FolcLib

Rastreador de evolução do desenvolvimento. Ordem obrigatória: **backend primeiro**. Cada módulo do frontend só começa depois que o backend correspondente expõe e valida o contrato ([CONTRATOS-API.md](./CONTRATOS-API.md)).

## Como usar

- Marque o estado no checkbox: `[ ]` a fazer · `[~]` em andamento · `[x]` concluído.
- Atualize a coluna **Status** da tabela de resumo ao avançar.
- Cada tarefa cita o requisito (RFxx/NFxx/RExx) e/ou a tela do `DesignPdf`.
- "Pronto" = código + testes passando + contrato refletido nos tipos dos dois lados.

## Legenda de prioridade

🔴 Essencial · 🟡 Importante · 🟢 Desejável

---

## Resumo por fase

| Fase | Bloco | Status |
|---|---|---|
| 0 | Fundação (infra, banco, auth base) | ✅ Concluído |
| 1 | Backend — domínios essenciais | ✅ Concluído |
| 2 | Backend — domínios importantes/desejáveis | ✅ Concluído |
| 3 | Frontend — modularização e telas | ✅ Concluído |
| 4 | Infra de produção (Nginx, TLS, LGPD) | ⬜ Não iniciado |
| 5 | Qualidade (testes e2e, acessibilidade) | ⬜ Não iniciado |

---

# FASE 0 — Fundação 🔴

Pré-requisito de tudo. Sem isso nenhum módulo de domínio compila/roda.

- [x] **F0.1 — Modelagem do banco.** Migration com todas as tabelas de [CONTRATOS-API.md#modelo-de-dados](./CONTRATOS-API.md#modelo-de-dados): `profiles`, `terms_acceptances`, `contents`, `categories`, `content_categories`, `curation_reviews`, `contributions`, `classes`, `class_students`, `assignments`, `assignment_progress`, `content_access_history`, `favorites`, `faq`, `error_reports`. RLS habilitado + políticas por perfil. (`supabase/migrations/0002_schema.sql`) — RE técnico Postgres · branch `F0.1/modelagem-do-banco`
- [x] **F0.2 — Módulo `common`.** Envelope de resposta, `HttpExceptionFilter`, `ResponseInterceptor`, DTO de paginação, `@Roles()` decorator. — base p/ NF03 · branch `F0.2/modulo-common`
- [x] **F0.3 — Auth base.** `SupabaseAuthGuard` (valida JWT do Supabase), `OptionalAuthGuard`, `RolesGuard` (RBAC por `profiles.role`), `CurrentUser` decorator, `AuthService`. — RF01/RF02 · branch `F0.3/auth-base`
- [x] **F0.4 — Seed.** Categorias iniciais (costumes, folclore, gastronômica) + FAQ inicial + usuários de teste por perfil. (`supabase/migrations/0003_seed.sql`) — RF08/NF02 · branch `F0.4/seed`
- [x] **F0.5 — Tipos compartilhados.** `frontend/src/types/` espelhando enums e entities do contrato. — base do front · branch `F0.5/tipos-compartilhados`

---

# FASE 1 — Backend: domínios essenciais 🔴

> Ordem recomendada: B1 → B2 → B3. B1 desbloqueia todo o resto (autenticação/perfil).

## B1 — Auth & Users (RF01, RF02, NF05) · branch `B1/auth-e-users`
- [x] B1.1 — `POST /auth/register` com aceite de termos (grava `terms_acceptances`). 🔴
- [x] B1.2 — `POST /auth/login`, `/auth/refresh`, `/auth/logout`. 🔴
- [x] B1.3 — `POST /auth/forgot-password`, `/auth/reset-password`. 🟡
- [x] B1.4 — `GET /auth/me` + `GET/PATCH /users/me`. 🔴
- [x] B1.5 — `PATCH /users/me/security` (troca de senha/e-mail). 🟡
- [x] B1.6 — Testes cobrindo RBAC (`RolesGuard`) e parsing de token. 🔴 ⚠️ unitários; e2e Supertest contra Supabase real fica pendente

## B2 — Acervo / Content (RF03, RF08) · branch `B2/acervo-content`
- [x] B2.1 — `GET /contents` com filtros completos (tipo, categoria, estado, evento, comunidade, ano, pedagógico, busca, paginação). 🔴
- [x] B2.2 — `GET /contents/:id` (+ registra `content_access_history` se autenticado). 🔴
- [x] B2.3 — `GET /categories`. 🔴
- [x] B2.4 — `POST/PATCH /contents` (cria/edita; entra como `em_avaliacao`). 🔴
- [x] B2.5 — Suporte a `metadata` de receita (ingredientes, modo de preparo). 🟡
- [x] B2.6 — Testes de regras (404, registro de acesso, receita, permissão de edição). 🔴 ⚠️ unitários; e2e de filtros/RLS fica pendente

## B3 — Curadoria (RF04) · branch `B3/curadoria`
- [x] B3.1 — `GET /curation/queue` (somente avaliador). 🔴
- [x] B3.2 — `POST /curation/:contentId/review` (aprovar/ajustes/rejeitar → muda `status`). 🔴
- [x] B3.3 — Bloqueio automático de conteúdo sinalizado como sensível (fluxo alternativo RF04). 🔴
- [x] B3.4 — Testes (aprovação, bloqueio automático, ajustes, rejeição, 404, 409). 🔴

---

# FASE 2 — Backend: importantes e desejáveis

## B4 — Contribuições (RF05) 🟡 · branch `B4/contribuicoes`
- [x] B4.1 — `POST /contributions` (aceita visitante com nome/e-mail de contato; arquivos pré-enviados ao Storage). 🟡
- [x] B4.2 — Encaminhamento à curadoria: `POST /contributions/:id/approve` cria `content` em `em_avaliacao`; `/queue` e `/reject`. 🟡
- [x] B4.3 — `GET /contributions/me`. 🟡
- [x] B4.4 — Validação de formato de arquivo via allowlist (fluxo alternativo RF05). 🟡

## B5 — Turmas & Progresso (DesignPdf professor) 🟡 · branch `B5/turmas-e-progresso`
- [x] B5.1 — CRUD `/classes` + `/classes/:id/students` (por id ou e-mail). 🟡
- [x] B5.2 — `/classes/:id/assignments` (prazos) + `PATCH /assignments/:id/progress`. 🟡
- [x] B5.3 — `GET /classes/:id/progress` (acompanhamento do professor). 🟡
- [x] B5.4 — `GET /me/history`. 🟡

## B6 — Recomendações (RF07) 🟢 · branch `B6/recomendacoes`
- [x] B6.1 — `GET /recommendations` por histórico. 🟢
- [x] B6.2 — Fallback por popularidade (sem login/sem histórico). 🟢

## B7 — Suporte (NF02, NF04) 🟡 · branch `B7/suporte`
- [x] B7.1 — `GET /faq`. 🟡
- [x] B7.2 — `POST /error-reports`. 🟡

## B8 — Offline (RF06) 🟢 · branch `B8/offline`
- [x] B8.1 — `POST/GET/DELETE /me/offline/:contentId`. 🟢

---

# FASE 3 — Frontend: modularização e telas

> Só inicia o módulo após o backend correspondente estar pronto (coluna "Depende de"). Estrutura modular conforme [ARQUITETURA.md](./ARQUITETURA.md#frontend--nextjs-modularizado-por-feature).

## F-INFRA — Base do frontend · branch `FI/base-frontend`
- [x] FI.1 — `lib/apiClient` (fetch tipado + injeção do Bearer + tratamento do envelope de erro). Depende de: F0.5
- [x] FI.2 — Design system base em `components/ui` (Button, Field/Textarea/Select, Card, Badge, Alert, Spinner). Depende de: —
- [x] FI.3 — `useAuth`/`AuthProvider` + `RouteGuard` por perfil + shell (Navbar com dropdown de perfil). Depende de: B1

## F1 — Auth (RF01) — telas: log in, Criar conta, Esqueci senha, Email enviado · branch `F1/auth`
- [x] F1.1 — Feature `auth`: login/cadastro/reset consumindo B1. Depende de: B1
- [x] F1.2 — Aceite de termos no cadastro (NF05). Depende de: B1

## F2 — Acervo (RF03, RF08) · branch `F2/acervo`
- [x] F2.1 — Feature `acervo`: listagem + cards + paginação. Depende de: B2
- [x] F2.2 — Barra de filtros (tipo, categoria, estado, busca) + paginação. Depende de: B2
- [x] F2.3 — Variante pedagógica (filtro pedagógico). Depende de: B2

## F3 — Conteúdo (RF03) · branch `F3/conteudo`
- [x] F3.1 — Feature `content`: página de detalhe + mídia. Depende de: B2
- [x] F3.2 — Render de receita (metadata) + salvar offline (RF06). Depende de: B2.5

## F4 — Curadoria (RF04) · branch `F4/curadoria`
- [x] F4.1 — Feature `curation`: fila + ações aprovar/ajustes/rejeitar. Depende de: B3

## F5 — Colaborar (RF05) · branch `F5/colaborar`
- [x] F5.1 — Feature `contributions`: formulário + upload (Storage) + confirmação. Depende de: B4

## F6 — Turmas (professor) · branch `F6/turmas`
- [x] F6.1 — Feature `classes`: turmas, alunos, prazos. Depende de: B5
- [x] F6.2 — Visão de progresso dos alunos. Depende de: B5.3

## F7 — Perfil (RF02) · branch `F7/perfil`
- [x] F7.1 — Feature `profile`: dados + segurança. Depende de: B1.5

## F8 — Recomendações (RF07) — Main · branch `F8/recomendacoes`
- [x] F8.1 — Seção de recomendados na home. Depende de: B6

## F9 — Suporte (NF02, NF04) · branch `F9/suporte`
- [x] F9.1 — Feature `support`: FAQ + reportar erro + Sobre Nós. Depende de: B7

---

# FASE 4 — Infra de produção

- [ ] I1 — Serviço **Nginx** no compose como proxy reverso (`/api`→backend, `/`→frontend). 🔴 RE01
- [ ] I2 — **TLS/HTTPS** + certificados; redirect HTTP→HTTPS. 🔴 RE01
- [ ] I3 — Hardening **LGPD**: logs sem dados sensíveis, variáveis em segredo, headers de segurança. 🔴 RE ético
- [ ] I4 — Dockerfiles de **produção** validados (estágio `production` de back e front). 🔴 RE02

---

# FASE 5 — Qualidade

- [ ] Q1 — E2E Playwright dos fluxos críticos (login → acervo → conteúdo; colaborar; curadoria). 🟡
- [ ] Q2 — Acessibilidade e responsividade (NF01, RE04). 🟡
- [ ] Q3 — Auditoria de performance dos endpoints (NF03). 🟡

---

## Caminho crítico (resumo)

```
F0 (fundação) → B1 (auth) → B2 (acervo) → B3 (curadoria)   ← backend essencial
                   │            │             │
                   ▼            ▼             ▼
              FI + F1        F2 + F3        F4              ← frontend (após cada backend)
                                            
B4..B8 (backend restante) → F5..F9 (frontend restante) → I1..I4 (prod) → Q1..Q3
```

Regra inegociável: **um item de frontend nunca é iniciado antes do backend do qual ele depende estar concluído e com contrato validado.**
