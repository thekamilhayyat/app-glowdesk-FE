import { pgTable, uuid, varchar, text, boolean, timestamp, decimal, integer, date, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clients Table
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 20 }),
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('USA'),
  notes: text('notes'),
  tags: text('tags').array(),
  isVip: boolean('is_vip').default(false),
  preferredStaffId: uuid('preferred_staff_id'),
  marketingOptIn: boolean('marketing_opt_in').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Staff Table
export const staff = pgTable('staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 100 }),
  specialties: text('specialties').array(),
  bio: text('bio'),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  color: varchar('color', { length: 7 }),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  hireDate: date('hire_date'),
  isActive: boolean('is_active').default(true),
  workingHours: jsonb('working_hours'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// Services Table
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  duration: integer('duration').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  requiresDeposit: boolean('requires_deposit').default(false),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  bookingBufferBefore: integer('booking_buffer_before').default(0),
  bookingBufferAfter: integer('booking_buffer_after').default(0),
  maxAdvanceBookingDays: integer('max_advance_booking_days'),
  cancellationPolicy: text('cancellation_policy'),
  imageUrl: varchar('image_url', { length: 500 }),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Staff Services Junction Table
export const staffServices = pgTable('staff_services', {
  staffId: uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.staffId, table.serviceId] }),
}));

export const insertStaffServiceSchema = createInsertSchema(staffServices).omit({ createdAt: true });
export type InsertStaffService = z.infer<typeof insertStaffServiceSchema>;
export type StaffService = typeof staffServices.$inferSelect;

// Appointments Table
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  staffId: uuid('staff_id').references(() => staff.id, { onDelete: 'set null' }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  cancellationReason: text('cancellation_reason'),
  canceledAt: timestamp('canceled_at'),
  canceledBy: uuid('canceled_by'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  hasUnreadMessages: boolean('has_unread_messages').default(false),
  isRecurring: boolean('is_recurring').default(false),
  recurringPattern: jsonb('recurring_pattern'),
  parentAppointmentId: uuid('parent_appointment_id'),
  depositPaid: boolean('deposit_paid').default(false),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  reminderSentAt: timestamp('reminder_sent_at'),
  confirmationSentAt: timestamp('confirmation_sent_at'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Appointment Services Junction Table
export const appointmentServices = pgTable('appointment_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  staffId: uuid('staff_id').references(() => staff.id, { onDelete: 'set null' }),
  duration: integer('duration'),
  price: decimal('price', { precision: 10, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertAppointmentServiceSchema = createInsertSchema(appointmentServices).omit({ id: true, createdAt: true });
export type InsertAppointmentService = z.infer<typeof insertAppointmentServiceSchema>;
export type AppointmentService = typeof appointmentServices.$inferSelect;

// Sales Table
export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: varchar('transaction_id', { length: 100 }).notNull().unique(),
  appointmentId: uuid('appointment_id'),
  clientId: uuid('client_id'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  totalDiscount: decimal('total_discount', { precision: 10, scale: 2 }).default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  tip: decimal('tip', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('completed'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).default('0'),
  refundReason: text('refund_reason'),
  refundedAt: timestamp('refunded_at'),
  notes: text('notes'),
  completedBy: uuid('completed_by'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// Sale Items Table
export const saleItems = pgTable('sale_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  staffId: uuid('staff_id'),
  serviceId: uuid('service_id'),
  productId: uuid('product_id'),
  discountType: varchar('discount_type', { length: 50 }),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }),
  lineTotal: decimal('line_total', { precision: 10, scale: 2 }).notNull(),
  commissionEligible: boolean('commission_eligible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({ id: true, createdAt: true });
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItems.$inferSelect;

// Payment Methods Table
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reference: varchar('reference', { length: 255 }),
  cardBrand: varchar('card_brand', { length: 50 }),
  giftCardNumber: varchar('gift_card_number', { length: 100 }),
  notes: text('notes'),
  processedAt: timestamp('processed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true, createdAt: true });
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Manufacturers Table
export const manufacturers = pgTable('manufacturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  website: varchar('website', { length: 500 }),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertManufacturerSchema = createInsertSchema(manufacturers).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertManufacturer = z.infer<typeof insertManufacturerSchema>;
export type Manufacturer = typeof manufacturers.$inferSelect;

// Product Types Table
export const productTypes = pgTable('product_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  parentTypeId: uuid('parent_type_id'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProductTypeSchema = createInsertSchema(productTypes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type ProductType = typeof productTypes.$inferSelect;

// Products Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 100 }).unique(),
  barcode: varchar('barcode', { length: 100 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  manufacturerId: uuid('manufacturer_id'),
  typeId: uuid('type_id'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  quantityInStock: integer('quantity_in_stock').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  reorderPoint: integer('reorder_point').default(5),
  reorderQuantity: integer('reorder_quantity').default(20),
  isActive: boolean('is_active').default(true),
  isSellable: boolean('is_sellable').default(true),
  isRetail: boolean('is_retail').default(true),
  trackInventory: boolean('track_inventory').default(true),
  size: varchar('size', { length: 50 }),
  unit: varchar('unit', { length: 50 }),
  imageUrl: varchar('image_url', { length: 500 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Inventory Transactions Table
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  quantity: integer('quantity').notNull(),
  quantityBefore: integer('quantity_before').notNull(),
  quantityAfter: integer('quantity_after').notNull(),
  costPerUnit: decimal('cost_per_unit', { precision: 10, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  notes: text('notes'),
  performedBy: uuid('performed_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({ id: true, createdAt: true });
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
