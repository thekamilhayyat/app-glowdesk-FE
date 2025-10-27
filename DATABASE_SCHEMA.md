# Glowdesk Database Schema Documentation

## Overview

This document provides the complete PostgreSQL database schema for the Glowdesk salon management system. The schema is designed to support all MVP features including appointments, clients, staff, services, inventory, and point-of-sale operations.

## Database Setup

```sql
-- Create database
CREATE DATABASE glowdesk;

-- Connect to database
\c glowdesk;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';
```

---

## Core Tables

### Users Table

Stores system users with authentication and authorization information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'receptionist')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Clients Table

Stores customer/client information.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  notes TEXT,
  tags TEXT[],
  is_vip BOOLEAN DEFAULT false,
  preferred_staff_id UUID,
  marketing_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_is_vip ON clients(is_vip);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Full-text search
CREATE INDEX idx_clients_name_fulltext ON clients USING gin(to_tsvector('english', name));
CREATE INDEX idx_clients_email_fulltext ON clients USING gin(to_tsvector('english', email));

-- Update timestamp trigger
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Staff Table

Stores staff member information.

```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(100),
  specialties TEXT[],
  bio TEXT,
  profile_image_url VARCHAR(500),
  color VARCHAR(7), -- Hex color for calendar display
  commission_rate DECIMAL(5,2) CHECK (commission_rate >= 0 AND commission_rate <= 100),
  hourly_rate DECIMAL(10,2),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  working_hours JSONB, -- Store working hours schedule
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- Update timestamp trigger
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Services Table

Stores service/treatment offerings.

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  duration INTEGER NOT NULL CHECK (duration > 0), -- Duration in minutes
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10,2) CHECK (cost >= 0), -- Cost for margin calculation
  is_active BOOLEAN DEFAULT true,
  requires_deposit BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2),
  booking_buffer_before INTEGER DEFAULT 0, -- Buffer time before in minutes
  booking_buffer_after INTEGER DEFAULT 0, -- Buffer time after in minutes
  max_advance_booking_days INTEGER, -- How far in advance can be booked
  cancellation_policy TEXT,
  image_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_services_display_order ON services(display_order);

-- Update timestamp trigger
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Staff_Services Junction Table

Maps which services each staff member can perform.

```sql
CREATE TABLE staff_services (
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (staff_id, service_id)
);

-- Indexes
CREATE INDEX idx_staff_services_staff_id ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service_id ON staff_services(service_id);
```

---

## Appointment Management

### Appointments Table

Stores all appointment bookings.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'checked-in', 'in-progress', 'completed', 'canceled', 'no-show')
  ),
  cancellation_reason TEXT,
  canceled_at TIMESTAMP,
  canceled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  internal_notes TEXT, -- Staff-only notes
  has_unread_messages BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB, -- Store recurrence rules
  parent_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2),
  total_price DECIMAL(10,2),
  actual_start_time TIMESTAMP, -- When service actually started
  actual_end_time TIMESTAMP, -- When service actually ended
  reminder_sent_at TIMESTAMP,
  confirmation_sent_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: end_time must be after start_time
  CONSTRAINT check_appointment_times CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_end_time ON appointments(end_time);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX idx_appointments_is_recurring ON appointments(is_recurring);

-- Composite indexes for common queries
CREATE INDEX idx_appointments_staff_time ON appointments(staff_id, start_time, end_time);
CREATE INDEX idx_appointments_client_time ON appointments(client_id, start_time DESC);

-- Update timestamp trigger
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Appointment_Services Junction Table

Maps which services are included in each appointment.

```sql
CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL, -- Can be different from appointment staff
  duration INTEGER, -- Actual duration if different from service default
  price DECIMAL(10,2), -- Price at time of booking (may differ from current service price)
  discount_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_appointment_services_appointment_id ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service_id ON appointment_services(service_id);
```

---

## Point of Sale

### Sales Table

Stores completed transactions.

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  total_discount DECIMAL(10,2) DEFAULT 0 CHECK (total_discount >= 0),
  tax DECIMAL(10,2) DEFAULT 0 CHECK (tax >= 0),
  tip DECIMAL(10,2) DEFAULT 0 CHECK (tip >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (
    status IN ('draft', 'processing', 'completed', 'failed', 'refunded', 'partially-refunded')
  ),
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMP,
  notes TEXT,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sales_transaction_id ON sales(transaction_id);
CREATE INDEX idx_sales_appointment_id ON sales(appointment_id);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_completed_at ON sales(completed_at DESC);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_completed_by ON sales(completed_by);

-- Update timestamp trigger
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Sale_Items Table

Stores individual items in each sale.

```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('service', 'product')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  product_id UUID, -- Will reference products table
  discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2),
  line_total DECIMAL(10,2) NOT NULL, -- Calculated: (price * quantity) - discount
  commission_eligible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_staff_id ON sale_items(staff_id);
