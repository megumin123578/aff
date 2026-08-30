"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/admin/articles",
    label: "Posts",
    icon: (
      <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: (
      <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    href: "/admin/affiliate-links",
    label: "Affiliate Links",
    icon: (
      <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
];

type AdminSidebarProps = {
  desktopOpen: boolean;
  onDesktopOpenChange: (open: boolean) => void;
};

export function AdminSidebar({ desktopOpen, onDesktopOpenChange }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Normalize pathname to prevent hydration mismatch from leading double slashes or trailing slashes
  const normalizedPathname = pathname ? pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/" : "";

  const isActive = (href: string, exact?: boolean) => {
    if (!normalizedPathname) return false;
    const target = href.replace(/\/$/, "") || "/";
    if (exact) return normalizedPathname === target;
    return normalizedPathname === target || normalizedPathname.startsWith(`${target}/`);
  };

  const renderNavContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo / Brand Header */}
        <div
          className="grid h-16 items-center border-b border-(--color-border) px-4"
          style={{ gridTemplateColumns: "2rem minmax(0, 1fr) 2rem" }}
        >
          <span aria-hidden="true" />
          <span className="text-center text-sm font-bold tracking-wide text-white">Admin</span>
          <button
            type="button"
            onClick={() => onDesktopOpenChange(false)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="hidden size-8 shrink-0 items-center justify-center text-slate-400 transition-[color,transform] duration-300 hover:rotate-90 hover:text-white md:flex"
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="mt-4 space-y-1 px-2.5" suppressHydrationWarning>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-(--color-brand) text-white shadow-sm font-bold"
                    : "text-slate-300 hover:bg-(--color-surface-muted) hover:text-white"
                }`}
              >
                <span className="shrink-0">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-(--color-border) p-3 text-center">
        <p className="text-[11px] text-slate-500 font-mono">Neroviax CMS · v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-4 md:hidden">
        <span className="text-sm font-bold text-white">Admin</span>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-9 items-center justify-center rounded-lg border border-(--color-border) text-slate-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed bottom-0 left-0 top-18 z-50 w-64 transform border-r border-(--color-border) transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#151a22" }}
      >
        {renderNavContent()}
        {mounted && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            title="Close sidebar"
            className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface-muted) text-slate-300 shadow-sm transition hover:border-(--color-border-strong) hover:text-white"
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside
        aria-hidden={!desktopOpen}
        className={`sticky top-18 z-40 hidden h-[calc(100dvh-4.5rem)] shrink-0 overflow-hidden border-r transition-[width,flex-basis,opacity,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${
          desktopOpen
            ? "border-(--color-border) opacity-100"
            : "pointer-events-none border-transparent opacity-0"
        }`}
        style={{
          backgroundColor: "#151a22",
          width: desktopOpen ? "16rem" : "0rem",
          flexBasis: desktopOpen ? "16rem" : "0rem",
        }}
      >
        <div
          className={`h-full w-64 shrink-0 transition-[transform,opacity] duration-300 ease-out ${
            desktopOpen ? "translate-x-0 opacity-100 delay-100" : "-translate-x-8 opacity-0"
          }`}
        >
          {renderNavContent()}
        </div>
      </aside>

      <button
        type="button"
        onClick={() => onDesktopOpenChange(true)}
        aria-label="Open sidebar"
        title="Open sidebar"
        tabIndex={desktopOpen ? -1 : 0}
        className={`fixed left-4 top-22 z-40 hidden size-9 items-center justify-center text-slate-400 transition-[opacity,transform,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:rotate-90 hover:text-white md:flex ${
          desktopOpen
            ? "pointer-events-none -translate-x-3 scale-90 opacity-0"
            : "translate-x-0 scale-100 opacity-100 delay-100"
        }`}
      >
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </>
  );
}
