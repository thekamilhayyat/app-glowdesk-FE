import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters");

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .min(10, "Phone number must be at least 10 digits");

// Service validation schemas
export const categorySchema = z
  .string()
  .min(1, "Category name is required")
  .min(2, "Category name must be at least 2 characters")
  .max(50, "Category name must be less than 50 characters");

export const serviceNameSchema = z
  .string()
  .min(1, "Service name is required")
  .min(2, "Service name must be at least 2 characters")
  .max(100, "Service name must be less than 100 characters");

export const serviceDescriptionSchema = z
  .string()
  .max(500, "Description must be less than 500 characters")
  .optional();

export const serviceDurationSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === 'string' ? Number(val) : val;
    if (isNaN(num)) throw new Error("Duration must be a valid number");
    return num;
  })
  .pipe(
    z.number()
      .min(1, "Duration must be at least 1 minute")
      .max(480, "Duration cannot exceed 8 hours")
  );

export const servicePriceSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === 'string' ? Number(val) : val;
    if (isNaN(num)) throw new Error("Price must be a valid number");
    return num;
  })
  .pipe(
    z.number()
      .min(0.01, "Price must be greater than 0")
      .max(10000, "Price cannot exceed $10,000")
  );

// Form schemas
export const categoryFormSchema = z.object({
  name: categorySchema,
});

export const serviceFormInputSchema = z.object({
  name: serviceNameSchema,
  category_id: z.string().min(1, "Category is required"),
  description: serviceDescriptionSchema,
  duration_min: z.string().min(1, "Duration is required"),
  price: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === 'string' ? Number(val) : val;
    if (isNaN(num)) throw new Error("Price must be a valid number");
    return num;
  }),
  currency: z.string().default("USD"),
});

export const serviceFormSchema = z.object({
  name: serviceNameSchema,
  category_id: z.string().min(1, "Category is required"),
  description: serviceDescriptionSchema,
  duration_min: serviceDurationSchema,
  price: servicePriceSchema,
  currency: z.string().default("USD"),
});

export const firstTimeServiceFormSchema = z.object({
  category: categorySchema,
  service: serviceFormSchema,
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type ServiceFormInputData = z.infer<typeof serviceFormInputSchema>;
export type ServiceFormData = z.infer<typeof serviceFormSchema>;
export type FirstTimeServiceFormData = z.infer<typeof firstTimeServiceFormSchema>; 