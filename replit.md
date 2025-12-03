# Overview

This is a salon management system called "GlowFlowApp" built with React, TypeScript, and Vite. The application provides a comprehensive solution for managing salon operations including client management, staff scheduling, service offerings, appointments, and inventory tracking. It features a modern, responsive interface with authentication, dashboard analytics, and complete CRUD operations for all business entities.

# Recent Changes

## December 3, 2025
### Phase 1: Enterprise Features Foundation

Implemented comprehensive type definitions and state management for enterprise salon features (commission management, time tracking, memberships, packages, permissions):

**New Type Definitions**:

1. **Staff Types** (src/types/staff.ts):
   - `StaffMember` with complete profile (pay type, commission rates, permissions, scheduling)
   - `CommissionPlan` and `CommissionTier` for flexible commission structures (percentage, fixed, tiered)
   - `TimeEntry`, `BreakEntry`, `Timesheet` for time clock tracking
   - `PayrollSummary` for payroll calculations
   - `SchedulePattern`, `WeekPattern`, `DaySchedule`, `Shift` for advanced scheduling
   - `TimeOffRequest` for vacation/sick leave management
   - `StaffPermissions` with granular permissions for all modules (calendar, clients, services, inventory, sales, staff, settings, reports)
   - `PermissionTemplate` with 5 levels (owner, high, medium, low, basic)
   - `PerformanceMetrics` and `StaffGoal` for analytics
   - `StaffPricing` for staff-specific service prices
   - `Role` and `Location` types

2. **Service Types** (src/types/service.ts):
   - `Service` with processing time, blocked time, deposits, resource requirements
   - `ServiceAddOn` for additional services
   - `ServicePackage` with sequential/parallel booking, various pricing types
   - `Membership` with service-based, credit-based, or hybrid types
   - `ClientMembership` and `ClientPackagePurchase` for client enrollments
   - `Resource` and `ResourceBooking` for room/equipment management
   - `ServiceCustomization` with price/duration adjustments
   - `DynamicPricingRule` with conditions (day of week, time range, etc.)
   - `ResolvedServicePrice` and `ResolvedServiceDuration` for calculated values

3. **Settings Types** (src/types/settings.ts):
   - `BusinessProfile` with contact info, social media
   - `BusinessHours` with breaks support
   - `CommissionSettings` with calculation options
   - `TaxSettings` with custom rates
   - `PaymentSettings` with methods, tips, deposits
   - `BookingSettings` with policies
   - `CancellationPolicy` and `NoShowPolicy`
   - `NotificationSettings` for email, SMS, push

**New Zustand Stores**:

1. **staffStore** (src/stores/staffStore.ts):
   - Staff CRUD with filtering
   - Commission plan management with tiered calculation
   - Time clock (clock in/out, breaks)
   - Timesheet generation and approval
   - Payroll summary generation
   - Schedule pattern management
   - Time off requests with approval workflow
   - Staff-specific pricing
   - Performance metrics tracking
   - Staff goal management
   - Permission template management
   - Sample data for 3 staff members, 6 roles, 1 location, 2 commission plans

2. **servicesStore** (src/stores/servicesStore.ts):
   - Service CRUD with category filtering
   - Add-on management with service applicability
   - Package management with price calculation
   - Client package purchase and redemption
   - Membership management (enroll, pause, resume, cancel)
   - Credit usage tracking
   - Resource management with availability checking
   - Resource booking
   - Service customization with options
   - Staff-specific pricing
   - Dynamic pricing rules
   - `resolveServicePrice()` and `resolveServiceDuration()` for final calculations
   - Sample data for 4 services, 3 categories, 3 add-ons, 2 packages, 2 memberships, 3 resources

3. **settingsStore** (src/stores/settingsStore.ts):
   - Business profile management
   - Business hours with open/close times
   - Commission settings
   - Tax settings
   - Payment method settings
   - Booking settings with policies
   - Notification settings
   - Default values for all settings

