# AI Usage

## Tools used

- **Claude (Anthropic)** — primary tool for scaffolding, boilerplate, and reviewing architectural decisions.
- **GitHub Copilot** — inline autocomplete during implementation of repetitive patterns (Zod schemas, Prisma queries).

---

## Key prompts that added real value

**1. Middleware + error handling design**
> "Design an Express error handler that distinguishes ZodError from generic errors and returns structured JSON with correct HTTP status codes."

This gave me the `errorHandler.ts` pattern with proper `next(err)` flow and Zod flattening — something easy to get wrong when mixing sync and async Express routes.

**2. Testing without a real database**
> "How should I write vitest unit tests for Express routes that depend on Prisma, without spinning up a real DB?"

The AI suggested `vi.mock("../src/lib/prisma")` with module-level mocks, which is cleaner than dependency injection for this scale. It also suggested the `supertest` + `vitest` combination.

**3. User isolation security pattern**
> "In a multi-tenant task API, what's the safest way to ensure a user can't access another user's task by guessing IDs?"

The response confirmed: always `findFirst({ where: { id, userId } })` instead of `findUnique({ where: { id } })` followed by an ownership check — the two-step pattern has a race condition window.

---

## Something the AI got wrong

When generating the Prisma `updateTask` route, the AI used `findUnique` for the ownership check before updating. This is subtly wrong: if you `findUnique` and then `update` in two separate queries, another request could delete the task between them. I caught this and changed the pattern to `findFirst({ where: { id, userId } })` which combines the existence and ownership check atomically at the application level (Prisma doesn't support conditional updates natively).

---

## Something I deliberately did not delegate to AI

**JWT expiry and refresh strategy.** The AI defaulted to 1-hour expiry with no refresh flow. I chose 7-day tokens intentionally — this is a task manager, not a banking app, and short-lived tokens without a refresh endpoint just frustrate users. The product tradeoff (UX vs. security) requires human judgment about the threat model, not a generic "best practice" answer.
