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
      <div className="admin-content min-w-0 w-full md:w-auto md:flex-1">
        <main
          className={`w-full px-5 py-8 @min-[1024px]:px-10 @min-[1024px]:py-10 ${
            desktopOpen ? "" : "md:pl-20 @min-[1024px]:pl-20"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
