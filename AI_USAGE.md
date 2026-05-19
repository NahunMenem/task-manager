# AI Usage

## Tools used

- **Claude Code (Anthropic)** — primary tool for scaffolding the full project, fixing bugs, deployment configuration, and UI design.
- **GitHub Copilot** — inline autocomplete during implementation of repetitive patterns (Zod schemas, Prisma queries).

---

## Key prompts that added real value

**1. User isolation security pattern**
> "In a multi-tenant task API, what's the safest way to ensure a user can't access another user's task by guessing IDs?"

The response confirmed: always `findFirst({ where: { id, userId } })` instead of `findUnique({ where: { id } })` followed by an ownership check. The two-step pattern has a TOCTOU race condition window. This shaped every ownership check in the routes.

**2. Testing without a real database**
> "How should I write Vitest unit tests for Express routes that depend on Prisma, without spinning up a real DB?"

The AI suggested `vi.mock("../src/lib/prisma")` with module-level mocks, which is cleaner than dependency injection for this scale. Also suggested the `supertest` + `vitest` combination that made HTTP-level testing straightforward.

**3. Error handler design**
> "Design an Express error handler that distinguishes ZodError from generic errors and returns structured JSON with correct HTTP status codes."

This produced the `errorHandler.ts` pattern with `next(err)` flow and `err.flatten().fieldErrors` — something easy to get wrong when mixing sync and async Express routes.

---

## Things the AI got wrong (and how I fixed them)

**1. Missing `dotenv` dependency**
The AI scaffolded `import "dotenv/config"` in `index.ts` but forgot to add `dotenv` to `package.json` dependencies. The app ran locally (it was a transitive dep) but would fail in CI with a clean install. I caught it during the Railway deploy and added it explicitly.

**2. Wrong `@types/express` version**
The AI used `@types/express@^5.0.0` while the runtime is Express 4. In TypeScript strict mode, Express 5 types `req.params` as `string | string[]` instead of `string`, causing Prisma query type errors on build. Fixed by downgrading to `@types/express@^4.17.21`.

**3. Missing Prisma binary target for Linux**
The Prisma client was generated on Windows and defaulted to the wrong native binary. On Railway (Alpine/Node 20), it crashed with `libssl.so.1.1: No such file or directory`. Fixed by adding `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` to `schema.prisma`.

**4. `dueDate` format mismatch**
The AI set the backend Zod schema to `z.string().datetime({ offset: true })` (requires full ISO 8601), but the frontend date input sends `"2026-05-19"` (date only). Tasks couldn't be created with a due date. Fixed by converting the date string to ISO before sending: `${date}T00:00:00.000Z`.

---

## Something I deliberately did not delegate to AI

**JWT expiry and refresh strategy.** The AI defaulted to short-lived tokens with a refresh endpoint. I chose 7-day tokens without a refresh flow — this is a task manager, not a banking app, and forcing users to re-login every hour hurts UX more than it helps security in this threat model. The product tradeoff requires human judgment about who the users are, not a generic "security best practice" answer.
