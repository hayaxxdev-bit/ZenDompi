import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

export function Card({ children, className, padding = "md" }: CardProps) {
  const paddingClasses = {
    none: "p-0",
    sm: "p-3",
    md: "p-4 md:p-5",
    lg: "p-5 md:p-6",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}