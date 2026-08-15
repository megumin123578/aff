import { PlanForm } from "@/components/admin/plan-form";
import { getProviders } from "@/lib/catalog";

export default async function NewPlanPage() {
  const providers = await getProviders(true);
  return <div className="mx-auto max-w-5xl"><h1 className="mb-8 text-3xl font-extrabold text-white">New VPS plan</h1><PlanForm providers={providers} /></div>;
}
