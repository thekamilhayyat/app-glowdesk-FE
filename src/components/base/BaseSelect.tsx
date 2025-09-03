import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BaseSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function BaseSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  error = false,
  className,
  children,
  ...props
}: BaseSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled} {...props}>
      <SelectTrigger 
        className={cn(
          "w-full",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
}

interface BaseSelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function BaseSelectItem({ value, children, disabled = false }: BaseSelectItemProps) {
  return (
    <SelectItem value={value} disabled={disabled}>
      {children}
    </SelectItem>
  );
} 