"use client";

import { useEffect, useState } from "react";

export function StatusToast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="toast-fly-up z-50 flex items-center gap-3 rounded-xl border border-(--color-success-border) bg-(--color-success-soft) px-4 py-3 text-sm font-medium text-(--color-success-text) shadow-lg"
      style={{ position: "fixed", right: "1.25rem", bottom: "1.25rem" }}
    >
      <span aria-hidden="true">✓</span>
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss notification"
        className="ml-1 rounded p-0.5 leading-none opacity-70 transition hover:bg-white/10 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-(--color-focus)"
      >
        ×
      </button>
    </div>
  );
}
