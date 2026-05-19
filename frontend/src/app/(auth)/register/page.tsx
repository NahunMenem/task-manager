"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { register as registerApi } from "@/lib/api";
import { CheckCircle2, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const { token, user } = await registerApi(data.email, data.password, data.name);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  const fields = [
    { name: "name" as const, label: "Full name", type: "text", placeholder: "Jane Doe", icon: User },
    { name: "email" as const, label: "Email", type: "email", placeholder: "you@example.com", icon: Mail },
    { name: "password" as const, label: "Password", type: "password", placeholder: "Min. 8 characters", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-100 flex items-center justify-center px-4">
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Start managing your tasks today</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100 border border-white p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {fields.map(({ name, label, type, placeholder, icon: Icon }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register(name)} type={type} placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition" />
                </div>
                {errors[name] && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[name]?.message}</p>}
              </div>
            ))}

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
