# Overview

GlowFlowApp is a comprehensive salon management system built with React, TypeScript, and Vite. It aims to streamline salon operations by providing robust features for client management, staff scheduling, service offerings, appointments, inventory tracking, and point-of-sale functionalities. The application features a modern, responsive interface, including authentication, dashboard analytics, and complete CRUD operations for all essential business entities. The project's ambition is to offer a competitive, feature-rich solution for salon owners, rivaling existing market leaders like Mangomint and Fresha.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **UI Frameworks**: Combination of shadcn/ui and Ant Design.
- **Styling**: Tailwind CSS with a custom design system.
- **Routing**: React Router with protected routes.
- **State Management**: Zustand for global state (inventory, calendar, checkout, sales, staff, services, settings), React Context for authentication.
- **Form Handling**: React Hook Form with Zod validation.

## Component Structure
- **Reusable Components**: Base components (e.g., BaseButton, BaseCard, BaseInput, BaseDrawer) ensure consistent styling and functionality.
- **Layout**: `AppLayout` with `TopNavigation` for consistent, responsive navigation.
- **Pages**: Dedicated pages for core features like Dashboard, Clients, Staff, Services, Appointments, Inventory, and POS.
- **Form Components**: Standardized form fields with built-in validation and error handling.

## Authentication System
- **Mechanism**: Context-based using `AuthContext`.
- **Security**: `ProtectedRoute` component for restricted access.
- **Implementation**: Mock authentication using local JSON data with JWT-like tokens for demonstration, persistent sessions via `localStorage`.

## Data Management
- **State Stores**: Zustand stores (`inventoryStore`, `calendarStore`, `checkoutStore`, `salesStore`, `staffStore`, `servicesStore`, `settingsStore`) manage feature-specific state.
- **Mock Data**: JSON files are used to simulate backend APIs for development.
- **Query Management**: TanStack Query is integrated for future API data fetching and caching.
- **Validation**: Zod schemas provide comprehensive, type-safe form validation.

## UI/UX Design System
- **Theme**: Supports dark/light mode with persistence.
- **Design Tokens**: Custom CSS variables define colors, spacing, and typography.
- **Responsiveness**: Mobile-first approach.
- **Drawer Pattern**: Consistent drawer-based UI (width-based) for all create/edit operations.

## Notification System
- **Dual System**: Utilizes both shadcn/ui toast and Ant Design notifications.
- **Centralized Service**: Custom notification service for various types (success, warning, error, info) and pre-built CRUD operation notifications.

## Key Features & Implementations
- **Inventory Module**: Comprehensive inventory management including stock tracking, suppliers, purchase orders, stock adjustments, stocktakes, and low stock alerts. Features new types (`InventoryItem`, `Supplier`, `PurchaseOrder`, `StockAdjustment`, `Stocktake`, `LowStockAlert`, `ReceivingRecord`) and a dedicated `inventoryStore`.
  - **Phase 1 Enhancements (Completed)**:
    - Product image support with URL field and preview display
    - CSV import/export functionality via `ImportExportDrawer`
    - One-click reorder from low stock items via `QuickReorderDrawer`
    - Expiration date alerts system via `ExpirationAlertsDrawer`
  - **Phase 2 In Progress**:
    - Service-linked product consumption tracking with `ServiceProductConsumptionDrawer`
    - New types: `ServiceProductConsumption`, `ProductConsumptionLog`
    - Auto-deduct inventory when services are completed
- **Staff Management**: Advanced features for staff, including commission plans (tiered, percentage, fixed), time clock, timesheets, payroll summaries, staff-specific pricing, performance analytics, and detailed scheduling. Implemented with dedicated `staffStore` and numerous drawer components.
- **Service Management**: Enhanced service definitions with a 5-tab interface:
  - **Services Tab**: Core service management with categories, pricing, and duration settings
  - **Add-Ons Tab**: Create and manage service add-ons that can be added to appointments (e.g., deep conditioning, scalp massage)
  - **Packages Tab**: Bundle services together with flexible pricing (sum, fixed, percentage discount) and track usage
  - **Memberships Tab**: Recurring membership plans with credit-based or service-based options, tracking active members and monthly revenue
  - **Resources Tab**: Manage rooms, equipment, and stations for booking and availability tracking
  - **Product Consumption**: Link products to services for automatic inventory deduction (`ServiceProductConsumptionDrawer`)
  - Enterprise drawer components: `ServiceAddOnDrawer`, `ServicePackageDrawer`, `MembershipDrawer`, `ResourceDrawer`, `DynamicPricingDrawer`, `ServiceProductConsumptionDrawer`, and list drawers for each feature
  - Managed by `servicesStore` Zustand store with comprehensive CRUD operations including product consumption tracking
- **Settings Module**: Extensive business settings including profile, hours, commissions, taxes, payments, booking policies, notifications, permissions, appearance (branding), and integrations. Managed by `settingsStore` and presented in a multi-tab interface.
- **Appointment Calendar**: Redesigned appointment card to mirror Google Calendar's compact style. Critical bug fix for duplicate appointment rendering in Day view, ensuring single rendering and preserving drag-and-drop.

# External Dependencies

## Core Framework Dependencies
- **React**
- **TypeScript**
- **Vite**
- **React Router**

## UI Component Libraries
- **shadcn/ui**
- **Ant Design**
- **Radix UI**
- **Tailwind CSS**

## State Management
- **Zustand**

## Form and Validation
- **React Hook Form**
- **Zod**
- **@hookform/resolvers**

## Utility Libraries
- **TanStack Query**
- **Lucide React**
- **Tabler Icons**
- **date-fns**
- **clsx**
- **tailwind-merge**
- **react-phone-number-input**