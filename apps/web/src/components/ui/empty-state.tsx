type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="mb-4 text-4xl">{icon}</span>
      <h3 className="mb-1 text-sm font-semibold text-zinc-300">{title}</h3>
      <p className="mb-4 max-w-xs text-xs text-zinc-500">{description}</p>
      {action}
    </div>
  );
}