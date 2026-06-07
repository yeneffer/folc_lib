# Contratos de API — FolcLib

Fonte da verdade do contrato entre **frontend** e **backend**. O backend implementa; o frontend consome. Toda mudança de contrato é feita **aqui primeiro** e refletida nos tipos (`backend/src/<modulo>/entities/` e `frontend/src/types/`).

- Base URL: `/api` (proxy Nginx em produção; `http://localhost:3001/api` em dev).
- Auth: `Authorization: Bearer <access_token>` (JWT do Supabase Auth).
- Formato: JSON. Datas em ISO-8601 (UTC).

## Envelope

Sucesso:

```jsonc
{
  "data": { /* recurso ou lista */ },
  "meta": { "page": 1, "limit": 20, "total": 137 }  // só em listas paginadas
}
```

Erro:

```jsonc
{
  "error": {
    "code": "VALIDATION_ERROR",      // string estável p/ o front tratar
    "message": "E-mail já cadastrado", // pt-BR, exibível ao usuário
    "details": [ { "field": "email", "message": "..." } ]  // opcional
  }
}
```

Códigos de erro padronizados: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL` (500).

## Convenções de listagem

- Paginação: `?page=1&limit=20` (limit máx. 100).
- Ordenação: `?sort=campo&order=asc|desc`.
- Busca textual: `?q=texto`.

---

## Enums compartilhados

```ts
type UserRole = 'aluno' | 'professor' | 'avaliador' | 'colaborador';

type ContentType = 'video' | 'poema' | 'lenda' | 'texto' | 'imagem' | 'receita' | 'musica';

type ContentStatus = 'rascunho' | 'em_avaliacao' | 'aprovado' | 'rejeitado';

type CurationDecision = 'aprovado' | 'ajustes_solicitados' | 'rejeitado';

type ContributionStatus = 'recebida' | 'em_avaliacao' | 'aprovada' | 'rejeitada';

type AssignmentStatus = 'pendente' | 'concluido' | 'atrasado';

type ErrorReportStatus = 'aberto' | 'em_analise' | 'resolvido';
```

---

## Modelo de dados

Tabelas em `public` (Postgres/Supabase), todas com `id uuid pk default uuid_generate_v4()`, `created_at`, `updated_at` e **RLS habilitado**.

| Tabela | Campos principais | Observações |
|---|---|---|
| `profiles` | `id (=auth.users.id)`, `nome`, `email`, `role`, `avatar_url` | 1:1 com `auth.users`. RF02 |
| `terms_acceptances` | `user_id`, `terms_version`, `accepted_at`, `ip` | RF01, NF05, LGPD |
| `contents` | `titulo`, `descricao`, `tipo`, `status`, `autor_id`, `origem_cultural`, `estado`, `evento`, `comunidade`, `ano`, `media_url`, `thumb_url`, `pedagogico bool`, `metadata jsonb`, `published_at` | RF03. Receita usa `metadata` (ingredientes, modo_preparo) |
| `categories` | `nome`, `slug`, `tipo` | RF08 (costumes, folclore, gastronômica…) |
| `content_categories` | `content_id`, `category_id` | N:N |
| `curation_reviews` | `content_id`, `avaliador_id`, `decisao`, `comentario` | RF04 |
| `contributions` | `colaborador_id (nullable)`, `titulo`, `descricao`, `arquivos jsonb`, `status`, `nome_contato`, `email_contato` | RF05 (permite visitante) |
| `classes` (turmas) | `professor_id`, `nome`, `codigo (unique)`, `descricao` | DesignPdf professor |
| `class_students` | `class_id`, `student_id` | N:N |
| `assignments` (prazos) | `class_id`, `titulo`, `descricao`, `content_id (nullable)`, `due_date` | Prazo calendar |
| `assignment_progress` | `assignment_id`, `student_id`, `status`, `completed_at` | prazo feito |
| `content_access_history` | `user_id`, `content_id`, `accessed_at` | RF07 progresso/recomendação |
| `favorites` | `user_id`, `content_id` | favoritar / offline RF06 |
| `faq` | `pergunta`, `resposta`, `ordem` | NF02 |
| `error_reports` | `user_id (nullable)`, `descricao`, `url`, `status` | NF04 |

RLS resumida: leitura pública só de `contents` com `status='aprovado'`, `categories` e `faq`; o resto exige autenticação e filtra por dono/role.

---

## Endpoints por módulo

### `auth` — RF01, NF05

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | público | Cadastro (exige aceite de termos) |
| `POST` | `/auth/login` | público | Login → tokens |
| `POST` | `/auth/logout` | bearer | Encerra sessão |
| `POST` | `/auth/refresh` | público | Renova access token |
| `POST` | `/auth/forgot-password` | público | Envia e-mail de reset |
| `POST` | `/auth/reset-password` | público | Define nova senha via token |
| `GET` | `/auth/me` | bearer | Perfil do usuário logado |

```ts
// POST /auth/register
interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  aceiteTermos: true;        // obrigatório; versão atual dos termos
}
interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;         // segundos
}
// POST /auth/login
interface LoginRequest { email: string; senha: string; }
```

### `users` — RF02

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/users/me` | bearer | Dados do próprio perfil |
| `PATCH` | `/users/me` | bearer | Atualiza nome/avatar |
| `PATCH` | `/users/me/security` | bearer | Altera senha/e-mail (Perfil segurança) |

