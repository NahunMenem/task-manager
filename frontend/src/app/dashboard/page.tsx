"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTasks, createTask, updateTask, deleteTask, Task, Status } from "@/lib/api";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm, TaskFormData } from "@/components/TaskForm";

type FilterStatus = "ALL" | Status;

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    setUserName(user.name ?? "");
  }, [router]);

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await getTasks({ status: filter === "ALL" ? undefined : filter, page, limit: 10 });
      setTasks(res.data);
      setMeta({ total: res.meta.total, page: res.meta.page, totalPages: res.meta.totalPages });
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) { router.replace("/login"); return; }
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filter, page, router]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  async function handleCreate(data: TaskFormData) {
    await createTask({ ...data, dueDate: data.dueDate || null });
    setShowForm(false);
    setPage(1);
    fetchTasks();
  }

  async function handleEdit(data: TaskFormData) {
    if (!editingTask) return;
    await updateTask(editingTask.id, { ...data, dueDate: data.dueDate || null });
    setEditingTask(null);
    fetchTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    fetchTasks();
  }

  async function handleToggleStatus(task: Task) {
    await updateTask(task.id, { status: task.status === "DONE" ? "PENDING" : "DONE" });
    fetchTasks();
  }

  const FILTERS: FilterStatus[] = ["ALL", "PENDING", "DONE"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">✓</span>
          <span className="font-semibold text-gray-900">Task Manager</span>
        </div>
        <div className="flex items-center gap-3">
          {userName && <span className="text-sm text-gray-500 hidden sm:block">Hi, {userName}</span>}
          <button onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">My Tasks</h1>
            <p className="text-sm text-gray-500">{meta.total} task{meta.total !== 1 ? "s" : ""} total</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingTask(null); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5">
            <span>+</span> New Task
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 mb-5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : "Done"}
            </button>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-sm mb-3">New task</h2>
            <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Edit form */}
        {editingTask && (
          <div className="bg-white rounded-xl border border-indigo-200 p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-sm mb-3">Edit task</h2>
            <TaskForm initialData={editingTask} onSubmit={handleEdit} onCancel={() => setEditingTask(null)} />
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchTasks} className="mt-3 text-sm text-indigo-600 hover:underline">Retry</button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-gray-600">No tasks yet</p>
            <p className="text-sm mt-1">Click "New Task" to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task}
                onEdit={(t) => { setEditingTask(t); setShowForm(false); }}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
              ← Prev
            </button>
            <span className="text-sm text-gray-500">{page} / {meta.totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === meta.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
