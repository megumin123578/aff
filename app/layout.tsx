import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Root & Rack — Practical infrastructure",
  description: "Practical VPS, self-hosting, and homelab guidance for small projects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#090c11]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
            <Link href="/" className="text-lg font-semibold text-white">Root <span className="text-cyan-300">&</span> Rack</Link>
            <nav className="hidden gap-7 text-sm text-slate-400 md:flex"><Link href="#guides">Guides</Link><Link href="#method">Method</Link><Link href="/tools/vps-selector">Tools</Link></nav>
            <Link href="/tools/vps-selector" className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">Size your VPS</Link>
          </div>
        </header>
        {children}
        <footer className="border-t border-white/8 px-5 py-10 text-center text-sm text-slate-600">© 2026 Root & Rack · Measurements before marketing.</footer>
      </body>
    </html>
  );
}
