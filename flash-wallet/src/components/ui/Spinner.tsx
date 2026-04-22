import { clsx } from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "white" | "gray";
  className?: string;
}

const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
const colors = {
  blue: "border-flash-blue border-t-transparent",
  white: "border-white border-t-transparent",
  gray: "border-flash-gray-text border-t-transparent",
};

export function Spinner({ size = "md", color = "blue", className }: SpinnerProps) {
  return (
    <span
      className={clsx(
        "inline-block border-2 rounded-full animate-spin",
        sizes[size],
        colors[color],
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-flash-gray flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
          <span className="text-white text-2xl">⚡</span>
        </div>
        <p className="text-flash-gray-text text-sm font-medium">Chargement...</p>
      </div>
    </div>
  );
}
