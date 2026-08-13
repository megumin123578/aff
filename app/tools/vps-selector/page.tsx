import type { Metadata } from "next";
import { VpsSelector } from "@/components/vps-selector";

export const metadata: Metadata = {
  title: "VPS Selector | Veynor Tools",
  description: "Estimate a sensible VPS configuration from your real-world workload.",
};

export default function VpsSelectorPage() {
  return (
    <main className="relative min-h-screen py-14 lg:py-20 bg-[#0d1117]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <jelly-badge>Sizing Tool</jelly-badge>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            How much VPS do you actually need?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Turn your real workload requirements into a sensible starting server configuration—without account signups or artificial precision.
          </p>
        </div>

        <VpsSelector />
      </div>
    </main>
  );
}
