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
    <form className="mt-6 space-y-4 text-left" action={action}>
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
          className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] p-3 text-xs text-[var(--color-danger-text)]"
        >
          {state.error}
        </p>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] p-3 text-xs text-[var(--color-success-text)]"
        >
          {state.success}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-wait disabled:opacity-60"
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
  );
}
