# Task Manager

Full-stack task management app with authentication. Each user sees only their own tasks.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js · Express · TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Neon in production, Docker locally) |
| Auth | JWT (jsonwebtoken) · bcrypt |
| Validation | Zod |
| Frontend | Next.js 15 · TypeScript · Tailwind CSS |
| Forms | React Hook Form + Zod |
| Tests | Vitest · Supertest · React Testing Library |
| Extras | Swagger UI · Docker Compose · GitHub Actions CI |

## Getting started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) account (free) for the database

### 1. Clone and install

```bash
git clone <repo-url>
cd task-manager

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# backend/.env
cp backend/.env.example backend/.env
# Fill in DATABASE_URL from Neon dashboard and set JWT_SECRET

# frontend/.env.local
cp frontend/.env.example frontend/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run migrations

```bash
cd backend
npx prisma db push   # creates tables on Neon
```

### 4. Start dev servers

```bash
# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — Web
cd frontend && npm run dev
```

- API: http://localhost:3001
- Web: http://localhost:3000
- Swagger: http://localhost:3001/api-docs

## Running with Docker Compose (alternative)

```bash
# Starts postgres + api + web
docker compose up --build
```

> Note: Docker Compose uses a local Postgres container. For production use Neon and set `DATABASE_URL` accordingly.

## Running tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register with email/password/name |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/tasks | ✓ | List tasks (filter `?status=PENDING\|DONE`, paginate `?page=1&limit=10`) |
| POST | /api/tasks | ✓ | Create task |
| GET | /api/tasks/:id | ✓ | Get task by ID |
| PUT | /api/tasks/:id | ✓ | Update task |
| DELETE | /api/tasks/:id | ✓ | Delete task |

Full interactive docs at `/api-docs` (Swagger UI).

## Technical decisions

**Express over NestJS** — NestJS adds significant boilerplate for a project this size. Express with TypeScript and manual route files is easier to read and faster to iterate on.

**Prisma over TypeORM/Drizzle** — Best TypeScript DX, auto-generated types, and the schema-first approach makes the data model immediately readable to reviewers.

**Zod for both backend and frontend** — Single validation library on both sides means I can share schema definitions if the project grows into a monorepo. Zod's `.parse()` throws `ZodError` which the error middleware catches automatically.

**Vitest over Jest** — Native ESM support, faster cold start, compatible with the same `@testing-library` ecosystem.

**JWT in localStorage (frontend)** — Acceptable tradeoff for this use case. A production app would use httpOnly cookies to prevent XSS. Noted in "what I'd do differently" below.

**User isolation via `findFirst({ where: { id, userId } })`** — Never do `findUnique(id)` then check ownership separately. The combined query is atomic and prevents a class of TOCTOU bugs.

## What I'd leave for a second iteration

- Refresh token flow (currently tokens are valid 7 days)
- Move JWT to httpOnly cookie to protect against XSS
- E2E tests with Playwright
- Optimistic UI updates (currently every mutation re-fetches)
- Task ordering / drag-and-drop
- Password reset flow

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon (or any PostgreSQL) connection string |
| `JWT_SECRET` | Random secret for signing JWTs (min 32 chars) |
| `PORT` | Server port (default: 3001) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (default: http://localhost:3001) |
