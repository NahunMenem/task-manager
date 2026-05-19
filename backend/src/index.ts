import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { authRouter } from "./routes/auth";
import { tasksRouter } from "./routes/tasks";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec } from "./lib/swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3001);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

export { app };
