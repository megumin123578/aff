"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [desktopOpen, setDesktopOpen] = useState(true);

  return (
    <div className="min-h-[calc(100dvh-4.5rem)] bg-(--color-bg-deep) md:flex">
      <AdminSidebar
        desktopOpen={desktopOpen}
        onDesktopOpenChange={setDesktopOpen}
      />
      <div className="min-w-0 flex-1">
        <main className="w-full px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
