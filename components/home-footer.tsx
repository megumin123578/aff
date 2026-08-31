"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HomeFooter() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <footer className="border-t border-(--color-border) bg-(--color-footer) px-5 py-10 text-center text-sm text-slate-400">
      <div className="flex w-full items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          <Link href="/about" className="hover:text-slate-300">About</Link>
          <Link href="/contact" className="hover:text-slate-300">Contact</Link>
          <Link href="/methodology" className="hover:text-slate-300">Methodology</Link>
          <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-300">Terms</Link>
          <Link href="/affiliate-disclosure" className="hover:text-slate-300">Affiliate disclosure</Link>
          <span>© 2026 Neroviax · Real-world testing before recommendations.</span>
        </div>
      </div>
    </footer>
  );
}
