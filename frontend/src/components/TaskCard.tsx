import { Task } from "@/lib/api";
import { Pencil, Trash2, Calendar, CheckCircle2, Circle, AlertTriangle } from "lucide-react";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus }: Props) {
  const isDone = task.status === "DONE";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  return (
    <div data-testid="task-card"
      className={`bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md group ${
        isDone ? "border-gray-100 opacity-70" : isOverdue ? "border-red-200 bg-red-50/20" : "border-gray-200 hover:border-indigo-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle */}
        <button onClick={() => onToggleStatus(task)}
          aria-label={isDone ? "Mark as pending" : "Mark as done"}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
          {isDone
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            : <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-400" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDone ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isDone ? "Done" : "Pending"}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                isOverdue ? "text-red-500" : "text-gray-400"
              }`}>
                {isOverdue
                  ? <AlertTriangle className="w-3 h-3" />
                  : <Calendar className="w-3 h-3" />
                }
                {isOverdue ? "Overdue · " : ""}
                {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} aria-label="Edit task"
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(task.id)} aria-label="Delete task"
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
