import { notFound } from "next/navigation";
import { PlanForm } from "@/components/admin/plan-form";
import { getProviders, getVpsPlan } from "@/lib/catalog";

export default async function EditPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [plan, providers] = await Promise.all([getVpsPlan(slug, true), getProviders(true)]);
  if (!plan) notFound();
  return <div className="mx-auto max-w-5xl"><h1 className="mb-8 text-3xl font-extrabold text-white">Edit {plan.name}</h1><PlanForm plan={plan} providers={providers} /></div>;
}
