import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-line-subtle text-secondary flex items-center justify-center mb-4" aria-hidden>
          {icon}
        </div>
      )}
      <p className="font-display font-semibold text-subtitle">{title}</p>
      {description && <p className="text-small text-secondary mt-1 max-w-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center rounded-lg bg-primary text-white px-4 py-2 text-small font-medium hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
