import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
// import logoImage from "@/assets/glowdesk-logo.png"; // Fallback to gradient logo

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg";
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ className, variant = "full", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-6",
      md: "h-8", 
      lg: "h-12"
    };

    if (variant === "icon") {
      return (
        <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div className={cn(
          "rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold",
          sizeClasses[size],
          "aspect-square"
        )}>
          🦋
        </div>
      </div>
      );
    }

    if (variant === "text") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center", className)}
          {...props}
        >
          <span className={cn(
            "font-heading font-bold bg-gradient-primary bg-clip-text text-transparent",
            size === "sm" && "text-lg",
            size === "md" && "text-xl",
            size === "lg" && "text-2xl"
          )}>
            Glowdesk
          </span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div className={cn(
          "rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold",
          sizeClasses[size],
          "aspect-square"
        )}>
          🦋
        </div>
        <span className={cn(
          "font-heading font-bold text-foreground",
          size === "sm" && "text-lg",
          size === "md" && "text-xl", 
          size === "lg" && "text-2xl"
        )}>
          Glowdesk
        </span>
      </div>
    );
  }
);

Logo.displayName = "Logo";

export { Logo };