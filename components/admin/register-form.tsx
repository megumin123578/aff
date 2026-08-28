"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAdminAction, type RegisterState } from "@/app/admin/register/actions";

const initialState: RegisterState = { error: "", success: "", username: "", email: "" };
const inputClass =
  "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAdminAction, initialState);

  return (
    <div className="mt-6 text-left">
      {/* Google Sign-in Button */}
      <a
        href="/api/auth/google"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--color-brand-border)] hover:bg-[var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
      >
        <svg className="size-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign up with Google</span>
      </a>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-[var(--color-border)]" />
        <span className="absolute bg-[var(--color-surface)] px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          or register with credentials
        </span>
      </div>

      <form className="space-y-4" action={action}>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Username
          <input
            key={state.username}
            required
            autoComplete="username"
            name="username"
            defaultValue={state.username}
            className={inputClass}
            placeholder="Choose a username"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Email
          <input
            key={state.email}
            required
            type="email"
            autoComplete="email"
            name="email"
            defaultValue={state.email}
            className={inputClass}
            placeholder="name@example.com"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Password
          <input
            required
            autoComplete="new-password"
            type="password"
            name="password"
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Confirm password
          <input
            required
            autoComplete="new-password"
            type="password"
            name="confirmPassword"
            className={inputClass}
            placeholder="Repeat password"
          />
        </label>

        {state.error && (
          <p
            role="alert"
            className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] p-3 text-xs text-[var(--color-danger-text)] animate-in fade-in"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <div
            role="status"
            className="rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] p-3 text-xs text-[var(--color-success-text)] animate-in fade-in"
          >
            {state.success}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-wait disabled:opacity-60 shadow-sm"
          >
            {pending ? "Creating account…" : "Sign up →"}
          </button>
          <Link
            href="/admin/login"
            className="flex w-full items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] hover:text-white"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
