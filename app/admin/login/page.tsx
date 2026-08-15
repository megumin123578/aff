import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Badge, Card } from "@/components/ui";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="grid min-h-[75vh] place-items-center bg-[var(--color-bg-deep)] px-5 py-16">
      <Card className="w-full max-w-md p-8 text-center">
        <Badge variant="azure">Neroviax CMS</Badge>
        <h1 className="mt-4 text-2xl font-extrabold text-white">Content administration</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">Sign in with the administrator credentials configured on this server.</p>
        <LoginForm />
      </Card>
    </main>
  );
}
