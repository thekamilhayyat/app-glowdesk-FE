import { InputHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full border border-input bg-background text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        filled: "bg-muted border-transparent focus-visible:bg-background focus-visible:border-input",
        outline: "border-2 focus-visible:border-primary",
        ghost: "border-transparent bg-transparent focus-visible:bg-muted",
      },
      size: {
        sm: "h-8 px-3 py-1 text-xs rounded-sm",
        default: "h-10 px-3 py-2 rounded-md",
        lg: "h-12 px-4 py-3 text-base rounded-md",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);

export interface BaseInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ className, variant, size, rounded, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

BaseInput.displayName = "BaseInput";

export { BaseInput, inputVariants };