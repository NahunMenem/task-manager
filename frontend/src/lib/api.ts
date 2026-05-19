const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Status = "PENDING" | "DONE";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TasksResponse {
  data: Task[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function register(email: string, password: string, name: string) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse<{ user: User; token: string }>(res);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ user: User; token: string }>(res);
}

export async function getTasks(params?: { status?: Status; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${BASE}/api/tasks?${qs}`, { headers: authHeaders() });
  return handleResponse<TasksResponse>(res);
}

export async function createTask(data: { title: string; description?: string; status?: Status; dueDate?: string | null }) {
  const res = await fetch(`${BASE}/api/tasks`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  return handleResponse<Task>(res);
}

export async function updateTask(id: string, data: Partial<{ title: string; description: string; status: Status; dueDate: string | null }>) {
  const res = await fetch(`${BASE}/api/tasks/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: string) {
  const res = await fetch(`${BASE}/api/tasks/${id}`, { method: "DELETE", headers: authHeaders() });
  return handleResponse<void>(res);
}
