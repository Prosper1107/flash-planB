import { clsx } from "clsx";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-flash-blue-50 text-flash-blue border border-flash-blue-100",
  default: "bg-flash-gray text-flash-gray-text border border-flash-gray-border",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    completed: { label: "Complété", variant: "success" },
    pending: { label: "En attente", variant: "warning" },
    processing: { label: "En cours", variant: "warning" },
    failed: { label: "Échoué", variant: "danger" },
  };
  const { label, variant } = map[status] || { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}
