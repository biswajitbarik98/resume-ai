"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10">

        <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">
          Forgot Password
        </h1>

        <p className="text-center text-slate-500 mb-8">
          Enter your email to receive reset instructions.
        </p>

        <form className="space-y-5">
          <div>
            <label className="text-sm font-medium">Email Address</label>

            <input
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <button className="w-full bg-slate-950 text-white rounded-xl py-3 font-semibold hover:bg-slate-800 transition">
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-8">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-slate-900">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}