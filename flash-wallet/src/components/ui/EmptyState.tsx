import { ReactNode } from "react";
import { Zap } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 bg-flash-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-flash-blue">
        {icon || <Zap className="w-8 h-8" />}
      </div>
      <h3 className="font-semibold text-flash-dark mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-flash-gray-text max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
