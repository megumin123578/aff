"use client";

import { useActionState } from "react";
import { loginAdminAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: "", username: "" };
const inputClass = "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);
  return (
    <form className="mt-6 space-y-4 text-left" action={action}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
        Username
        <input key={state.username} required autoComplete="username" name="username" defaultValue={state.username} className={inputClass} />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
        Password
        <input required autoComplete="current-password" type="password" name="password" className={inputClass} />
      </label>
      {state.error && <p role="alert" className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] p-3 text-xs text-[var(--color-danger-text)]">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)] disabled:cursor-wait disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in →"}
      </button>
    </form>
  );
}
