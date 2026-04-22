import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-flash-dark mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-flash-gray-text">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full bg-flash-gray border rounded-2xl px-4 py-3 font-poppins text-flash-dark placeholder-flash-gray-text",
              "focus:outline-none focus:ring-2 transition-all duration-200 text-sm",
              error
                ? "border-flash-danger focus:border-flash-danger focus:ring-red-100"
                : "border-flash-gray-border focus:border-flash-blue focus:ring-flash-blue-100",
              leftIcon && "pl-10",
              rightElement && "pr-12",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-flash-danger text-xs mt-1">{error}</p>}
        {hint && !error && <p className="text-flash-gray-text text-xs mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
