import { LabelHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        accent: "text-accent-foreground",
        destructive: "text-destructive",
        success: "text-success",
        warning: "text-warning",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "medium",
    },
  }
);

export interface BaseLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

const BaseLabel = forwardRef<HTMLLabelElement, BaseLabelProps>(
  ({ className, variant, size, weight, ...props }, ref) => {
    return (
      <label
        className={cn(labelVariants({ variant, size, weight, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

BaseLabel.displayName = "BaseLabel";

export { BaseLabel, labelVariants };