**New Settings Page** (src/pages/Settings.tsx):
- 10-tab interface: Business, Hours, Commissions, Taxes, Payments, Booking, Notifications, Permissions, Appearance, Integrations
- Full business profile editing with address
- Business hours management with open/close toggles
- Commission rate configuration with calculation options
- Tax settings with per-category support
- Payment method toggles and tip configuration
- Booking window, buffer time, waitlist configuration, and policy settings
- Notification preferences for email/SMS
- Permission template overview with 5 role levels
- Appearance settings: brand colors (primary/secondary/accent), theme, logo position, custom CSS
- Integration settings: Google Calendar sync, Stripe payments, Mailchimp, Zapier webhooks

**Updated App Routes** (src/App.tsx):
- Added `/settings` route with Settings component

## December 1, 2025
### Major Inventory Module Enhancement (Phases 1-4)
Comprehensive inventory management system upgrade to achieve competitive parity with Mangomint and Fresha:

**New Types & Data Structures** (src/types/inventory.ts):
- Enhanced `InventoryItem` with stock tracking fields (currentStock, lowStockThreshold, reorderQuantity, reorderPoint)
- Added barcode support, unitOfMeasure, isRetail, isBackBar, trackStock, taxable flags
- New `Supplier` type with complete contact info, payment terms, lead time tracking
- New `PurchaseOrder` and `PurchaseOrderItem` types with full order lifecycle
- New `StockAdjustment` and `StockMovement` types for tracking all inventory changes
- New `Stocktake` and `StocktakeItem` types for physical inventory counts
- New `LowStockAlert` type for proactive inventory alerts
- New `ReceivingRecord` for purchase order receiving

**New Inventory Store** (src/stores/inventoryStore.ts):
- Zustand store with complete inventory state management
- Stock adjustment with movement tracking and reason codes
- Purchase order lifecycle (create, update, receive, cancel)
- Stocktake functionality (create, count, complete with optional adjustments)
- Low stock alert generation and acknowledgment
- Inventory analytics (stats, value, top-selling products)

**New Components** (src/pages/inventory/components/):
- `StockAdjustmentDrawer` - Add/remove stock with reason tracking
- `SupplierDrawer` - Create/edit suppliers with full contact details
- `SuppliersListDrawer` - View and manage supplier list
- `PurchaseOrderDrawer` - Create/edit purchase orders with line items
- `PurchaseOrdersListDrawer` - View and manage purchase orders
- `ReceiveOrderDrawer` - Receive items from purchase orders
- `StocktakeDrawer` - Physical inventory counting interface
- `StocktakeListDrawer` - View stocktake history
- `LowStockAlertsDrawer` - View and manage low stock alerts
- `StockMovementDrawer` - View stock movement history
- `InventoryReportsDrawer` - Inventory analytics and reports

**Updated Inventory Page** (src/pages/Inventory.tsx):
- Dashboard stats (total products, low stock, out of stock, inventory value)
- Quick access toolbar for all inventory operations
- Enhanced product table with stock level indicators
- Integrated all new drawer components

**Updated Validations** (src/lib/validations.ts):
- Enhanced `inventoryFormInputSchema` with new fields (barcode, stock quantities, supplier)
- Removed deprecated `serial_number` field

## October 2, 2025
### UI Improvements
- **Redesigned AppointmentCard with Google Calendar style**: Completely redesigned appointment card to follow Google Calendar's compact, simple layout
  - **Line 1**: Client name as title with line-clamp-2 (wraps to 2 lines if long), NEW indicator inline, status icons (VIP, messages, recurring) on right
  - **Line 2**: Time range in simple format (e.g., "10:00 am - 10:45 am")
  - **Line 3**: Status label (Confirmed, In Progress, etc.)
  - **Line 4**: Service name with subtle styling (reduced opacity)
  - **Bottom Section**: Compact action buttons (Edit and Checkout) with subtle border-top separator
  - **Styling**: White text on status-colored background, small text sizes (text-xs, text-sm), compact padding
  - **Functionality**: Preserved drag-and-drop, edit dialog, checkout flow, and all conditional rendering
  - **Code Quality**: Removed unused imports (Badge, Clock, User, DollarSign) and variables (duration)

## October 1, 2025
### Bug Fixes
- **Fixed duplicate appointment rendering in Day view**: Resolved critical bug where appointments were being rendered 18 times
  - **Root Cause**: TimeGrid component was rendering its children inside each of the 18 time slot divs (9 AM to 6 PM with 30-minute intervals), causing all appointments to render once per time slot
  - **Solution**: Restructured DayView architecture to isolate TimeGrid to the left column for time labels only, with staff columns and appointments rendered independently
  - **Additional Safeguards**: Added store-level deduplication in `initializeData` and `addAppointment` to prevent duplicate appointments by ID
  - This fix ensures each appointment renders exactly once while preserving drag-and-drop functionality and time slot interactions
