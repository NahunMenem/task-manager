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
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-2 shadow-sm transition-opacity ${isDone ? "opacity-60" : ""}`}
      data-testid="task-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            onClick={() => onToggleStatus(task)}
            aria-label={isDone ? "Mark as pending" : "Mark as done"}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              isDone ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-indigo-400"
            }`}
          >
            {isDone && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div className="min-w-0">
            <p className={`font-medium text-sm leading-tight truncate ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} aria-label="Edit task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
            </svg>
          </button>
          <button onClick={() => onDelete(task.id)} aria-label="Delete task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          isDone ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}>
          {isDone ? "Done" : "Pending"}
        </span>
        {task.dueDate && (
          <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
            {isOverdue ? "⚠ " : ""}Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
