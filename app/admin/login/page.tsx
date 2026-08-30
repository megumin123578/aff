import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Badge, Card } from "@/components/ui";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdminSession()) redirect("/admin");
  const query = await searchParams;

  return (
    <main className="grid min-h-[75vh] place-items-center bg-(--color-bg-deep) px-5 py-16">
      <Card className="w-full max-w-md p-8 text-center shadow-2xl">
        <Badge variant="azure">Neroviax CMS</Badge>
        <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-xs text-slate-400">Sign in to manage your articles & team</p>
        <LoginForm authError={query.error} />
      </Card>
    </main>
  );
}
