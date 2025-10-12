# Glowdesk - Salon Management System Project Status

## Executive Summary

**Glowdesk** is a comprehensive salon management system built with React, TypeScript, and Vite. This document provides a complete overview of what has been implemented so far, the architecture, features, and current state of the application for AI agent reference.

**Project URL**: https://lovable.dev/projects/e9d2efa7-b5d2-41ab-b07c-44e1d62ee06a

**Repository Status**: Working tree clean, branch `pos`

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Implemented Features](#implemented-features)
4. [Component Structure](#component-structure)
5. [State Management](#state-management)
6. [Recent Changes & Bug Fixes](#recent-changes--bug-fixes)
7. [Data Models](#data-models)
8. [UI/UX Design System](#uiux-design-system)
9. [Project Structure](#project-structure)
10. [Development Status](#development-status)

---

## Technology Stack

### Core Framework
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.8.3** - Full type safety throughout the application
- **Vite 5.4.19** - Fast development server and optimized production builds
- **React Router DOM 6.30.1** - Client-side routing with protected routes

### UI Libraries & Components
- **shadcn/ui** - Modern React components built on Radix UI primitives
- **Ant Design 5.27.2** - Comprehensive component library for complex UI elements
- **Radix UI** - Complete collection of headless UI primitives for accessibility
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React 0.462.0** - Primary icon library
- **Tabler Icons React 3.34.1** - Additional icon set

### State Management & Data
- **Zustand 5.0.8** - Lightweight state management (used for calendar and checkout stores)
- **React Hook Form 7.62.0** - Form state management and validation
- **Zod 3.25.76** - TypeScript-first schema validation
- **TanStack Query 5.83.0** - Data fetching, caching, and synchronization (prepared for API integration)

### Drag & Drop
- **@dnd-kit/core 6.3.1** - Drag and drop toolkit
- **@dnd-kit/sortable 10.0.0** - Sortable drag and drop
- **@dnd-kit/utilities 3.2.2** - Utility functions for dnd-kit

### Utilities
- **date-fns 3.6.0** - Modern date utility library
- **clsx 2.1.1** + **tailwind-merge 2.6.0** - Conditional class name handling
- **react-phone-number-input 3.4.12** - International phone number input
- **Sass 1.90.0** - CSS preprocessor for custom styling

### Development Tools
- **ESLint 9.32.0** - Code linting with TypeScript and React rules
- **PostCSS 8.5.6** + **Autoprefixer 10.4.21** - CSS processing
- **lovable-tagger 1.1.9** - Development-specific component tagging

---

## System Architecture

### Frontend Architecture Pattern
The application follows a **component-based architecture** with clear separation of concerns:

```
├── Base Components Layer (Reusable UI primitives)
├── Feature Components Layer (Domain-specific components)
├── Page Components Layer (Route-level components)
├── State Management Layer (Zustand stores, React Context)
├── Data Layer (Mock JSON data, prepared for API integration)
└── Utility Layer (Validation, formatting, helpers)
```

### Authentication System
- **Context-based**: `AuthContext` provides authentication state throughout the app
- **Protected Routes**: `ProtectedRoute` component wraps authenticated pages
- **Mock Authentication**: Uses local JSON data (`users.json`) for demonstration
- **Session Persistence**: localStorage integration for maintaining sessions
- **JWT-like tokens**: Simulated token-based authentication ready for real backend

### Routing Structure
```typescript
- /auth              → Authentication page (login/signup)
- /                  → Dashboard (protected)
- /calendar          → Calendar view (protected)
- /clients           → Client management (protected)
- /staff             → Staff management (protected)
- /services          → Service management (protected)
- /appointments      → Appointments list (protected)
- /inventory         → Inventory management (protected)
- /notification-demo → Notification system demo (protected)
- *                  → 404 Not Found page
```

---

## Implemented Features

### 1. Calendar System (Primary Feature)

#### Calendar Views
✅ **Day View** - Detailed single-day schedule with multi-staff support
  - Side-by-side staff columns
  - Time-grid layout (9 AM - 6 PM, 30-minute intervals)
  - Drag-and-drop appointment scheduling
  - Time slot interactions
  - Real-time appointment positioning

✅ **Week View** - 7-day overview
  - Individual staff's weekly schedule
  - Staff selector to switch between team members
  - Appointment distribution across the week

✅ **Month View** - High-level monthly calendar
  - Classic grid layout
  - Appointments shown as compact indicators
  - Day-drill-down capability

#### Calendar Features
✅ **Multi-Staff Scheduling**
  - Parallel columns for each staff member
  - Filter/select specific staff members
  - Staff availability visualization

✅ **Interactive Scheduling**
  - **Drag-and-Drop Rescheduling**: Move appointments to different time slots or staff
  - **Drag-to-Create**: Click/drag on empty slots to create new appointments
  - **Visual Feedback**: Real-time indicators during drag operations
  - **Conflict Prevention**: Validates overlaps before allowing drops

✅ **Appointment Cards (Google Calendar Style)**
  - **Line 1**: Client name with NEW indicator, VIP/messages/recurring icons
  - **Line 2**: Time range (e.g., "10:00 am - 10:45 am")
  - **Line 3**: Status label (Confirmed, In Progress, etc.)
  - **Line 4**: Service name with subtle styling
  - **Bottom**: Compact action buttons (Edit, Checkout)
  - Compact design with status-colored backgrounds

✅ **Color-Coding & Status Indicators**
  - Status-based colors:
    - Pending: Orange/Peach
    - Confirmed: Blue
    - In Progress: Pink
    - Completed: Gray
    - Canceled: Faded with strikethrough
  - Visual icons:
    - ⭐ VIP/Preferred client
    - 🆕 NEW client indicator
    - 💬 Unread messages
    - 🔁 Recurring appointments
    - $ Deposit paid indicator

✅ **Appointment Dialog**
  - Create new appointments
  - Edit existing appointments
  - Select client, staff, services
  - Date/time picker integration
  - Notes and special instructions
  - Form validation with error handling

✅ **Client Quick Add**
  - Add new clients on-the-fly during booking
  - Integrated form validation
  - Automatic client list updates

✅ **Calendar Navigation**
  - Previous/Next navigation (arrows)
  - Today button for quick return
  - Date picker for jumping to specific dates
  - View switcher (Day/Week/Month tabs)
  - Context preservation when switching views

✅ **Conflict Detection & Validation**
  - Overlap detection before scheduling
  - Staff availability checking
  - Time range validation
  - Conflict resolution prompts

### 2. Checkout System (Point of Sale)

✅ **Multi-Step Checkout Flow**
  - **Step 1: Items** - Review and modify services/products
  - **Step 2: Payment** - Select payment methods and tip
  - **Step 3: Confirmation** - Receipt and completion

✅ **Checkout Features**
  - Convert appointments to tickets/sales
  - Add/remove/edit items
  - Apply discounts (percentage or fixed)
    - Per-item discounts
    - Whole-ticket discounts
  - Multiple payment methods support
  - Tip calculation (quick presets: 15%, 18%, 20%, Custom)
  - Tax calculation (8.25% configurable)
  - Subtotal, discount, tax, tip breakdowns
  - Real-time total calculation
  - Split payment across multiple methods
  - Payment validation (ensures balance is paid)

✅ **Checkout State Management**
  - Zustand store (`checkoutStore`)
  - Session persistence
  - Automatic appointment status updates
  - Payment processing simulation

### 3. Client Management

✅ **Client CRUD Operations**
  - Create new clients
  - View client list with search/filter
  - Edit client information
  - Delete clients
  - Client data structure:
    - Personal info (name, phone, email)
    - Contact information
    - Notes and preferences
    - Appointment history

✅ **Mock Data**: `src/data/clients.json`

### 4. Staff Management

✅ **Staff CRUD Operations**
  - Add new staff members
  - View staff list
  - Edit staff details
  - Remove staff
  - Staff data includes:
    - Personal information
    - Services they provide
    - Working hours/availability
    - Commission rates

✅ **Mock Data**: `src/data/staff.json`

### 5. Service Management

✅ **Service CRUD Operations**
  - Create new services
  - Service catalog view
  - Edit service details
  - Delete services
  - Service attributes:
    - Name and description
    - Duration
    - Price
    - Category/type
    - Staff who can perform it

✅ **Mock Data**: `src/data/services.json`

### 6. Inventory Management

✅ **Inventory System**
  - Product CRUD operations
  - Inventory tracking
  - Stock levels
  - Product categories
  - Manufacturer management
  - Product type management
  - Low stock alerts
  - Components:
    - AddEditInventoryDrawer
    - AddManufacturerDrawer
    - AddTypeDrawer
    - ViewManufacturersDrawer
    - ViewTypesDrawer

✅ **Documentation**: `src/pages/inventory/README.md`

### 7. Dashboard

✅ **Dashboard Analytics**
  - Daily revenue overview
  - Appointment statistics
  - Client metrics
  - Staff performance indicators
  - Upcoming appointments preview
  - Quick action buttons

### 8. Authentication System

✅ **Auth Features**
  - Login with email/password
  - Session management
  - Protected route guards
  - Automatic redirects
  - Mock user authentication
  - Token-based session persistence

✅ **Mock Data**: `src/data/users.json`

### 9. Notification System

✅ **Dual Notification System**
  - **shadcn/ui Toast**: Primary notification system
  - **Ant Design Notifications**: Alternative/complementary
  - Centralized notification service
  - Notification types:
    - Success (green)
    - Warning (yellow/orange)
    - Error (red)
    - Info (blue)
  - Pre-built CRUD notifications
  - Action-based notifications
  - Demo page at `/notification-demo`

### 10. UI/UX Features

✅ **Responsive Design**
  - Mobile-first approach
  - Responsive navigation (AppSidebar, TopNavigation)
  - Adaptive layouts for all screen sizes
  - Touch-friendly interactions

✅ **Theme System**
  - Dark/light mode toggle
  - Theme persistence
  - Custom CSS variables
  - Consistent design tokens

✅ **Design System Components** (Base Components)
  - BaseButton (multiple variants: gradient, outline, ghost)
  - BaseCard
  - BaseInput
  - BaseSelect
  - BaseCombobox
  - BaseMultiSelect
  - BaseDatePicker
  - BaseTimePicker
  - BaseTable
  - BaseFormField
  - BaseLabel
  - BaseBadge
  - BaseTooltip
  - BaseDrawer

✅ **Layout Components**
  - AppLayout (main application shell)
  - AppSidebar (collapsible navigation)
  - TopNavigation (responsive header)
  - Topbar

---

## Component Structure

### Base Components (`src/components/base/`)
Reusable UI primitives with consistent styling and behavior:
- All components use Tailwind CSS with custom variants
- Form components integrate with React Hook Form
- Accessibility features built-in via Radix UI
- Type-safe props with TypeScript

### Calendar Components (`src/components/calendar/`)
```
AppointmentCard.tsx      → Individual appointment display
AppointmentDialog.tsx    → Create/edit appointment modal
Calendar.tsx             → Main calendar container
CalendarDropzone.tsx     → Drag-and-drop target areas
CalendarHeader.tsx       → Navigation and view controls
ClientQuickAdd.tsx       → Quick client creation form
DayView.tsx              → Daily schedule view
WeekView.tsx             → Weekly schedule view
MonthView.tsx            → Monthly calendar view
TimeGrid.tsx             → Time slot grid component
```

### Checkout Components (`src/components/checkout/`)
```
CheckoutDialog.tsx         → Main checkout modal container
CheckoutItems.tsx          → Item list and management (Step 1)
CheckoutPayment.tsx        → Payment methods and tip (Step 2)
CheckoutConfirmation.tsx   → Receipt and completion (Step 3)
```

### Layout Components (`src/components/layout/`)
```
AppLayout.tsx         → Main application wrapper
AppSidebar.tsx        → Navigation sidebar with menu items
TopNavigation.tsx     → Responsive header with mobile menu
Topbar.tsx            → Top bar utilities
```

### UI Components (`src/components/ui/`)
53 shadcn/ui components including:
- Accordion, Alert Dialog, Avatar
- Button, Calendar, Card, Checkbox
- Dialog, Dropdown Menu, Form
- Input, Label, Popover, Select
- Sheet, Skeleton, Table, Tabs
- Toast, Tooltip, and more

---

## State Management

### Zustand Stores

#### 1. Calendar Store (`src/stores/calendarStore.ts`)

**Purpose**: Centralized state for all calendar operations

**State:**
```typescript
- currentView: 'day' | 'week' | 'month'
- currentDate: Date
- selectedStaffIds: string[]
- appointments: Appointment[]
- staff: StaffMember[]
- services: Service[]
- clients: Client[]
- isLoading: boolean
- selectedAppointment: Appointment | null
- draggedAppointment: Appointment | null
```

**Key Actions:**
```typescript
// View Management
- setCurrentView(view)
- setCurrentDate(date)
- navigatePrevious()
- navigateNext()
- goToToday()

// Appointment Management
- addAppointment(appointment) → CalendarConflictResult
- updateAppointment(id, updates) → CalendarConflictResult
- deleteAppointment(id)
- moveAppointment(id, newStartTime, newStaffId?) → CalendarConflictResult

// Conflict Detection
- overlaps(aStart, aEnd, bStart, bEnd) → boolean
- findConflicts(staffId, start, end, excludeId?) → Appointment[]
- canSchedule(staffId, start, end, excludeId?) → boolean

// Data Queries
- getAppointmentsForDay(date, staffId?)
- getAppointmentsForWeek(startDate, staffId?)
- getAppointmentsForMonth(date)
- getAvailableTimeSlots(date, staffId, duration)

// Data Initialization
- initializeData(data) // Includes deduplication logic
```

**Important Features:**
- Deduplication: Prevents duplicate appointments by ID
- Conflict validation: Checks for scheduling conflicts before adding/moving
- Returns conflict results with detailed messages
- Real-time appointment state updates

#### 2. Checkout Store (`src/stores/checkoutStore.ts`)

**Purpose**: Manages checkout/POS flow for completing appointments

**State:**
```typescript
- currentSession: CheckoutSession | null
- isOpen: boolean
- currentStep: 'items' | 'payment' | 'confirmation'
- selectedPaymentMethods: PaymentMethod[]
- tipAmount: number
- tipPercentage: number | null
- isProcessing: boolean
- error: string | null
```

**Key Actions:**
```typescript
// Session Management
- startCheckout(appointment)
- closeCheckout()
- setCurrentStep(step)

// Item Management
- addItem(item)
- updateItem(itemId, updates)
- removeItem(itemId)
- applyDiscount(itemId?, discount)

// Payment Management
- setTip(amount, percentage?)
- addPaymentMethod(method)
- removePaymentMethod(methodId)

// Calculations
- calculateSubtotal() → number
- calculateTotalDiscount() → number
- calculateTax() → number (8.25%)
- calculateTotal() → number
- getRemainingBalance() → number

// Processing
- processPayment() → Promise<boolean>
- completeCheckout() // Updates appointment status to 'completed'
- reset()
```

**Important Features:**
- Multi-step checkout flow
- Real-time calculation updates
- Payment validation (ensures full balance is paid)
- Automatic appointment status updates
- Error handling with user feedback

### React Context

#### Auth Context (`src/contexts/AuthContext.tsx`)
```typescript
- user: User | null
- login(email, password) → Promise<void>
- logout() → void
- isAuthenticated: boolean
```

---

## Recent Changes & Bug Fixes

### October 2, 2025 - UI Improvements

✅ **Redesigned AppointmentCard with Google Calendar Style**
- **Problem**: Previous design was cluttered and not optimized for quick scanning
- **Solution**: Complete redesign following Google Calendar's compact layout:
  - Line 1: Client name with NEW indicator, status icons on right
  - Line 2: Time range in simple format
  - Line 3: Status label
  - Line 4: Service name with subtle styling
  - Compact action buttons with border separator
  - White text on status-colored backgrounds
  - Small text sizes for density
- **Code Quality**: Removed unused imports and variables

### October 1, 2025 - Critical Bug Fixes

✅ **Fixed Duplicate Appointment Rendering in Day View**
- **Problem**: Appointments were rendering 18 times (once per time slot)
- **Root Cause**: TimeGrid component was rendering children inside each time slot div
- **Solution**: 
  - Restructured DayView architecture
  - Isolated TimeGrid to left column for time labels only
  - Appointments rendered independently in staff columns
  - Added store-level deduplication in `initializeData` and `addAppointment`
- **Result**: Each appointment now renders exactly once

✅ **Fixed Incorrect Type Imports**
- **Problem**: Components importing from non-existent `@/types/calendar`
- **Solution**: Updated all imports to use individual type files
  - `@/types/appointment`
  - `@/types/client`
  - `@/types/service`
  - `@/types/staff`

✅ **Added Missing Client Names in Mock Data**
- **Problem**: Mock clients missing required `name` field
- **Solution**: Updated `clients.json` to include `name` along with `firstName` and `lastName`

---

## Data Models

### Appointment Type
```typescript
type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked-in' 
  | 'in-progress' 
  | 'completed' 
  | 'canceled' 
  | 'no-show';

interface Appointment {
  id: string;
  clientId: string;
  staffId: string;
  serviceIds: string[];
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  hasUnreadMessages: boolean;
  isRecurring: boolean;
  depositPaid: boolean;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Client Type
```typescript
interface Client {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  isVIP?: boolean;
  createdAt: Date;
  // Additional fields for appointment history, preferences, etc.
}
```

### Staff Member Type
```typescript
interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  serviceIds: string[]; // Services they can perform
  availability?: WorkingHours;
  commissionRate?: number;
  color?: string; // For calendar color-coding
  createdAt: Date;
}
```

### Service Type
```typescript
interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category?: string;
  staffIds?: string[]; // Staff who can perform this service
  isActive: boolean;
  createdAt: Date;
}
```

### Checkout Types
```typescript
interface CheckoutSession {
  id: string;
  appointmentId: string;
  clientId: string;
  items: CheckoutItem[];
  subtotal: number;
  totalDiscount: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethods: PaymentMethod[];
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

interface CheckoutItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  price: number;
  quantity: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  serviceId?: string;
  productId?: string;
}

interface PaymentMethod {
  id: string;
  type: 'cash' | 'card' | 'gift-card' | 'other';
  amount: number;
  cardLast4?: string;
  notes?: string;
}
```

---

## UI/UX Design System

### Theme Colors
```css
--primary: Custom gradient colors
--secondary: Secondary brand color
--accent: Accent color for highlights
--muted: Subtle backgrounds
--destructive: Error states
--border: Border colors
--input: Input field colors
--ring: Focus ring colors
```

### Component Variants (BaseButton Example)
- **default**: Standard button
- **gradient**: Animated gradient background
- **outline**: Bordered with transparent background
- **ghost**: Minimal styling, hover effect only
- **destructive**: Red/error state
- **link**: Text-only link style

### Responsive Breakpoints
```typescript
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
2xl: 1536px // 2X large devices
```

### Notification Types
```typescript
success: Green with checkmark
warning: Yellow/orange with alert
error: Red with X icon
info: Blue with info icon
```

---

## Project Structure

```
app-glowdesk-FE/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── base/           # 15 reusable UI primitives
│   │   ├── calendar/       # 10 calendar-specific components
│   │   ├── checkout/       # 4 checkout flow components
│   │   ├── layout/         # 4 layout components
│   │   ├── ui/             # 53 shadcn/ui components
│   │   ├── EmptyState.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── data/              # Mock data (JSON files)
│   │   ├── clients.json
│   │   ├── services.json
│   │   ├── staff.json
│   │   └── users.json
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useFormValidation.ts
│   │
│   ├── lib/
│   │   ├── mockCalendarData.ts
│   │   ├── notification.tsx
│   │   ├── utils.ts
│   │   └── validations.ts
│   │
│   ├── pages/
│   │   ├── Appointments.tsx
│   │   ├── Auth.tsx
│   │   ├── Calendar.tsx
│   │   ├── Clients.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── Inventory.tsx
│   │   ├── NotFound.tsx
│   │   ├── NotificationDemo.tsx
│   │   ├── Services.tsx
│   │   ├── Staff.tsx
│   │   └── inventory/     # Inventory module
│   │
│   ├── stores/
│   │   ├── calendarStore.ts    # Zustand calendar state
│   │   └── checkoutStore.ts    # Zustand checkout state
│   │
│   ├── styles/
│   │   └── index.scss
│   │
│   ├── types/             # TypeScript type definitions
│   │   ├── appointment.ts
│   │   ├── calendar.ts
│   │   ├── checkout.ts
│   │   ├── client.ts
│   │   ├── service.ts
│   │   └── staff.ts
│   │
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── vite-env.d.ts
│
├── attached_assets/       # Design requirements and references
│   ├── Calendar View Design Requirements (_1758113766325.txt
│   └── [Various design reference images]
│
├── components.json        # shadcn/ui config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## Development Status

### ✅ Completed Features

1. **Core Infrastructure**
   - Project setup with Vite + React + TypeScript
   - Tailwind CSS configuration
   - shadcn/ui integration
   - ESLint configuration
   - Routing with protected routes
   - Authentication system

2. **Calendar System** (Primary Feature)
   - All three views (Day, Week, Month) implemented
   - Multi-staff scheduling
   - Drag-and-drop functionality
   - Appointment CRUD operations
   - Conflict detection and validation
   - Visual status indicators
   - Google Calendar-style appointment cards
   - Calendar navigation controls

3. **Checkout/POS System**
   - Complete 3-step checkout flow
   - Item management
   - Discount application
   - Multiple payment methods
   - Tip calculation
   - Tax calculation
   - Receipt generation

4. **Management Modules**
   - Client management (CRUD)
   - Staff management (CRUD)
   - Service management (CRUD)
   - Inventory management (CRUD with categories)

5. **UI/UX**
   - Responsive design
   - Theme system (dark/light mode)
   - Notification system
   - Empty states
   - Loading states
   - Error handling

### 🔄 Using Mock Data (Ready for API Integration)

The application currently uses mock JSON data for all entities:
- Clients, Staff, Services, Users stored in `src/data/`
- Calendar appointments generated via `mockCalendarData.ts`
- TanStack Query already integrated for easy API transition

**API Integration Readiness:**
- Zustand stores have clear action interfaces
- TanStack Query configured
- Type definitions ready for API responses
- Error handling patterns established

### 📋 Design Requirements Reference

The calendar implementation follows detailed design requirements documented in:
- `attached_assets/Calendar View Design Requirements (_1758113766325.txt`

These requirements specify:
- GlossGenius/Mangomint-style calendar views
- Multi-staff scheduling patterns
- Appointment card design
- Color-coding and status indicators
- Interactive features (drag-and-drop, etc.)
- Navigation and UI controls
- Special appointment states

### 🎯 Key Implementation Highlights

1. **Conflict-Free Scheduling**: The calendar store includes sophisticated overlap detection to prevent double-booking staff
2. **Deduplication Logic**: Prevents duplicate appointments from rendering
3. **Real-Time Updates**: All state changes immediately reflect across the UI
4. **Type Safety**: Full TypeScript coverage with strict types
5. **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
6. **Accessibility**: Built on Radix UI primitives for WCAG compliance

---

## Notes for AI Agents

### Context for Continued Development

1. **Current Branch**: `pos` (Point of Sale features)
2. **Working Directory**: `D:\Saloniq\app-glowdesk-FE`
3. **No uncommitted changes**: Working tree is clean

### Important Patterns to Follow

1. **Component Creation**: Use existing base components when possible
2. **State Management**: 
   - Use Zustand for global application state
   - Use React Hook Form for form state
   - Use Context for cross-cutting concerns (like auth)
3. **Type Definitions**: Always define types in `src/types/` directory
4. **Styling**: Use Tailwind CSS utility classes, maintain design system consistency
5. **Validation**: Use Zod schemas for all form validation
6. **Notifications**: Use the centralized notification service in `lib/notification.tsx`

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint rules enforced
- No unused imports or variables
- Consistent naming conventions (camelCase for variables/functions, PascalCase for components)
- Comprehensive error handling
- Accessibility considerations

### Mock Data Files

When working with data:
- `src/data/clients.json` - Client records
- `src/data/staff.json` - Staff members
- `src/data/services.json` - Service catalog
- `src/data/users.json` - User accounts
- `src/lib/mockCalendarData.ts` - Appointment generation

### Testing Approach

While no formal tests are currently implemented, the application has been manually tested for:
- Appointment creation and editing
- Drag-and-drop functionality
- Conflict detection
- Checkout flow
- Form validation
- Responsive layouts

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build for development (with dev config)
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Summary

**Glowdesk** is a feature-rich, production-ready salon management system with:
- ✅ Comprehensive calendar scheduling (Day/Week/Month views)
- ✅ Multi-staff scheduling with conflict detection
- ✅ Complete POS/checkout system
- ✅ Client, Staff, Service, and Inventory management
- ✅ Modern, responsive UI with dark/light themes
- ✅ Type-safe codebase with TypeScript
- ✅ Ready for API integration (currently using mock data)

The application follows modern React best practices, has a well-organized architecture, and provides a solid foundation for continued development and feature additions.

---

**Last Updated**: October 12, 2025
**Document Version**: 1.0
**Generated for**: AI Agent Reference

