import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "filled" | "ghost";
  inputSize?: "sm" | "md" | "lg";
  error?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", inputSize = "md", error, icon, suffix, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            // Base styles
            "w-full font-mono transition-all duration-200",
            "placeholder:text-gray-600",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Variants
            {
              // Default - bordered
              "bg-gray-950 border border-gray-800 focus:border-gray-600 focus:ring-1 focus:ring-gray-700 rounded-lg": variant === "default",
              // Filled - solid background
              "bg-gray-900 border border-transparent focus:border-gray-700 focus:ring-1 focus:ring-gray-700 rounded-lg": variant === "filled",
              // Ghost - minimal
              "bg-transparent border-b border-gray-800 focus:border-gray-600 rounded-none": variant === "ghost",
            },
            // Sizes
            {
              "h-8 px-3 text-xs": inputSize === "sm",
              "h-10 px-4 text-sm": inputSize === "md",
              "h-12 px-4 text-base": inputSize === "lg",
            },
            // Error state
            error && "border-error/50 focus:border-error focus:ring-error/30",
            // Icon padding
            icon && "pl-10",
            suffix && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-gray-500">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Labeled Input component
interface LabeledInputProps extends InputProps {
  label: string;
  hint?: string;
  errorMessage?: string;
}

const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, hint, errorMessage, error, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            {label}
          </label>
          {hint && (
            <span className="text-xs text-gray-600">{hint}</span>
          )}
        </div>
        <Input ref={ref} error={error || !!errorMessage} {...props} />
        {errorMessage && (
          <p className="text-xs text-error">{errorMessage}</p>
        )}
      </div>
    );
  }
);

LabeledInput.displayName = "LabeledInput";

export { Input, LabeledInput };
