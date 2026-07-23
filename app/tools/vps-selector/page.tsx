import type { Metadata } from "next";
import { VpsSelector } from "@/components/vps-selector";

export const metadata: Metadata = { title: "VPS Selector | Root & Rack", description: "Estimate a sensible VPS configuration from your workload." };

export default function VpsSelectorPage() {
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-16 lg:px-8"><div className="mx-auto mb-12 max-w-3xl text-center"><p className="eyebrow">Free planning tool</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">How much VPS do you actually need?</h1><p className="mt-5 text-lg leading-8 text-slate-400">Turn a real workload into a sensible starting configuration—without an account or pretend precision.</p></div><VpsSelector/></main>;
}
