import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import jwt from "jsonwebtoken";

// Mock prisma so tests don't need a real DB
vi.mock("../src/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "../src/lib/prisma";

const JWT_SECRET = "test-secret";
process.env.JWT_SECRET = JWT_SECRET;
process.env.NODE_ENV = "test";

function makeToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "1h" });
}

const mockTask = {
  id: "task-1",
  title: "Test task",
  description: "desc",
  status: "PENDING",
  dueDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
};

describe("GET /api/tasks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  it("returns paginated tasks for authenticated user", async () => {
    vi.mocked(prisma.task.findMany).mockResolvedValue([mockTask] as never);
    vi.mocked(prisma.task.count).mockResolvedValue(1);

    const token = makeToken("user-1");
    const res = await request(app)
      .get("/api/tasks?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
  });

  it("filters tasks by status=DONE", async () => {
    vi.mocked(prisma.task.findMany).mockResolvedValue([]);
    vi.mocked(prisma.task.count).mockResolvedValue(0);

    const token = makeToken("user-1");
    const res = await request(app)
      .get("/api/tasks?status=DONE")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1", status: "DONE" } })
    );
  });

  it("returns 400 for invalid status filter", async () => {
    const token = makeToken("user-1");
    const res = await request(app)
      .get("/api/tasks?status=INVALID")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/tasks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a task and returns 201", async () => {
    vi.mocked(prisma.task.create).mockResolvedValue(mockTask as never);

    const token = makeToken("user-1");
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New task", status: "PENDING" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test task");
  });

  it("returns 400 when title is missing", async () => {
    const token = makeToken("user-1");
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "no title here" });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/tasks/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when task belongs to another user", async () => {
    vi.mocked(prisma.task.findFirst).mockResolvedValue(null);

    const token = makeToken("other-user");
    const res = await request(app)
      .delete("/api/tasks/task-1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("deletes task and returns 204", async () => {
    vi.mocked(prisma.task.findFirst).mockResolvedValue(mockTask as never);
    vi.mocked(prisma.task.delete).mockResolvedValue(mockTask as never);

    const token = makeToken("user-1");
    const res = await request(app)
      .delete("/api/tasks/task-1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
