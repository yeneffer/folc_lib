# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FolcLib — plataforma de repositórios afro étnicos brasileiros. Monorepo with three pieces orchestrated by `docker-compose.yml`:

- `backend/` — NestJS 10 API (port 3001, prefix `/api`)
- `frontend/` — Next.js 14 App Router + React 18 (port 3000)
- `supabase/` — Postgres migrations auto-loaded from `supabase/migrations/` into the Supabase Postgres image via `/docker-entrypoint-initdb.d`
- `DesignPdf/` — design references (PDF mockups), not code

### Planejamento (ler antes de desenvolver)

- `documentacao/Req-software_FOLCLIB.docx.pdf` — especificação de requisitos (RF01–RF08, NF01–NF05, requisitos éticos e técnicos).
- `documentacao/ARQUITETURA.md` — desenho modular (módulos do backend e do frontend), mapeamento de telas do `DesignPdf` → feature.
- `documentacao/CONTRATOS-API.md` — **fonte da verdade** do contrato front↔back: modelo de dados, enums, endpoints e tipos. Alterar contrato? Editar aqui primeiro.
- `documentacao/TAREFAS.md` — rastreador de tarefas, **backend-first**. Frontend de um domínio só começa após o backend correspondente estar pronto.

Divergência conhecida: o requisito RE03 pede backend em Laravel; o projeto usa NestJS (decisão do time) — mesmo princípio modular/MVC, stack diferente.

The whole stack is meant to run via Docker. Both `backend` and `frontend` Dockerfiles are multi-stage (`development` / `build` / `production`); compose targets `development` and bind-mounts source for hot reload, preserving `node_modules` (and `.next` for the frontend) as anonymous volumes.

## Common commands

### Full stack (Docker)

```bash
docker compose up --build       # boot db + pg-meta + backend + frontend
docker compose up backend       # boot db + backend only
docker compose logs -f backend  # follow logs for one service
```

Ports (overridable via env): db `5432`, postgres-meta UI `8080`, backend `3001`, frontend `3000`.

Migrations in `supabase/migrations/` are only applied on **first** container creation (Postgres `initdb` semantics). After editing a migration during early dev, recreate the volume: `docker compose down -v && docker compose up`.

### Backend (NestJS, from `backend/`)

```bash
npm run start:dev   # nest start --watch
npm run build       # nest build → dist/
npm run start:prod  # node dist/main
npm run lint        # eslint --fix on src/**/*.ts and test/**/*.ts
npm test            # jest (no tests currently in repo)
```

Run a single Jest test once tests exist: `npx jest path/to/file.spec.ts -t "test name"`.

### Frontend (Next.js, from `frontend/`)

```bash
npm run dev    # next dev
npm run build  # next build (standalone output, see next.config.mjs)
npm start      # next start
npm run lint   # next lint
```

## Architecture

### Backend (NestJS)

- Entry `src/main.ts` boots Nest, enables CORS (`origin: true, credentials: true`), installs a global `ValidationPipe({ whitelist: true, transform: true })`, and sets the global prefix `api`. All routes are exposed under `/api/...`.
- `AppModule` imports `ConfigModule.forRoot({ isGlobal: true })` so any provider can inject `ConfigService` directly without re-importing.
- `SupabaseModule` is declared `@Global()` — `SupabaseService` is available across the app without re-importing the module. It lazy-initializes a `SupabaseClient` in `onModuleInit` using `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. If those env vars are missing, the service logs a warning and `getClient()` throws on first use rather than at boot — useful for running the API without Supabase configured.
- The backend's `SupabaseService` uses the **service role key** and is server-only. Never expose it to the browser.

### Frontend (Next.js App Router)

- `src/app/` is the App Router root. `page.tsx` is a Server Component that fetches `${NEXT_PUBLIC_API_URL}/api/health` with `cache: 'no-store'` on every render to display backend status.
- `src/lib/supabase.ts` exports a browser Supabase client built with the **anon key** — relies on RLS for protection. Path alias `@/*` → `./src/*` is configured in `tsconfig.json`.
- `next.config.mjs` sets `output: 'standalone'` so the production Docker stage can copy `.next/standalone` and run `node server.js`.

### Database

- Default DB name `folclib`, user/password `postgres/postgres` (overridable via env).
- `supabase/migrations/0001_init.sql` creates `public.items` with RLS enabled and a public-read policy; seeds two example rows. Follow the same pattern (`enable row level security` + explicit policies) for new tables.

## Environment

Each app has its own `.env.example`. Copy to `.env` before running outside Docker:

- `backend/.env`: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `frontend/.env`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

When running via `docker compose`, the backend reaches Postgres at host `db:5432` (compose service name), and the frontend reaches the backend at `http://localhost:3001` from the browser (the env var is `NEXT_PUBLIC_*`, so it must be the host-visible URL, not the in-compose hostname).

## Language

Code comments, commit messages, and runtime log messages in this repo are written in Portuguese (pt-BR). Match that style for new contributions.
