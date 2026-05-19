"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTasks, createTask, updateTask, deleteTask, Task, Status } from "@/lib/api";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm, TaskFormData } from "@/components/TaskForm";
import { CheckCircle2, Plus, LogOut, ClipboardList, Clock, CheckCheck, Loader2 } from "lucide-react";

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
    setShowForm(false); setPage(1); fetchTasks();
  }

  async function handleEdit(data: TaskFormData) {
    if (!editingTask) return;
    await updateTask(editingTask.id, { ...data, dueDate: toISODate(data.dueDate) });
    setEditingTask(null); fetchTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id); fetchTasks();
  }

  async function handleToggleStatus(task: Task) {
    await updateTask(task.id, { status: task.status === "DONE" ? "PENDING" : "DONE" });
    fetchTasks();
  }

  const pendingCount = tasks.filter(t => t.status === "PENDING").length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;

  const FILTERS: { value: FilterStatus; label: string; icon: React.ReactNode; activeColor: string }[] = [
    { value: "ALL", label: "All", icon: <ClipboardList className="w-3.5 h-3.5" />, activeColor: "bg-indigo-600 text-white shadow-indigo-200" },
    { value: "PENDING", label: "Pending", icon: <Clock className="w-3.5 h-3.5" />, activeColor: "bg-amber-500 text-white shadow-amber-200" },
    { value: "DONE", label: "Done", icon: <CheckCheck className="w-3.5 h-3.5" />, activeColor: "bg-emerald-500 text-white shadow-emerald-200" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200">
              <CheckCircle2 className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight">TaskManager</span>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </div>
            )}
            <button onClick={logout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-all font-medium">
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: "Total tasks", value: meta.total, icon: <ClipboardList className="w-5 h-5" />, color: "text-indigo-600", bg: "from-indigo-50 to-violet-50", border: "border-indigo-100", iconBg: "bg-indigo-100" },
            { label: "Pending", value: pendingCount, icon: <Clock className="w-5 h-5" />, color: "text-amber-600", bg: "from-amber-50 to-orange-50", border: "border-amber-100", iconBg: "bg-amber-100" },
            { label: "Done", value: doneCount, icon: <CheckCheck className="w-5 h-5" />, color: "text-emerald-600", bg: "from-emerald-50 to-teal-50", border: "border-emerald-100", iconBg: "bg-emerald-100" },
          ].map(({ label, value, icon, color, bg, border, iconBg }) => (
            <div key={label} className={`bg-gradient-to-br ${bg} rounded-2xl border ${border} px-4 py-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
          <button onClick={() => { setShowForm(true); setEditingTask(null); }}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold rounded-xl px-4 py-2 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-200">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-5">
          {FILTERS.map(({ value, label, icon, activeColor }) => (
            <button key={value} onClick={() => { setFilter(value); setPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                filter === value ? `${activeColor} shadow-md` : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 mb-4 shadow-lg shadow-indigo-50 ring-1 ring-indigo-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-bold text-gray-900">New task</h2>
            </div>
            <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Edit form */}
        {editingTask && (
          <div className="bg-white rounded-2xl border border-amber-100 p-6 mb-4 shadow-lg shadow-amber-50 ring-1 ring-amber-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">Edit task</h2>
            </div>
            <TaskForm initialData={editingTask} onSubmit={handleEdit} onCancel={() => setEditingTask(null)} />
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading tasks…</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-red-100 shadow-sm">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            <button onClick={fetchTasks} className="mt-3 text-sm text-indigo-600 hover:underline font-semibold">Try again</button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="font-bold text-gray-700 text-lg">No tasks yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "New Task" to get started</p>
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
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:shadow-sm transition-all font-semibold text-gray-600">
              ← Prev
            </button>
            <span className="text-sm text-gray-400 px-2">{page} / {meta.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages}
              className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:shadow-sm transition-all font-semibold text-gray-600">
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
