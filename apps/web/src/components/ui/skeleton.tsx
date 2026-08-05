import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-800/50",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-8 w-36" />
    </div>
  );
}