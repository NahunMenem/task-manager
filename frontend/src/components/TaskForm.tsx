"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task } from "@/lib/api";
import { Type, AlignLeft, Tag, Calendar, Loader2 } from "lucide-react";

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

const inputClass = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition";

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
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          <Type className="w-3.5 h-3.5" /> Title <span className="text-red-400">*</span>
        </label>
        <input {...register("title")} placeholder="What needs to be done?" className={inputClass} />
        {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          <AlignLeft className="w-3.5 h-3.5" /> Description
        </label>
        <textarea {...register("description")} rows={3} placeholder="Add some details…"
          className={`${inputClass} resize-none`} />
        {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <Tag className="w-3.5 h-3.5" /> Status
          </label>
          <select {...register("status")} className={inputClass}>
            <option value="PENDING">⏳ Pending</option>
            <option value="DONE">✅ Done</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> Due date
          </label>
          <input {...register("dueDate")} type="date" className={inputClass} />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition font-semibold text-gray-600">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-5 py-2 text-sm rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white disabled:opacity-50 font-bold transition-all shadow-sm shadow-indigo-200 flex items-center gap-2">
          {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : initialData ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