- **Fixed incorrect type imports**: Updated imports across calendar components to use individual type files instead of non-existent '@/types/calendar' exports
- **Added missing client names in mock data**: Updated mock client data to include required `name` field along with firstName and lastName

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Combination of shadcn/ui components and Ant Design for rich UI components
- **Styling**: Tailwind CSS with custom design system including gradients, shadows, and animations
- **Routing**: React Router for client-side navigation with protected routes
- **State Management**: Zustand for global state (inventory, calendar, checkout, sales), React Context for authentication
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation

## Component Structure
- **Base Components**: Reusable UI primitives (BaseButton, BaseCard, BaseInput, BaseDrawer, etc.) with consistent styling
- **Layout Components**: AppLayout with TopNavigation for responsive navigation across desktop and mobile
- **Page Components**: Feature-specific pages (Dashboard, Clients, Staff, Services, Appointments, Inventory, POS)
- **Form Components**: Standardized form fields with validation and error handling

## Authentication System
- **Context-based**: AuthContext provides authentication state throughout the app
- **Protected Routes**: ProtectedRoute component wraps authenticated pages
- **Mock Authentication**: Uses local JSON data for demonstration with JWT-like tokens
- **Persistent Sessions**: localStorage integration for session persistence

## Data Management
- **Zustand Stores**: inventoryStore, calendarStore, checkoutStore, salesStore, staffStore, servicesStore, settingsStore for feature-specific state
- **Mock Data**: JSON files simulate backend APIs for development (clients.json, staff.json, services.json, users.json)
- **Query Management**: TanStack Query for data fetching and caching (prepared for future API integration)
- **Form Validation**: Zod schemas for comprehensive form validation with custom error messages

## UI/UX Design System
- **Theme Support**: Dark/light mode toggle with theme persistence
- **Design Tokens**: Custom CSS variables for colors, spacing, and typography
- **Component Variants**: Consistent styling variants across all components (gradient, outline, ghost, etc.)
- **Responsive Design**: Mobile-first approach with responsive navigation and layouts
- **Drawer Pattern**: Consistent drawer-based UI for all edit/create operations (width-based, not size-based)

## Notification System
- **Multiple Providers**: Dual notification system using both shadcn/ui toast and Ant Design notifications
- **Custom Service**: Centralized notification service with different types (success, warning, error, info)
- **Action Notifications**: Pre-built notifications for CRUD operations (created, updated, deleted)

# Key Implementation Notes

## Inventory Module Architecture
- Uses Zustand store pattern consistent with other stores (calendarStore, checkoutStore, salesStore)
- BaseDrawer component uses `width` prop (not `size`); all drawers use width={500} or width={600)
- Enhanced InventoryItem uses camelCase (costPrice, currentStock) instead of snake_case
- Stock movements are automatically tracked for all adjustments with reason codes
- Low stock alerts are generated based on lowStockThreshold and reorderPoint

# External Dependencies

## Core Framework Dependencies
- **React**: Core framework with hooks and context
- **TypeScript**: Type safety and development experience
- **Vite**: Build tool and development server
- **React Router**: Client-side routing and navigation

## UI Component Libraries
- **shadcn/ui**: Modern React components built on Radix UI primitives
- **Ant Design**: Comprehensive component library for complex UI elements
- **Radix UI**: Headless UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for styling

## State Management
- **Zustand**: Lightweight state management for global app state

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Utility Libraries
- **TanStack Query**: Data fetching and caching (prepared for API integration)
- **Lucide React**: Icon library for consistent iconography
- **Tabler Icons**: Additional icon set for extended icon needs
- **date-fns**: Date manipulation and formatting
- **clsx + tailwind-merge**: Conditional class name handling
- **react-phone-number-input**: International phone number input component

## Development Tools
- **ESLint**: Code linting with TypeScript and React rules
- **PostCSS + Autoprefixer**: CSS processing and vendor prefixing
- **Lovable Tagger**: Development-specific component tagging (development mode only)
