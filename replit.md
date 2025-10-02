# Overview

This is a salon management system called "Glowdesk" built with React, TypeScript, and Vite. The application provides a comprehensive solution for managing salon operations including client management, staff scheduling, service offerings, appointments, and inventory tracking. It features a modern, responsive interface with authentication, dashboard analytics, and complete CRUD operations for all business entities.

# Recent Changes

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
- **State Management**: React Context for authentication state, React Hook Form for form state
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation

## Component Structure
- **Base Components**: Reusable UI primitives (BaseButton, BaseCard, BaseInput, etc.) with consistent styling
- **Layout Components**: AppLayout with TopNavigation for responsive navigation across desktop and mobile
- **Page Components**: Feature-specific pages (Dashboard, Clients, Staff, Services, Appointments, Inventory)
- **Form Components**: Standardized form fields with validation and error handling

## Authentication System
- **Context-based**: AuthContext provides authentication state throughout the app
- **Protected Routes**: ProtectedRoute component wraps authenticated pages
- **Mock Authentication**: Uses local JSON data for demonstration with JWT-like tokens
- **Persistent Sessions**: localStorage integration for session persistence

## Data Management
- **Mock Data**: JSON files simulate backend APIs for development (clients.json, staff.json, services.json, users.json)
- **Query Management**: TanStack Query for data fetching and caching (prepared for future API integration)
- **Form Validation**: Zod schemas for comprehensive form validation with custom error messages

## UI/UX Design System
- **Theme Support**: Dark/light mode toggle with theme persistence
- **Design Tokens**: Custom CSS variables for colors, spacing, and typography
- **Component Variants**: Consistent styling variants across all components (gradient, outline, ghost, etc.)
- **Responsive Design**: Mobile-first approach with responsive navigation and layouts

## Notification System
- **Multiple Providers**: Dual notification system using both shadcn/ui toast and Ant Design notifications
- **Custom Service**: Centralized notification service with different types (success, warning, error, info)
- **Action Notifications**: Pre-built notifications for CRUD operations (created, updated, deleted)

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