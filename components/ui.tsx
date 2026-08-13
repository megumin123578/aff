import type { ReactNode } from "react";

type CommonProps = { children: ReactNode; className?: string };

export function Card({ children, className = "" }: CommonProps) {
  return (
    <div className={`rounded-2xl border border-[#343A46] bg-[#1E222A] shadow-[0_18px_50px_rgba(0,0,0,0.22)] ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, className = "", variant = "default" }: CommonProps & { variant?: "default" | "azure" | "mint" }) {
  const colors = {
    default: "border-[#343A46] bg-[#262B34] text-slate-300",
    azure: "border-[#0077CC]/50 bg-[#0077CC]/15 text-[#73BAFF]",
    mint: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  };

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors[variant]} ${className}`}>{children}</span>;
}

export function Action({ children, className = "", size = "medium", variant = "default" }: CommonProps & { size?: "small" | "medium" | "large"; variant?: "default" | "azure" | "mint" }) {
  const sizes = { small: "px-3.5 py-2 text-xs", medium: "px-4 py-2.5 text-sm", large: "px-5 py-3.5 text-sm" };
  const colors = {
    default: "border-[#566174] bg-[#3A4352] text-white shadow-sm hover:border-[#69768B] hover:bg-[#465164]",
    azure: "border-[#168DE0] bg-[#0077CC] text-white hover:bg-[#0786df]",
    mint: "border-emerald-400 bg-emerald-400 text-[#07130f] hover:bg-emerald-300",
  };

  return <span className={`inline-flex items-center justify-center rounded-xl border font-bold transition-colors ${sizes[size]} ${colors[variant]} ${className}`}>{children}</span>;
}

export function Chip({ children, active = false }: CommonProps & { active?: boolean }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${active ? "border-[#0077CC]/50 bg-[#0077CC]/15 text-[#73BAFF]" : "border-[#343A46] bg-[#1E222A] text-slate-400"}`}>{children}</span>;
}

export function SwitchIndicator() {
  return <span aria-hidden="true" className="flex h-5 w-9 items-center justify-end rounded-full bg-[#0077CC] p-0.5"><span className="size-4 rounded-full bg-white shadow" /></span>;
}

export function CheckboxIndicator() {
  return <span aria-hidden="true" className="grid size-5 place-items-center rounded-md border border-[#168DE0] bg-[#0077CC] text-xs font-bold text-white">✓</span>;
}
