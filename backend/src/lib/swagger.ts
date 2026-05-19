export const swaggerSpec = {
  openapi: "3.0.0",
  info: { title: "Task Manager API", version: "1.0.0", description: "REST API for task management with JWT auth" },
  servers: [{ url: "http://localhost:3001", description: "Local" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Task: {
        type: "object",
        properties: {
          id: { type: "string" }, title: { type: "string" }, description: { type: "string", nullable: true },
          status: { type: "string", enum: ["PENDING", "DONE"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"], summary: "Register a new user",
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["email", "password", "name"], properties: { email: { type: "string" }, password: { type: "string" }, name: { type: "string" } } } } } },
        responses: { "201": { description: "User created" }, "409": { description: "Email already in use" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"], summary: "Login",
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } },
        responses: { "200": { description: "JWT token returned" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/api/tasks": {
      get: { tags: ["Tasks"], summary: "List tasks", security: [{ bearerAuth: [] }], parameters: [{ name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "DONE"] } }, { name: "page", in: "query", schema: { type: "integer", default: 1 } }, { name: "limit", in: "query", schema: { type: "integer", default: 10 } }], responses: { "200": { description: "Paginated task list" } } },
      post: { tags: ["Tasks"], summary: "Create task", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["title"], properties: { title: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["PENDING", "DONE"] }, dueDate: { type: "string", format: "date-time" } } } } } }, responses: { "201": { description: "Task created" } } },
    },
    "/api/tasks/{id}": {
      get: { tags: ["Tasks"], summary: "Get task by ID", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Task found" }, "404": { description: "Not found" } } },
      put: { tags: ["Tasks"], summary: "Update task", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, status: { type: "string", enum: ["PENDING", "DONE"] }, dueDate: { type: "string" } } } } } }, responses: { "200": { description: "Updated" }, "404": { description: "Not found" } } },
      delete: { tags: ["Tasks"], summary: "Delete task", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" }, "404": { description: "Not found" } } },
    },
  },
};