CREATE INDEX idx_sale_items_service_id ON sale_items(service_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_sale_items_type ON sale_items(type);
```

### Payment_Methods Table

Stores payment method details for each sale.

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('cash', 'credit-card', 'debit-card', 'gift-card', 'check', 'online', 'other')
  ),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  reference VARCHAR(255), -- Card last 4, check number, transaction ID, etc.
  card_brand VARCHAR(50), -- Visa, Mastercard, etc.
  gift_card_number VARCHAR(100),
  notes TEXT,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payment_methods_sale_id ON payment_methods(sale_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
```

---

## Inventory Management

### Manufacturers Table

Stores product manufacturers.

```sql
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  website VARCHAR(500),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_manufacturers_name ON manufacturers(name);
CREATE INDEX idx_manufacturers_is_active ON manufacturers(is_active);

-- Update timestamp trigger
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Product_Types Table

Stores product categories/types.

```sql
CREATE TABLE product_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_product_types_name ON product_types(name);
CREATE INDEX idx_product_types_parent_type_id ON product_types(parent_type_id);
CREATE INDEX idx_product_types_is_active ON product_types(is_active);

-- Update timestamp trigger
CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON product_types
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Products Table

Stores inventory products.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10,2) CHECK (cost >= 0),
  quantity_in_stock INTEGER DEFAULT 0 CHECK (quantity_in_stock >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  reorder_point INTEGER DEFAULT 5,
  reorder_quantity INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  is_sellable BOOLEAN DEFAULT true,
  is_retail BOOLEAN DEFAULT true, -- Can be sold to retail customers
  track_inventory BOOLEAN DEFAULT true,
  size VARCHAR(50),
  unit VARCHAR(50), -- oz, ml, g, kg, etc.
  image_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_manufacturer_id ON products(manufacturer_id);
CREATE INDEX idx_products_type_id ON products(type_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_low_stock ON products(quantity_in_stock) WHERE quantity_in_stock <= low_stock_threshold;

-- Full-text search
CREATE INDEX idx_products_name_fulltext ON products USING gin(to_tsvector('english', name));

-- Update timestamp trigger
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Inventory_Transactions Table

Tracks all inventory movements.

```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('purchase', 'sale', 'adjustment', 'waste', 'return', 'transfer')
  ),
  quantity INTEGER NOT NULL, -- Positive for additions, negative for removals
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  cost_per_unit DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reference_type VARCHAR(50), -- 'sale', 'purchase_order', 'manual', etc.
  reference_id UUID, -- ID of related record
  notes TEXT,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);
```

---

## Additional Tables

### Client_Notes Table

Stores notes and history for clients.

```sql
CREATE TABLE client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('general', 'allergy', 'preference', 'medical', 'complaint', 'feedback')),
  is_alert BOOLEAN DEFAULT false, -- Shows prominently when booking
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX idx_client_notes_type ON client_notes(type);
CREATE INDEX idx_client_notes_is_alert ON client_notes(is_alert);
CREATE INDEX idx_client_notes_created_at ON client_notes(created_at DESC);

-- Update timestamp trigger
CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON client_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Business_Settings Table

Stores global business configuration.

```sql
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(100),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_business_settings_key ON business_settings(key);
CREATE INDEX idx_business_settings_category ON business_settings(category);

-- Update timestamp trigger
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Views

### Active Appointments View

```sql
CREATE OR REPLACE VIEW active_appointments AS
SELECT 
  a.id,
  a.start_time,
  a.end_time,
  a.status,
  c.name AS client_name,
  c.phone AS client_phone,
  c.email AS client_email,
  s.first_name || ' ' || s.last_name AS staff_name,
  s.color AS staff_color,
  a.total_price,
  a.deposit_paid,
  a.has_unread_messages,
  a.is_recurring,
  ARRAY_AGG(DISTINCT srv.name) AS service_names,
  a.created_at,
  a.updated_at
FROM appointments a
JOIN clients c ON a.client_id = c.id
LEFT JOIN staff s ON a.staff_id = s.id
LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
LEFT JOIN services srv ON aps.service_id = srv.id
WHERE a.status NOT IN ('canceled', 'no-show', 'completed')
  AND a.start_time >= CURRENT_DATE
GROUP BY a.id, c.id, s.id;
```

### Client Lifetime Value View

```sql
CREATE OR REPLACE VIEW client_lifetime_value AS
SELECT 
  c.id AS client_id,
  c.name AS client_name,
  COUNT(DISTINCT a.id) AS total_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) AS completed_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'no-show' THEN a.id END) AS no_show_count,
  COUNT(DISTINCT s.id) AS total_purchases,
  COALESCE(SUM(s.total), 0) AS lifetime_spend,
  COALESCE(AVG(s.total), 0) AS average_ticket,
  MAX(a.start_time) AS last_appointment_date,
  MIN(a.start_time) AS first_appointment_date
FROM clients c
LEFT JOIN appointments a ON c.id = a.client_id
LEFT JOIN sales s ON c.id = s.client_id AND s.status = 'completed'
GROUP BY c.id, c.name;
```

### Daily Sales Summary View

```sql
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
  DATE(completed_at) AS sale_date,
  COUNT(*) AS transaction_count,
  SUM(subtotal) AS total_subtotal,
  SUM(total_discount) AS total_discounts,
  SUM(tax) AS total_tax,
  SUM(tip) AS total_tips,
  SUM(total) AS total_revenue,
  AVG(total) AS average_ticket,
  COUNT(DISTINCT client_id) AS unique_clients
FROM sales
WHERE status = 'completed'
  AND completed_at IS NOT NULL
GROUP BY DATE(completed_at)
ORDER BY sale_date DESC;
```

### Low Stock Products View

```sql
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.sku,
  p.name,
  p.quantity_in_stock,
  p.low_stock_threshold,
  p.reorder_point,
  p.reorder_quantity,
  m.name AS manufacturer_name,
  pt.name AS product_type
FROM products p
LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
LEFT JOIN product_types pt ON p.type_id = pt.id
WHERE p.is_active = true
  AND p.track_inventory = true
  AND p.quantity_in_stock <= p.low_stock_threshold
ORDER BY p.quantity_in_stock ASC;
```

---

## Common Queries

### Find Available Time Slots

```sql
-- Find available time slots for a staff member on a specific date
WITH RECURSIVE time_slots AS (
  SELECT 
    $1::DATE + (n || ' minutes')::INTERVAL AS slot_start,
    $1::DATE + ((n + $3) || ' minutes')::INTERVAL AS slot_end
  FROM generate_series(540, 1080, $3) AS n -- 9 AM (540 min) to 6 PM (1080 min)
)
SELECT 
  slot_start,
  slot_end
FROM time_slots ts
WHERE NOT EXISTS (
  SELECT 1
  FROM appointments a
  WHERE a.staff_id = $2
    AND a.status NOT IN ('canceled', 'no-show')
    AND (
      (a.start_time, a.end_time) OVERLAPS (ts.slot_start, ts.slot_end)
    )
)
ORDER BY slot_start;
-- Parameters: $1 = date, $2 = staff_id, $3 = duration in minutes
```

### Check for Appointment Conflicts

```sql
-- Check if a time slot conflicts with existing appointments
SELECT EXISTS (
  SELECT 1
  FROM appointments
  WHERE staff_id = $1
    AND status NOT IN ('canceled', 'no-show')
    AND id != COALESCE($4, '00000000-0000-0000-0000-000000000000')
    AND (start_time, end_time) OVERLAPS ($2::TIMESTAMP, $3::TIMESTAMP)
) AS has_conflict;
-- Parameters: $1 = staff_id, $2 = start_time, $3 = end_time, $4 = exclude_appointment_id (optional)
```

---

## Data Migration Notes

### From Current Mock Data

1. **Users**: Create admin user, map staff to users
2. **Clients**: Import from `clients.json`, generate UUIDs
3. **Staff**: Import from `staff.json`, link to users table
4. **Services**: Import from `services.json`
5. **Appointments**: Generate from mock calendar data
6. **Products**: Import from inventory mock data

### Initial Setup Data

```sql
-- Insert default admin user (password should be hashed)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@glowdesk.com', '$2b$10$...', 'Admin', 'User', 'admin');

-- Insert default business settings
INSERT INTO business_settings (key, value, description, category)
VALUES 
  ('tax_rate', '0.0825', 'Default tax rate (8.25%)', 'financial'),
  ('currency', '"USD"', 'Default currency', 'financial'),
  ('timezone', '"America/New_York"', 'Business timezone', 'general'),
  ('business_hours', '{"monday": {"open": "09:00", "close": "18:00"}}', 'Default business hours', 'scheduling');
```

---

## Performance Considerations

1. **Indexes**: All foreign keys have indexes for faster joins
2. **Partitioning**: Consider partitioning `appointments` and `sales` tables by date for large datasets
3. **Archiving**: Implement archiving strategy for old completed/canceled appointments
4. **Full-text Search**: Use PostgreSQL full-text search for client and product searches
5. **Connection Pooling**: Use connection pooling (e.g., PgBouncer) for production
6. **Caching**: Implement Redis caching for frequently accessed data (business settings, services)

---

## Security Considerations

1. **Row-Level Security**: Implement RLS for multi-tenant scenarios
2. **Audit Logging**: Consider audit tables for sensitive data changes
3. **Data Encryption**: Encrypt sensitive fields (email, phone, payment references)
4. **Backup Strategy**: Daily automated backups with point-in-time recovery
5. **Access Control**: Use database roles and permissions appropriately

---

## Version

**Database Schema Version**: 1.0.0  
**Last Updated**: October 12, 2025  
**Compatible with**: Glowdesk MVP

