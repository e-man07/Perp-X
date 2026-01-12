import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "error" | "ghost" | "outline" | "long" | "short";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "active:scale-[0.98]",
          // Variants
          {
            // Primary - white button with hover effects
            "bg-white text-black hover:bg-gray-100 hover:shadow-glow-md border border-white/20": variant === "primary",
            // Secondary - dark with border
            "bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600": variant === "secondary",
            // Success - green tinted
            "bg-success/20 text-success hover:bg-success/30 border border-success/30 hover:border-success/50 hover:shadow-glow-success": variant === "success",
            // Error - red tinted
            "bg-error/20 text-error hover:bg-error/30 border border-error/30 hover:border-error/50 hover:shadow-glow-error": variant === "error",
            // Ghost - transparent
            "bg-transparent text-gray-400 hover:text-white hover:bg-white/5": variant === "ghost",
            // Outline - bordered only
            "bg-transparent text-white border border-gray-700 hover:border-gray-500 hover:bg-white/5": variant === "outline",
            // Long position - green gradient
            "bg-gradient-to-r from-success/20 to-success/10 text-success hover:from-success/30 hover:to-success/20 border border-success/30 hover:shadow-glow-success font-semibold": variant === "long",
            // Short position - red gradient
            "bg-gradient-to-r from-error/20 to-error/10 text-error hover:from-error/30 hover:to-error/20 border border-error/30 hover:shadow-glow-error font-semibold": variant === "short",
          },
          // Sizes
          {
            "h-8 px-3 text-xs rounded-md gap-1.5": size === "sm",
            "h-10 px-4 text-sm rounded-lg gap-2": size === "md",
            "h-12 px-6 text-base rounded-lg gap-2": size === "lg",
            "h-14 px-8 text-lg rounded-xl gap-3": size === "xl",
          },
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
