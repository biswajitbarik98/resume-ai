"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(
      "Account created successfully"
    );

    setTimeout(() => {
      router.push("/login");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-5">
      <div className="grid md:grid-cols-2 w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden">

        <div className="hidden md:flex bg-[#0B1F3A] text-white p-10 flex-col justify-between">
          <div>
            <p className="text-sm tracking-[0.35em] text-white/60">
              RESUME AI
            </p>

            <h1 className="text-4xl font-bold mt-8 leading-tight">
              Build resumes recruiters actually notice.
            </h1>

            <p className="text-white/70 mt-5 leading-7">
              Create your account and access ATS scans, AI optimization, and career tools.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/70">
            <ShieldCheck size={18} />
            Secure account creation
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#0B1F3A]">
            Create Account
          </h2>

          <p className="text-slate-500 mt-2">
            Start your journey today
          </p>

          <div className="mt-8 space-y-4">

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full h-14 pl-11 pr-4 rounded-2xl border-2 border-slate-300 bg-white text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-blue-100 outline-none"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full h-14 pl-11 pr-12 rounded-2xl border-2 border-slate-300 bg-white text-[#0B1F3A] placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-4 focus:ring-blue-100 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            {success && (
              <p className="text-green-600 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                {success}
              </p>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#0B1F3A] text-white font-semibold hover:opacity-95 active:scale-[0.99] transition"
            >
              {loading
                ? "Creating..."
                : "Sign Up"}
            </button>
          </div>

          <p className="text-sm text-center mt-6 text-slate-500">
            Already have account?{" "}
            <a
              href="/login"
              className="text-blue-600 font-semibold"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}