```ts
interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}
```

### `content` (acervo) — RF03, RF08

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/contents` | público | Lista/filtra acervo aprovado (RF08) |
| `GET` | `/contents/:id` | público | Detalhe do conteúdo (registra acesso se autenticado) |
| `GET` | `/categories` | público | Lista categorias para os filtros |
| `POST` | `/contents` | bearer (colaborador/avaliador) | Cria conteúdo (entra como `em_avaliacao`) |
| `PATCH` | `/contents/:id` | bearer (autor/avaliador) | Edita conteúdo |

```ts
// GET /contents — query de filtros (RF08), todos opcionais
interface AcervoQuery {
  q?: string;
  tipo?: ContentType | ContentType[];
  categoria?: string | string[];   // slug
  estado?: string;                 // UF
  evento?: string;                 // carnaval, são joão…
  comunidade?: string;             // quilombo, indígena…
  ano?: number;
  pedagogico?: boolean;
  page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc';
}
interface ContentSummary {
  id: string; titulo: string; tipo: ContentType;
  thumbUrl: string | null; origemCultural: string | null;
  estado: string | null; pedagogico: boolean;
}
interface ContentDetail extends ContentSummary {
  descricao: string;
  mediaUrl: string | null;
  categorias: Category[];
  evento: string | null; comunidade: string | null; ano: number | null;
  autor: Pick<UserProfile, 'id' | 'nome'> | null;
  metadata: Record<string, unknown>;   // receita: { ingredientes[], modoPreparo }
  publishedAt: string | null;
}
interface Category { id: string; nome: string; slug: string; tipo: string; }
```

### `curation` — RF04 (avaliador)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/curation/queue` | avaliador | Conteúdos `em_avaliacao` |
| `POST` | `/curation/:contentId/review` | avaliador | Registra decisão |

```ts
interface ReviewRequest { decisao: CurationDecision; comentario?: string; }
```

### `contributions` — RF05 (colaborador/visitante)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/contributions` | opcional | Envia contribuição (anexos) |
| `GET` | `/contributions/me` | bearer | Minhas contribuições e status |

```ts
interface ContributionRequest {
  titulo: string; descricao: string;
  arquivos: { nome: string; url: string }[];   // upload prévio no Storage
  nomeContato?: string; emailContato?: string;  // p/ visitante
  aceiteTermos: true;
}
```

### `classes` (turmas) — professor

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/classes` | professor | Turmas do professor |
| `POST` | `/classes` | professor | Cria turma |
| `GET` | `/classes/:id` | professor/aluno-membro | Detalhe + alunos |
| `POST` | `/classes/:id/students` | professor | Adiciona aluno |
| `GET` | `/classes/:id/assignments` | professor/aluno | Prazos da turma |
| `POST` | `/classes/:id/assignments` | professor | Cria prazo |
| `PATCH` | `/assignments/:id/progress` | aluno | Marca prazo como concluído |

```ts
interface ClassSummary { id: string; nome: string; codigo: string; totalAlunos: number; }
interface Assignment {
  id: string; titulo: string; descricao: string | null;
  contentId: string | null; dueDate: string; status?: AssignmentStatus;
}
```

### `progress` & `recommendations` — RF03, RF07

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/me/history` | bearer | Histórico de acesso |
| `GET` | `/classes/:id/progress` | professor | Progresso dos alunos da turma |
| `GET` | `/recommendations` | opcional | Recomendados (histórico) ou populares (fallback) |

### `support` — NF02, NF04

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/faq` | público | Lista de FAQ |
| `POST` | `/error-reports` | opcional | Reporta erro |

```ts
interface FaqItem { id: string; pergunta: string; resposta: string; ordem: number; }
interface ErrorReportRequest { descricao: string; url?: string; }
```

### `offline` — RF06 (desejável)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/me/offline/:contentId` | bearer | Marca conteúdo p/ offline |
| `GET` | `/me/offline` | bearer | Lista conteúdos marcados |

---

## Sincronização do contrato

1. Alterou o contrato? Edite **este arquivo** primeiro.
2. Reflita em `backend/src/<modulo>/entities/*.ts` (saída) e `dto/*.ts` (entrada com class-validator).
3. Copie/espelhe os tipos em `frontend/src/types/` (apenas tipos, sem lógica).
4. Atualize a tarefa correspondente em [TAREFAS.md](./TAREFAS.md).

> Opção futura: extrair os tipos para um pacote `shared/` consumido pelos dois lados, eliminando a duplicação manual.
