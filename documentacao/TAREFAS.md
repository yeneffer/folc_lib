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
| 0 | Fundação (infra, banco, auth base) | ⬜ Não iniciado |
| 1 | Backend — domínios essenciais | ⬜ Não iniciado |
| 2 | Backend — domínios importantes/desejáveis | ⬜ Não iniciado |
| 3 | Frontend — modularização e telas | ⬜ Não iniciado |
| 4 | Infra de produção (Nginx, TLS, LGPD) | ⬜ Não iniciado |
| 5 | Qualidade (testes e2e, acessibilidade) | ⬜ Não iniciado |

---

# FASE 0 — Fundação 🔴

Pré-requisito de tudo. Sem isso nenhum módulo de domínio compila/roda.

- [ ] **F0.1 — Modelagem do banco.** Criar migration com todas as tabelas de [CONTRATOS-API.md#modelo-de-dados](./CONTRATOS-API.md#modelo-de-dados): `profiles`, `terms_acceptances`, `contents`, `categories`, `content_categories`, `curation_reviews`, `contributions`, `classes`, `class_students`, `assignments`, `assignment_progress`, `content_access_history`, `favorites`, `faq`, `error_reports`. RLS habilitado + políticas por perfil. (`supabase/migrations/0002_schema.sql`) — RE técnico Postgres
- [ ] **F0.2 — Módulo `common`.** Envelope de resposta, `HttpExceptionFilter`, `ResponseInterceptor`, DTO de paginação, `@Roles()` decorator. — base p/ NF03
- [ ] **F0.3 — Auth base.** `SupabaseAuthGuard` (valida JWT do Supabase), `RolesGuard` (RBAC por `profiles.role`). Integração Supabase Auth no `auth` module. — RF01/RF02
- [ ] **F0.4 — Seed.** Categorias iniciais (costumes, folclore, gastronômica) + FAQ inicial + usuários de teste por perfil. — RF08/NF02
- [ ] **F0.5 — Tipos compartilhados.** Criar `frontend/src/types/` espelhando enums e entities do contrato. — base do front

---

# FASE 1 — Backend: domínios essenciais 🔴

> Ordem recomendada: B1 → B2 → B3. B1 desbloqueia todo o resto (autenticação/perfil).

## B1 — Auth & Users (RF01, RF02, NF05)
- [ ] B1.1 — `POST /auth/register` com aceite de termos (grava `terms_acceptances`). 🔴
- [ ] B1.2 — `POST /auth/login`, `/auth/refresh`, `/auth/logout`. 🔴
- [ ] B1.3 — `POST /auth/forgot-password`, `/auth/reset-password`. 🟡
- [ ] B1.4 — `GET /auth/me` + `GET/PATCH /users/me`. 🔴
- [ ] B1.5 — `PATCH /users/me/security` (troca de senha/e-mail). 🟡
- [ ] B1.6 — Testes e2e do módulo (Supertest) cobrindo RBAC. 🔴

## B2 — Acervo / Content (RF03, RF08)
- [ ] B2.1 — `GET /contents` com filtros completos (tipo, categoria, estado, evento, comunidade, ano, pedagógico, busca, paginação). 🔴
- [ ] B2.2 — `GET /contents/:id` (+ registra `content_access_history` se autenticado). 🔴
- [ ] B2.3 — `GET /categories`. 🔴
- [ ] B2.4 — `POST/PATCH /contents` (cria/edita; entra como `em_avaliacao`). 🔴
- [ ] B2.5 — Suporte a `metadata` de receita (ingredientes, modo de preparo). 🟡
- [ ] B2.6 — Testes e2e (filtros e RLS de conteúdo aprovado vs. privado). 🔴

## B3 — Curadoria (RF04)
- [ ] B3.1 — `GET /curation/queue` (somente avaliador). 🔴
- [ ] B3.2 — `POST /curation/:contentId/review` (aprovar/ajustes/rejeitar → muda `status`). 🔴
- [ ] B3.3 — Bloqueio automático de conteúdo sinalizado como sensível (fluxo alternativo RF04). 🔴
- [ ] B3.4 — Testes e2e. 🔴

---

# FASE 2 — Backend: importantes e desejáveis

## B4 — Contribuições (RF05) 🟡
- [ ] B4.1 — `POST /contributions` (aceita visitante com nome/e-mail de contato + upload no Storage). 🟡
- [ ] B4.2 — Encaminhamento à curadoria (cria `content` em `em_avaliacao` ao aprovar). 🟡
- [ ] B4.3 — `GET /contributions/me`. 🟡
- [ ] B4.4 — Validação de formato de arquivo (fluxo alternativo RF05). 🟡

## B5 — Turmas & Progresso (DesignPdf professor) 🟡
- [ ] B5.1 — CRUD `/classes` + `/classes/:id/students`. 🟡
- [ ] B5.2 — `/classes/:id/assignments` (prazos) + `PATCH /assignments/:id/progress`. 🟡
- [ ] B5.3 — `GET /classes/:id/progress` (acompanhamento do professor). 🟡
- [ ] B5.4 — `GET /me/history`. 🟡

## B6 — Recomendações (RF07) 🟢
- [ ] B6.1 — `GET /recommendations` por histórico. 🟢
- [ ] B6.2 — Fallback por popularidade (sem login/sem histórico). 🟢

## B7 — Suporte (NF02, NF04) 🟡
- [ ] B7.1 — `GET /faq`. 🟡
- [ ] B7.2 — `POST /error-reports`. 🟡

## B8 — Offline (RF06) 🟢
- [ ] B8.1 — `POST/GET /me/offline`. 🟢

---

# FASE 3 — Frontend: modularização e telas

> Só inicia o módulo após o backend correspondente estar pronto (coluna "Depende de"). Estrutura modular conforme [ARQUITETURA.md](./ARQUITETURA.md#frontend--nextjs-modularizado-por-feature).

## F-INFRA — Base do frontend
- [ ] FI.1 — `lib/apiClient` (fetch tipado + injeção do Bearer + tratamento do envelope de erro). Depende de: F0.5
- [ ] FI.2 — Design system base em `components/` (Button, Input, Card, Modal, Table, Badge). Depende de: —
- [ ] FI.3 — `useAuth` + guards de rota por perfil + layout/shell (Main, Navegação, Profile dropdown). Depende de: B1

## F1 — Auth (RF01) — telas: log in, Criar conta, Esqueci senha, Email enviado
- [ ] F1.1 — Feature `auth`: login/cadastro/reset consumindo B1. Depende de: B1
- [ ] F1.2 — Aceite de termos no cadastro (NF05). Depende de: B1

## F2 — Acervo (RF03, RF08) — telas: Acervo Categorias, Acervo completo, Categoria*, Container, Content Box, Table Template
- [ ] F2.1 — Feature `acervo`: listagem + cards + paginação. Depende de: B2
- [ ] F2.2 — Barra de filtros (tipo, categoria, estado, evento, comunidade, ano) + busca. Depende de: B2
- [ ] F2.3 — Variante pedagógica (telas "pedag"). Depende de: B2

## F3 — Conteúdo (RF03) — telas: Visualização de conteúdo, Visualização receita, Visu Conteudo Pedag
- [ ] F3.1 — Feature `content`: página de detalhe. Depende de: B2
- [ ] F3.2 — Render de receita (metadata). Depende de: B2.5

## F4 — Curadoria (RF04) — painel do avaliador
- [ ] F4.1 — Feature `curation`: fila + ações aprovar/ajustes/rejeitar. Depende de: B3

## F5 — Colaborar (RF05) — telas: Colaborar, ENVIAR COLAB, colab enviada
- [ ] F5.1 — Feature `contributions`: formulário + upload + confirmação. Depende de: B4

## F6 — Turmas (professor) — telas: Perfil professor*, conteudo dessa turma, Prazo calendar, prazo feito
- [ ] F6.1 — Feature `classes`: turmas, alunos, calendário de prazos. Depende de: B5
- [ ] F6.2 — Visão de progresso dos alunos. Depende de: B5.3

## F7 — Perfil (RF02) — telas: Perfil aluno, Perfil aluno segurança
- [ ] F7.1 — Feature `profile`: dados + segurança. Depende de: B1.5

## F8 — Recomendações (RF07) — Main
- [ ] F8.1 — Seção de recomendados na home. Depende de: B6

## F9 — Suporte (NF02, NF04) — telas: F.A.Q., Relatar erro, Erro relatado, Sobre Nós
- [ ] F9.1 — Feature `support`: FAQ + reportar erro + Sobre Nós. Depende de: B7

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
