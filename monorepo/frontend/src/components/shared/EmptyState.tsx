import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ message, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <p className="text-base font-medium text-muted-foreground">{message}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
