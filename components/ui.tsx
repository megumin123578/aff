import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type CommonProps = { children: ReactNode; className?: string };
type Variant = "default" | "azure" | "mint";
type Size = "small" | "medium" | "large";

const actionBase =
  "inline-flex items-center justify-center rounded-xl border font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
const actionSizes: Record<Size, string> = {
  small: "px-3.5 py-2 text-xs",
  medium: "px-4 py-2.5 text-sm",
  large: "px-5 py-3.5 text-sm",
};
const actionVariants: Record<Variant, string> = {
  default:
    "border-(--color-border-strong) bg-(--color-action) text-white shadow-sm hover:border-(--color-border-hover) hover:bg-(--color-action-hover)",
  azure:
    "border-(--color-brand-border) bg-(--color-brand) text-white shadow-sm hover:bg-(--color-brand-hover)",
  mint:
    "border-(--color-success) bg-(--color-success) text-(--color-success-ink) shadow-sm hover:bg-(--color-success-hover)",
};

function actionClassName(variant: Variant, size: Size, className: string) {
  return `${actionBase} ${actionSizes[size]} ${actionVariants[variant]} ${className}`;
}

export function Card({ children, className = "" }: CommonProps) {
  return (
    <div
      className={`rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-card) ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className = "",
  variant = "default",
}: CommonProps & { variant?: Variant }) {
  const colors: Record<Variant, string> = {
    default:
      "border-(--color-border) bg-(--color-surface-muted) text-slate-300",
    azure:
      "border-(--color-brand-border) bg-(--color-brand-soft) text-(--color-brand-light)",
    mint:
      "border-(--color-success-border) bg-(--color-success-soft) text-(--color-success-text)",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
};

export function Button({
  children,
  className = "",
  size = "medium",
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={actionClassName(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  size?: Size;
  variant?: Variant;
};

export function LinkButton({
  children,
  className = "",
  href,
  size = "medium",
  variant = "default",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={actionClassName(variant, size, className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Chip({
  children,
  active = false,
}: CommonProps & { active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
        active
          ? "border-(--color-brand-border) bg-(--color-brand-soft) text-(--color-brand-light)"
          : "border-(--color-border) bg-(--color-surface) text-slate-400"
      }`}
    >
      {children}
    </span>
  );
}

export function SwitchIndicator() {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-9 items-center justify-end rounded-full bg-(--color-brand) p-0.5"
    >
      <span className="size-4 rounded-full bg-white shadow" />
    </span>
  );
}

export function CheckboxIndicator() {
  return (
    <span
      aria-hidden="true"
      className="grid size-5 place-items-center rounded-md border border-(--color-brand-border) bg-(--color-brand) text-xs font-bold text-white"
    >
      ✓
    </span>
  );
}
