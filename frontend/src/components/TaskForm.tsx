"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task } from "@/lib/api";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(["PENDING", "DONE"]),
  dueDate: z.string().optional(),
});

export type TaskFormData = z.infer<typeof schema>;

interface Props {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const inputClass = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white";
const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5";

export function TaskForm({ initialData, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      status: initialData?.status ?? "PENDING",
      dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Title <span className="text-red-400">*</span></label>
        <input
          {...register("title")}
          placeholder="What needs to be done?"
          className={inputClass}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Add some details…"
          className={`${inputClass} resize-none`}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Status</label>
          <select {...register("status")} className={inputClass}>
            <option value="PENDING">Pending</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Due date</label>
          <input {...register("dueDate")} type="date" className={inputClass} />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1 border-t border-gray-100 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-semibold transition-colors shadow-sm shadow-indigo-200"
        >
          {isSubmitting ? "Saving…" : initialData ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
