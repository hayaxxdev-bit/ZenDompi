import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-zinc-800 text-zinc-300",
  success: "bg-emerald-950/50 text-emerald-400",
  warning: "bg-amber-950/50 text-amber-400",
  danger: "bg-red-950/50 text-red-400",
  info: "bg-blue-950/50 text-blue-400",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}