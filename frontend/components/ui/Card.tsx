import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "elevated";
  hoverable?: boolean;
  noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverable, noPadding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-300",
          !noPadding && "p-5",
          {
            // Default - solid dark with subtle border
            "bg-gray-950 border border-gray-800/50": variant === "default",
            // Glass - translucent with blur
            "glass": variant === "glass",
            // Gradient border effect
            "gradient-border": variant === "gradient",
            // Elevated - with shadow
            "bg-gray-950 border border-gray-800/50 shadow-card": variant === "elevated",
          },
          hoverable && "card-hover cursor-pointer hover:border-gray-700",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 pb-4", className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = "h3", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight text-white",
          className
        )}
        {...props}
      />
    );
  }
);

CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-gray-500", className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = "CardDescription";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />;
  }
);

CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center pt-4 border-t border-gray-800/50", className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
