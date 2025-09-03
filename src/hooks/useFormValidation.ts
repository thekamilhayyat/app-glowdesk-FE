import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function useFormValidation<T extends z.ZodType>(schema: T) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: "onChange", // Validate on change for real-time feedback
  });

  return form;
}

// Helper function to get field error
export function getFieldError(errors: any, fieldName: string): string | undefined {
  const fieldNames = fieldName.split('.');
  let error = errors;
  
  for (const name of fieldNames) {
    error = error?.[name];
    if (!error) break;
  }
  
  return error?.message;
}

// Helper function to check if field has error
export function hasFieldError(errors: any, fieldName: string): boolean {
  return !!getFieldError(errors, fieldName);
} 