import { ReactNode, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-flash-blue hover:bg-flash-blue-dark text-white shadow-flash hover:shadow-flash-lg",
  secondary: "bg-flash-blue-50 hover:bg-flash-blue-100 text-flash-blue",
  outline: "border-2 border-flash-blue text-flash-blue hover:bg-flash-blue hover:text-white",
  ghost: "text-flash-gray-text hover:bg-flash-gray hover:text-flash-dark",
  danger: "bg-red-50 hover:bg-red-100 text-flash-danger",
};

const sizes: Record<Size, string> = {
  sm: "py-2 px-4 text-sm rounded-xl",
  md: "py-3 px-6 text-sm rounded-2xl",
  lg: "py-4 px-8 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "font-semibold font-poppins transition-all duration-200 active:scale-95 flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
