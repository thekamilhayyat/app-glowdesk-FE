import { forwardRef } from "react";
import { Input as AntInput } from "antd";
import { cn } from "@/lib/utils";

export interface BaseInputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  size?: 'small' | 'middle' | 'large';
  [key: string]: any;
}

const BaseInput = forwardRef<any, BaseInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <AntInput
        ref={ref}
        className={cn(
          "w-full",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        style={{ borderRadius: '6px', ...props.style }}
        {...props}
      />
    );
  }
);

BaseInput.displayName = "BaseInput";

export { BaseInput };