import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "error" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-white text-black hover:bg-gray-200 focus:ring-white": variant === "primary",
            "bg-secondary text-foreground hover:bg-muted focus:ring-secondary": variant === "secondary",
            "bg-success text-white hover:bg-success/90 focus:ring-success": variant === "success",
            "bg-error text-white hover:bg-error/90 focus:ring-error": variant === "error",
            "bg-transparent hover:bg-muted focus:ring-muted": variant === "ghost",
            "h-8 px-3 text-xs rounded": size === "sm",
            "h-10 px-4 text-sm rounded-md": size === "md",
            "h-12 px-6 text-base rounded-md": size === "lg",
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
