"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAdminAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: "", username: "" };
const inputClass =
  "mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-3 text-sm text-white outline-none focus:border-(--color-brand-border)";

export function LoginForm({ authError }: { authError?: string }) {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);

  const getErrorMessage = () => {
    if (state.error) return state.error;
    if (authError === "google_not_configured") {
      return "Google OAuth is not configured yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.";
    }
    if (authError === "unauthorized") {
      return "Your Google email address is not authorized for Admin CMS access.";
    }
    if (authError) {
      return "Google sign-in failed. Please try again or sign in with your credentials.";
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="mt-6 text-left">
      {/* Google Sign-in Button */}
      <a
        href="/api/auth/google"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface-raised) px-5 py-3 text-sm font-semibold text-white transition hover:border-(--color-brand-border) hover:bg-(--color-surface-muted) focus:outline-none focus:ring-2 focus:ring-(--color-focus)"
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
        <span>Sign in with Google</span>
      </a>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-(--color-border)" />
        <span className="absolute bg-(--color-surface) px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          or continue with password
        </span>
      </div>

      {/* Traditional Credentials Form */}
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
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Password
          <input
            required
            autoComplete="current-password"
            type="password"
            name="password"
            className={inputClass}
          />
        </label>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl border border-(--color-danger-border) bg-(--color-danger-soft) p-3 text-xs text-(--color-danger-text) animate-in fade-in"
          >
            {errorMessage}
          </p>
        )}

        <div className="space-y-3 pt-2">
          <button
            disabled={pending}
            className="w-full rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-5 py-3 text-sm font-bold text-white hover:bg-(--color-brand-hover) disabled:cursor-wait disabled:opacity-60 shadow-sm"
          >
            {pending ? "Signing in…" : "Sign in →"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-slate-400">
          <span>Don&apos;t have an account?</span>
          <Link
            href="/admin/register"
            className="font-semibold text-(--color-brand-light) hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
