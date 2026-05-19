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

  function toISODate(d?: string) {
    return d ? `${d}T00:00:00.000Z` : null;
  }

  async function handleCreate(data: TaskFormData) {
    await createTask({ ...data, dueDate: toISODate(data.dueDate) });
    setShowForm(false);
    setPage(1);
    fetchTasks();
  }

  async function handleEdit(data: TaskFormData) {
    if (!editingTask) return;
    await updateTask(editingTask.id, { ...data, dueDate: toISODate(data.dueDate) });
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

  const FILTERS: { value: FilterStatus; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "DONE", label: "Done" },
  ];

  const pendingCount = tasks.filter(t => t.status === "PENDING").length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">TaskManager</span>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-700 text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">{userName}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors font-medium"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: "Total", value: meta.total, color: "text-gray-900", bg: "bg-white" },
            { label: "Pending", value: filter === "ALL" ? pendingCount : (filter === "PENDING" ? tasks.length : 0), color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Done", value: filter === "ALL" ? doneCount : (filter === "DONE" ? tasks.length : 0), color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl border border-gray-200 px-4 py-3 text-center shadow-sm`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
          <button
            onClick={() => { setShowForm(true); setEditingTask(null); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 mb-5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setFilter(value); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 mb-4 shadow-md shadow-indigo-50 ring-1 ring-indigo-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="font-semibold text-sm text-gray-900">New task</h2>
            </div>
            <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Edit form */}
        {editingTask && (
          <div className="bg-white rounded-2xl border border-amber-100 p-6 mb-4 shadow-md shadow-amber-50 ring-1 ring-amber-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                </svg>
              </div>
              <h2 className="font-semibold text-sm text-gray-900">Edit task</h2>
            </div>
            <TaskForm initialData={editingTask} onSubmit={handleEdit} onCancel={() => setEditingTask(null)} />
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse shadow-sm">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-gray-200 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-red-100 shadow-sm">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            <button onClick={fetchTasks} className="mt-3 text-sm text-indigo-600 hover:underline font-medium">
              Try again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700">No tasks yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "New Task" to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
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
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-white hover:shadow-sm transition-all font-medium text-gray-600"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400 px-2">
              {page} <span className="text-gray-300">/</span> {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === meta.totalPages}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-white hover:shadow-sm transition-all font-medium text-gray-600"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
