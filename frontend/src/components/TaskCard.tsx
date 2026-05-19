import { Task } from "@/lib/api";

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
    <div
      data-testid="task-card"
      className={`bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${
        isDone ? "border-gray-100 opacity-70" : isOverdue ? "border-red-200" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle button */}
        <button
          onClick={() => onToggleStatus(task)}
          aria-label={isDone ? "Mark as pending" : "Mark as done"}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            isDone
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
          }`}
        >
          {isDone && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDone ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isDone ? "Done" : "Pending"}
            </span>

            {task.dueDate && (
              <span className={`text-xs font-medium flex items-center gap-1 ${
                isOverdue ? "text-red-500" : "text-gray-400"
              }`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isOverdue ? "Overdue · " : ""}{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
