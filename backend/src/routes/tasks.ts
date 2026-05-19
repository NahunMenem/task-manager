import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

export const tasksRouter = Router();
tasksRouter.use(authenticate);

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(["PENDING", "DONE"]).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const updateSchema = taskSchema.partial();

const querySchema = z.object({
  status: z.enum(["PENDING", "DONE"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// GET /api/tasks
tasksRouter.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = querySchema.parse(req.query);
    const where = { userId: req.userId!, ...(status ? { status } : {}) };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    res.json({ data: tasks, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
tasksRouter.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = taskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: req.userId!,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
tasksRouter.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id
tasksRouter.put("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) { res.status(404).json({ error: "Task not found" }); return; }

    const data = updateSchema.parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { ...data, dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined },
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
tasksRouter.delete("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) { res.status(404).json({ error: "Task not found" }); return; }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
