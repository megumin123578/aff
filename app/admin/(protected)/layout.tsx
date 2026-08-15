import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdminAction } from "@/app/admin/actions";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[var(--color-bg-deep)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/admin" className="font-extrabold text-white">Neroviax Admin</Link>
            <nav className="flex items-center gap-3 text-sm text-slate-400">
              <Link href="/admin/articles" className="hover:text-white">Articles</Link>
              <Link href="/admin/affiliate-links" className="hover:text-white">Affiliate links</Link>
              <Link href="/" className="hover:text-white">View site</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{session.username}</span>
            <form action={logoutAdminAction}>
              <button className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-slate-300 hover:bg-[var(--color-surface-muted)]">Sign out</button>
            </form>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">{children}</div>
    </main>
  );
}
