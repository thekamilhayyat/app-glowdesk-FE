import React, { useState, useMemo } from 'react';
import { BaseButton } from '../components/base/BaseButton';
import { BaseInput } from '../components/base/BaseInput';
import { BaseBadge } from '../components/base/BaseBadge';
import { BaseTooltip } from '../components/base/BaseTooltip';
import { BaseTable } from '../components/base/BaseTable';
import { EmptyState } from '../components/EmptyState';
import { AppLayout } from '../components/layout/AppLayout';
import { Container } from '../components/ui/Container';
import { toast } from 'sonner';
import {
  AddEditInventoryDrawer,
  ViewTypesDrawer,
  ViewManufacturersDrawer,
  AddTypeDrawer,
  AddManufacturerDrawer
} from './inventory/components';
import { InventoryType, Manufacturer, InventoryItem } from './inventory/types';

const Inventory: React.FC = () => {
  // State for drawers
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isViewTypesOpen, setIsViewTypesOpen] = useState(false);
  const [isViewManufacturersOpen, setIsViewManufacturersOpen] = useState(false);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isAddManufacturerOpen, setIsAddManufacturerOpen] = useState(false);
  const [isEditingInventory, setIsEditingInventory] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);

  // State for data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      item_id: "INV-0001",
      name: "Professional Hair Dryer",
      type: "equipment",
      manufacturer: "Dyson",
      manufacturer_id: "1",
      sku: "DRY-SUP-001",
      cost_price: 299.0,
      retail_price: 399.0,
      serial_number: "DY-12345-ABCD",
      notes: "High-quality professional hair dryer",
      status: "active",
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-15T10:00:00Z"
    }
  ]);
  const [types, setTypes] = useState<InventoryType[]>([
    { type_id: 'type_1', name: 'Equipment', order: 1 },
    { type_id: 'type_2', name: 'Supplies', order: 2 },
    { type_id: 'type_3', name: 'Tools', order: 3 }
  ]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([
    { manufacturer_id: 'man_1', name: 'Dyson', order: 1 },
    { manufacturer_id: 'man_2', name: 'Philips', order: 2 },
    { manufacturer_id: 'man_3', name: 'Wahl', order: 3 }
  ]);

  // State for search and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    field: keyof InventoryItem;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filtered and sorted inventory items
  const filteredInventoryItems = useMemo(() => {
    let filtered = inventoryItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [inventoryItems, searchTerm, sortConfig]);

  // Handle sorting
  const handleSort = (field: keyof InventoryItem) => {
    setSortConfig(current => {
      if (current?.field === field) {
        return {
          field,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { field, direction: 'asc' };
    });
  };

  // Handle inventory operations
  const handleInventoryCreated = (inventory: InventoryItem) => {
    setInventoryItems(prev => [...prev, inventory]);
  };

  const handleInventoryUpdated = (inventory: InventoryItem) => {
    setInventoryItems(prev => prev.map(item => 
      item.item_id === inventory.item_id ? inventory : item
    ));
  };

  const handleEditInventory = (item: InventoryItem) => {
    setIsEditingInventory(true);
    setEditingInventoryId(item.item_id);
    setIsAddInventoryOpen(true);
  };

  const handleDeleteInventory = (itemId: string) => {
    setInventoryItems(prev => prev.filter(item => item.item_id !== itemId));
    toast.success('Inventory item deleted successfully');
  };

  // Handle type operations
  const handleTypeCreated = (name: string) => {
    const newType: InventoryType = {
      type_id: `type_${Date.now()}`,
      name,
      order: types.length + 1
    };
    setTypes(prev => [newType, ...prev]);
  };

  const handleTypeReorder = (updatedTypes: InventoryType[]) => {
    setTypes(updatedTypes);
  };

  const handleCreateInventoryWithType = (type: InventoryType) => {
    setIsViewTypesOpen(false);
    setIsAddInventoryOpen(true);
    // The drawer will handle pre-selecting the type
  };

  // Handle manufacturer operations
  const handleManufacturerCreated = (name: string) => {
    const newManufacturer: Manufacturer = {
      manufacturer_id: `man_${Date.now()}`,
      name,
      order: manufacturers.length + 1
    };
    setManufacturers(prev => [newManufacturer, ...prev]);
  };

  const handleManufacturerReorder = (updatedManufacturers: Manufacturer[]) => {
    setManufacturers(updatedManufacturers);
  };

  const handleCreateInventoryWithManufacturer = (manufacturer: Manufacturer) => {
    setIsViewManufacturersOpen(false);
    setIsAddInventoryOpen(true);
    // The drawer will handle pre-selecting the manufacturer
  };

  // Table columns
  const tableColumns = [
    {
      key: 'type' as keyof InventoryItem,
      header: 'Type',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.type
    },
    {
      key: 'manufacturer' as keyof InventoryItem,
      header: 'Manufacturer',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.manufacturer
    },
    {
      key: 'name' as keyof InventoryItem,
      header: 'Name',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.name
    },
    {
      key: 'sku' as keyof InventoryItem,
      header: 'SKU',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.sku
    },
    {
      key: 'cost_price' as keyof InventoryItem,
      header: 'Cost Price',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.cost_price ? `$${item.cost_price.toFixed(2)}` : '-'
    },
    {
      key: 'retail_price' as keyof InventoryItem,
      header: 'Retail Price',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.retail_price ? `$${item.retail_price.toFixed(2)}` : '-'
    },
    {
      key: 'serial_number' as keyof InventoryItem,
      header: 'Serial Number',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.serial_number
    },
    {
      key: 'status' as keyof InventoryItem,
      header: 'Status',
      sortable: true,
      render: (value: any, item: InventoryItem) => (
        <BaseBadge variant={item.status === 'active' ? 'default' : 'secondary'}>
          {item.status}
        </BaseBadge>
      )
    },
    {
      key: 'actions' as keyof InventoryItem,
      header: 'Actions',
      sortable: false,
      render: (value: any, item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <BaseTooltip content="Edit inventory">
            <BaseButton
              variant="ghost"
              size="sm"
              onClick={() => handleEditInventory(item)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </BaseButton>
          </BaseTooltip>
          <BaseTooltip content="Delete inventory">
            <BaseButton
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteInventory(item.item_id)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </BaseButton>
          </BaseTooltip>
        </div>
      )
    }
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pagination = {
    currentPage,
    itemsPerPage,
    totalItems: filteredInventoryItems.length,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: setItemsPerPage
  };

  // Get the editing item
  const editingItem = editingInventoryId 
    ? inventoryItems.find(item => item.item_id === editingInventoryId) || null
    : null;

  // Empty state
  if (inventoryItems.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Inventory</h1>
          </div>
          <EmptyState
            title="No inventory items yet"
            description="Get started by adding your first inventory item."
            actionLabel="Add New Inventory"
            onAction={() => setIsAddInventoryOpen(true)}
          />
        </div>

        {/* Drawers - Need to be rendered even in empty state */}
        <AddEditInventoryDrawer
          open={isAddInventoryOpen}
          onOpenChange={setIsAddInventoryOpen}
          isEditing={isEditingInventory}
          editingItem={editingItem}
          types={types}
          manufacturers={manufacturers}
          onInventoryCreated={handleInventoryCreated}
          onInventoryUpdated={handleInventoryUpdated}
          onAddType={() => setIsAddTypeOpen(true)}
          onAddManufacturer={() => setIsAddManufacturerOpen(true)}
        />

        <AddTypeDrawer
          open={isAddTypeOpen}
          onOpenChange={setIsAddTypeOpen}
          onTypeCreated={handleTypeCreated}
        />

        <AddManufacturerDrawer
          open={isAddManufacturerOpen}
          onOpenChange={setIsAddManufacturerOpen}
          onManufacturerCreated={handleManufacturerCreated}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container className="py-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Manage your inventory items and types</p>
          </div>
          
          <div className="flex gap-3">
            <BaseButton 
              variant="outline" 
              onClick={() => setIsViewTypesOpen(true)}
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Types
            </BaseButton>
            
            <BaseButton 
              variant="outline" 
              onClick={() => setIsViewManufacturersOpen(true)}
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Manufacturers
            </BaseButton>
            
            <BaseButton 
              variant="gradient" 
              onClick={() => setIsAddInventoryOpen(true)}
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Inventory
            </BaseButton>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-card rounded-md border border-border shadow-sm p-4 mb-6">
          <BaseInput
            placeholder="Search inventory or types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table Section */}
        <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
          <BaseTable
            data={filteredInventoryItems}
            columns={tableColumns}
            sortConfig={sortConfig}
            onSort={handleSort}
            pagination={pagination}
            emptyMessage="No inventory items found"
          />
        </div>

        {/* Drawers */}
        <AddEditInventoryDrawer
          open={isAddInventoryOpen}
          onOpenChange={setIsAddInventoryOpen}
          isEditing={isEditingInventory}
          editingItem={editingItem}
          types={types}
          manufacturers={manufacturers}
          onInventoryCreated={handleInventoryCreated}
          onInventoryUpdated={handleInventoryUpdated}
          onAddType={() => setIsAddTypeOpen(true)}
          onAddManufacturer={() => setIsAddManufacturerOpen(true)}
        />

        <ViewTypesDrawer
          open={isViewTypesOpen}
          onOpenChange={setIsViewTypesOpen}
          types={types}
          onAddType={() => setIsAddTypeOpen(true)}
          onTypeReorder={handleTypeReorder}
          onCreateInventoryWithType={handleCreateInventoryWithType}
        />

        <ViewManufacturersDrawer
          open={isViewManufacturersOpen}
          onOpenChange={setIsViewManufacturersOpen}
          manufacturers={manufacturers}
          onAddManufacturer={() => setIsAddManufacturerOpen(true)}
          onManufacturerReorder={handleManufacturerReorder}
          onCreateInventoryWithManufacturer={handleCreateInventoryWithManufacturer}
        />

        <AddTypeDrawer
          open={isAddTypeOpen}
          onOpenChange={setIsAddTypeOpen}
          onTypeCreated={handleTypeCreated}
        />

        <AddManufacturerDrawer
          open={isAddManufacturerOpen}
          onOpenChange={setIsAddManufacturerOpen}
          onManufacturerCreated={handleManufacturerCreated}
        />
      </Container>
    </AppLayout>
  );
};

export default Inventory; 