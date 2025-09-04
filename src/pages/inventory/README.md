# Inventory Module Structure

This directory contains the modular Inventory management system with separated components for better maintainability.

## 📁 Folder Structure

```
src/pages/inventory/
├── components/
│   ├── AddEditInventoryDrawer.tsx    # Main inventory creation/editing form
│   ├── ViewTypesDrawer.tsx           # Types listing with drag & drop
│   ├── ViewManufacturersDrawer.tsx   # Manufacturers listing with drag & drop
│   ├── AddTypeDrawer.tsx             # Type creation form
│   ├── AddManufacturerDrawer.tsx     # Manufacturer creation form
│   └── index.ts                      # Component exports
├── types.ts                          # Shared TypeScript interfaces
└── Inventory.tsx                     # Main inventory page (simplified)

```

## 🧩 Components Overview

### **AddEditInventoryDrawer**
- **Purpose**: Create and edit inventory items
- **Features**: 
  - All required fields (Type, Manufacturer, Name, SKU, Cost Price, Retail Price, Serial Number, Notes)
  - Form validation with error handling
  - Runtime creation of types/manufacturers
  - Pre-population for editing

### **ViewTypesDrawer**
- **Purpose**: Display and manage inventory types
- **Features**:
  - Draggable list for reordering
  - Add new type button
  - Plus icons to create inventory with pre-selected type
  - Visual feedback during drag operations

### **ViewManufacturersDrawer**
- **Purpose**: Display and manage manufacturers
- **Features**:
  - Draggable list for reordering
  - Add new manufacturer button
  - Plus icons to create inventory with pre-selected manufacturer
  - Visual feedback during drag operations

### **AddTypeDrawer**
- **Purpose**: Simple form to create new types
- **Features**:
  - Single field form with validation
  - Success notifications
  - Automatic form reset

### **AddManufacturerDrawer**
- **Purpose**: Simple form to create new manufacturers
- **Features**:
  - Single field form with validation
  - Success notifications
  - Automatic form reset

## 🔄 Data Flow

1. **Main Page** (`Inventory.tsx`) manages state and coordinates between components
2. **Drawer Components** handle their specific UI logic and form validation
3. **Callback Functions** pass data back to the main page for state updates
4. **Shared Types** ensure type safety across all components

## 🎯 Benefits of This Structure

- **Separation of Concerns**: Each drawer has its own responsibility
- **Reusability**: Components can be easily reused or modified
- **Maintainability**: Easier to debug and update specific features
- **Type Safety**: Shared interfaces prevent type mismatches
- **Clean Code**: Main page is much simpler and focused on orchestration

## 🚀 Usage

The main `Inventory.tsx` file now imports and uses these modular components:

```tsx
import {
  AddEditInventoryDrawer,
  ViewTypesDrawer,
  ViewManufacturersDrawer,
  AddTypeDrawer,
  AddManufacturerDrawer
} from './inventory/components';
```

Each component receives props for state management and callbacks for data updates, creating a clean and maintainable architecture. 