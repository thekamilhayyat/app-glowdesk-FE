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

// Inventory validation schemas
export const inventoryFormInputSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  manufacturer_id: z.string().min(1, 'Manufacturer ID is required'),
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  cost_price: z.string().min(1, 'Cost price is required'),
  retail_price: z.string().optional(),
  current_stock: z.string().optional().default('0'),
  low_stock_threshold: z.string().optional().default('5'),
  reorder_quantity: z.string().optional().default('10'),
  reorder_point: z.string().optional().default('5'),
  unit_of_measure: z.string().optional().default('unit'),
  supplier_id: z.string().optional(),
  is_retail: z.boolean().optional().default(true),
  is_back_bar: z.boolean().optional().default(false),
  track_stock: z.boolean().optional().default(true),
  taxable: z.boolean().optional().default(true),
  notes: z.string().optional()
});

export const inventoryFormSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  manufacturer_id: z.string().min(1, 'Manufacturer ID is required'),
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  cost_price: z.string().min(1, 'Cost price is required').transform((val) => parseFloat(val)),
  retail_price: z.string().optional().transform((val) => val ? parseFloat(val) : null),
  current_stock: z.string().transform((val) => parseInt(val) || 0),
  low_stock_threshold: z.string().transform((val) => parseInt(val) || 5),
  reorder_quantity: z.string().transform((val) => parseInt(val) || 10),
  reorder_point: z.string().transform((val) => parseInt(val) || 5),
  unit_of_measure: z.string().default('unit'),
  supplier_id: z.string().optional(),
  is_retail: z.boolean().default(true),
  is_back_bar: z.boolean().default(false),
  track_stock: z.boolean().default(true),
  taxable: z.boolean().default(true),
  notes: z.string().optional()
});

export const typeFormSchema = z.object({
  name: z.string().min(1, 'Type name is required')
});

export const manufacturerFormSchema = z.object({
  name: z.string().min(1, 'Manufacturer name is required')
});

export const supplierFormSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  paymentTerms: z.string().optional(),
  leadTimeDays: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  notes: z.string().optional()
});

export const stockAdjustmentFormSchema = z.object({
  quantity: z.string().min(1, 'Quantity is required').transform((val) => parseInt(val)),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional()
});

export const purchaseOrderItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantityOrdered: z.number().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0, 'Cost must be 0 or greater')
});

export const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional()
});

export const stocktakeFormSchema = z.object({
  name: z.string().min(1, 'Stocktake name is required'),
  description: z.string().optional()
});

export type InventoryFormInputData = z.infer<typeof inventoryFormInputSchema>;
export type InventoryFormData = z.infer<typeof inventoryFormSchema>;
export type TypeFormData = z.infer<typeof typeFormSchema>;
export type ManufacturerFormData = z.infer<typeof manufacturerFormSchema>;
export type SupplierFormData = z.infer<typeof supplierFormSchema>;
export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentFormSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;
export type StocktakeFormData = z.infer<typeof stocktakeFormSchema>;

// Staff validation schemas
export const staffFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: z.string().min(1, "Role is required"),
});

export type StaffFormData = z.infer<typeof staffFormSchema>; 