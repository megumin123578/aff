import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] md:flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 md:pl-60 lg:pl-64">
        <main className="w-full px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

