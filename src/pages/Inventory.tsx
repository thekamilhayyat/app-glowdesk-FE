import React, { useState, useMemo } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { BaseTooltip } from '@/components/base/BaseTooltip';
import { BaseTable } from '@/components/base/BaseTable';
import { EmptyState } from '@/components/EmptyState';
import { AppLayout } from '@/components/layout/AppLayout';
import { Container } from '@/components/ui/Container';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem, Stocktake, PurchaseOrder } from '@/types/inventory';
import {
  AddEditInventoryDrawer,
  ViewTypesDrawer,
  ViewManufacturersDrawer,
  AddTypeDrawer,
  AddManufacturerDrawer,
  StockAdjustmentDrawer,
  SupplierDrawer,
  SuppliersListDrawer,
  PurchaseOrderDrawer,
  PurchaseOrdersListDrawer,
  ReceiveOrderDrawer,
  StocktakeDrawer,
  StocktakeListDrawer,
  LowStockAlertsDrawer,
  StockMovementDrawer,
  InventoryReportsDrawer,
  ImportExportDrawer,
  QuickReorderDrawer,
  ExpirationAlertsDrawer
} from './inventory/components';
import {
  Plus,
  Package,
  AlertTriangle,
  Truck,
  ClipboardList,
  BarChart3,
  History,
  Building2,
  Tags,
  Factory,
  Upload,
  ShoppingCart,
  Calendar
} from 'lucide-react';

const Inventory: React.FC = () => {
  const { 
    items, 
    types,
    manufacturers,
    suppliers,
    purchaseOrders,
    stocktakes,
    deleteItem,
    addType,
    addManufacturer,
    reorderTypes,
    reorderManufacturers,
    getActiveAlerts,
    getLowStockItems,
    getOutOfStockItems,
    getInventoryStats
  } = useInventoryStore();

  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isViewTypesOpen, setIsViewTypesOpen] = useState(false);
  const [isViewManufacturersOpen, setIsViewManufacturersOpen] = useState(false);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isAddManufacturerOpen, setIsAddManufacturerOpen] = useState(false);
  const [isEditingInventory, setIsEditingInventory] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [stockAdjustmentItem, setStockAdjustmentItem] = useState<InventoryItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [isSuppliersListOpen, setIsSuppliersListOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false);
  const [isPurchaseOrdersListOpen, setIsPurchaseOrdersListOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isReceiveOrderOpen, setIsReceiveOrderOpen] = useState(false);
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

  const [isStocktakeOpen, setIsStocktakeOpen] = useState(false);
  const [isStocktakeListOpen, setIsStocktakeListOpen] = useState(false);
  const [stocktakeMode, setStocktakeMode] = useState<'create' | 'count' | 'view'>('create');
  const [selectedStocktake, setSelectedStocktake] = useState<Stocktake | null>(null);

  const [isLowStockAlertsOpen, setIsLowStockAlertsOpen] = useState(false);
  const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isQuickReorderOpen, setIsQuickReorderOpen] = useState(false);
  const [isExpirationAlertsOpen, setIsExpirationAlertsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const stats = getInventoryStats();
  const activeAlerts = getActiveAlerts();

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a as any)[sortConfig.field];
        const bValue = (b as any)[sortConfig.field];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [items, searchTerm, sortConfig]);

  const handleSort = (field: string) => {
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

  const handleEditInventory = (item: InventoryItem) => {
    setIsEditingInventory(true);
    setEditingItem(item);
    setIsAddInventoryOpen(true);
  };

  const handleDeleteInventory = (itemId: string) => {
    deleteItem(itemId);
    toast.success('Inventory item deleted successfully');
  };

  const handleAdjustStock = (item: InventoryItem, type: 'add' | 'remove') => {
    setStockAdjustmentItem(item);
    setAdjustmentType(type);
    setIsStockAdjustmentOpen(true);
  };

  const handleTypeCreated = (name: string) => {
    addType({ type_id: `type_${Date.now()}`, name, order: types.length + 1 });
  };

  const handleManufacturerCreated = (name: string) => {
    addManufacturer({ manufacturer_id: `man_${Date.now()}`, name, order: manufacturers.length + 1 });
  };

  const tableColumns: { key: keyof InventoryItem | 'actions'; header: string; sortable: boolean; render: (value: any, item: InventoryItem) => React.ReactNode }[] = [
    {
      key: 'name' as keyof InventoryItem,
      header: 'Product',
      sortable: true,
      render: (value: any, item: InventoryItem) => (
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.sku}</div>
          </div>
        </div>
      )
    },
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
      key: 'currentStock' as keyof InventoryItem,
      header: 'Stock',
      sortable: true,
      render: (value: any, item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <span className={
            item.currentStock <= 0 ? 'text-red-600 font-medium' :
            item.currentStock <= item.lowStockThreshold ? 'text-yellow-600 font-medium' :
            'text-foreground'
          }>
            {item.currentStock}
          </span>
          {item.currentStock <= 0 && (
            <BaseBadge variant="destructive" className="text-xs">Out</BaseBadge>
          )}
          {item.currentStock > 0 && item.currentStock <= item.lowStockThreshold && (
            <BaseBadge variant="secondary" className="text-xs">Low</BaseBadge>
          )}
        </div>
      )
    },
    {
      key: 'costPrice' as keyof InventoryItem,
      header: 'Cost',
      sortable: true,
      render: (value: any, item: InventoryItem) => `$${item.costPrice.toFixed(2)}`
    },
    {
      key: 'retailPrice' as keyof InventoryItem,
      header: 'Retail',
      sortable: true,
      render: (value: any, item: InventoryItem) => item.retailPrice ? `$${item.retailPrice.toFixed(2)}` : '-'
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
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value: any, item: InventoryItem) => (
        <div className="flex items-center gap-1">
          <BaseTooltip content="Add stock">
            <BaseButton
              variant="ghost"
              size="sm"
              onClick={() => handleAdjustStock(item, 'add')}
            >
              <Plus className="h-4 w-4" />
            </BaseButton>
          </BaseTooltip>
          <BaseTooltip content="Edit">
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
          <BaseTooltip content="Delete">
            <BaseButton
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteInventory(item.id)}
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pagination = {
    currentPage,
    itemsPerPage,
    totalItems: filteredItems.length,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: setItemsPerPage
  };

  if (items.length === 0) {
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
            onAction={() => {
              setIsEditingInventory(false);
              setEditingItem(null);
              setIsAddInventoryOpen(true);
            }}
          />
        </div>

        <AddEditInventoryDrawer
          open={isAddInventoryOpen}
          onOpenChange={(open) => {
            setIsAddInventoryOpen(open);
            if (!open) {
              setIsEditingInventory(false);
              setEditingItem(null);
            }
          }}
          isEditing={isEditingInventory}
          editingItem={editingItem}
          onAddType={() => setIsAddTypeOpen(true)}
          onAddManufacturer={() => setIsAddManufacturerOpen(true)}
          onAddSupplier={() => setIsSupplierDrawerOpen(true)}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Manage your products, stock, and suppliers</p>
          </div>
          
          <div className="flex gap-2">
            <BaseButton 
              variant="outline" 
              onClick={() => setIsImportExportOpen(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import/Export
            </BaseButton>
            <BaseButton 
              variant="gradient" 
              onClick={() => {
                setIsEditingInventory(false);
                setEditingItem(null);
                setIsAddInventoryOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </BaseButton>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toFixed(0)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsLowStockAlertsOpen(true)}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Stock Alerts
            {activeAlerts.length > 0 && (
              <BaseBadge variant="destructive" className="ml-1">{activeAlerts.length}</BaseBadge>
            )}
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsExpirationAlertsOpen(true)}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Expiration
          </BaseButton>
          <BaseButton
            variant="default"
            size="sm"
            onClick={() => setIsQuickReorderOpen(true)}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Quick Reorder
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsSuppliersListOpen(true)}
            className="gap-2"
          >
            <Building2 className="h-4 w-4" />
            Suppliers
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsPurchaseOrdersListOpen(true)}
            className="gap-2"
          >
            <Truck className="h-4 w-4" />
            Purchase Orders
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsStocktakeListOpen(true)}
            className="gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            Stocktakes
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsStockMovementOpen(true)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            History
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsReportsOpen(true)}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Reports
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsViewTypesOpen(true)}
            className="gap-2"
          >
            <Tags className="h-4 w-4" />
            Types
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setIsViewManufacturersOpen(true)}
            className="gap-2"
          >
            <Factory className="h-4 w-4" />
            Manufacturers
          </BaseButton>
        </div>

        <div className="bg-card rounded-md border border-border shadow-sm p-4 mb-6">
          <BaseInput
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
          <BaseTable
            data={filteredItems}
            columns={tableColumns as any}
            sortConfig={sortConfig}
            onSort={handleSort}
            pagination={pagination}
            emptyMessage="No inventory items found"
          />
        </div>

        <AddEditInventoryDrawer
          open={isAddInventoryOpen}
          onOpenChange={(open) => {
            setIsAddInventoryOpen(open);
            if (!open) {
              setIsEditingInventory(false);
              setEditingItem(null);
            }
          }}
          isEditing={isEditingInventory}
          editingItem={editingItem}
          onAddType={() => setIsAddTypeOpen(true)}
          onAddManufacturer={() => setIsAddManufacturerOpen(true)}
          onAddSupplier={() => setIsSupplierDrawerOpen(true)}
        />

        <ViewTypesDrawer
          open={isViewTypesOpen}
          onOpenChange={setIsViewTypesOpen}
          types={types}
          onAddType={() => setIsAddTypeOpen(true)}
          onTypeReorder={reorderTypes}
          onCreateInventoryWithType={() => {
            setIsViewTypesOpen(false);
            setIsAddInventoryOpen(true);
          }}
        />

        <ViewManufacturersDrawer
          open={isViewManufacturersOpen}
          onOpenChange={setIsViewManufacturersOpen}
          manufacturers={manufacturers}
          onAddManufacturer={() => setIsAddManufacturerOpen(true)}
          onManufacturerReorder={reorderManufacturers}
          onCreateInventoryWithManufacturer={() => {
            setIsViewManufacturersOpen(false);
            setIsAddInventoryOpen(true);
          }}
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

        <StockAdjustmentDrawer
          open={isStockAdjustmentOpen}
          onOpenChange={setIsStockAdjustmentOpen}
          item={stockAdjustmentItem}
          adjustmentType={adjustmentType}
        />

        <SupplierDrawer
          open={isSupplierDrawerOpen}
          onOpenChange={(open) => {
            setIsSupplierDrawerOpen(open);
            if (!open) setEditingSupplier(null);
          }}
          editingSupplier={editingSupplier}
        />

        <SuppliersListDrawer
          open={isSuppliersListOpen}
          onOpenChange={setIsSuppliersListOpen}
          onAddSupplier={() => {
            setIsSuppliersListOpen(false);
            setEditingSupplier(null);
            setIsSupplierDrawerOpen(true);
          }}
          onEditSupplier={(supplier) => {
            setIsSuppliersListOpen(false);
            setEditingSupplier(supplier as any);
            setIsSupplierDrawerOpen(true);
          }}
        />

        <PurchaseOrderDrawer
          open={isPurchaseOrderOpen}
          onOpenChange={(open) => {
            setIsPurchaseOrderOpen(open);
            if (!open) setEditingPurchaseOrder(null);
          }}
          editingOrder={editingPurchaseOrder}
        />

        <PurchaseOrdersListDrawer
          open={isPurchaseOrdersListOpen}
          onOpenChange={setIsPurchaseOrdersListOpen}
          onAddOrder={() => {
            setIsPurchaseOrdersListOpen(false);
            setEditingPurchaseOrder(null);
            setIsPurchaseOrderOpen(true);
          }}
          onEditOrder={(order) => {
            setIsPurchaseOrdersListOpen(false);
            setEditingPurchaseOrder(order);
            setIsPurchaseOrderOpen(true);
          }}
          onReceiveOrder={(order) => {
            setIsPurchaseOrdersListOpen(false);
            setReceivingOrder(order);
            setIsReceiveOrderOpen(true);
          }}
        />

        <ReceiveOrderDrawer
          open={isReceiveOrderOpen}
          onOpenChange={(open) => {
            setIsReceiveOrderOpen(open);
            if (!open) setReceivingOrder(null);
          }}
          order={receivingOrder}
        />

        <StocktakeDrawer
          open={isStocktakeOpen}
          onOpenChange={setIsStocktakeOpen}
          stocktake={selectedStocktake}
          mode={stocktakeMode}
          onCreate={() => setIsStocktakeListOpen(true)}
        />

        <StocktakeListDrawer
          open={isStocktakeListOpen}
          onOpenChange={setIsStocktakeListOpen}
          onCreateStocktake={() => {
            setIsStocktakeListOpen(false);
            setSelectedStocktake(null);
            setStocktakeMode('create');
            setIsStocktakeOpen(true);
          }}
          onViewStocktake={(stocktake) => {
            setIsStocktakeListOpen(false);
            setSelectedStocktake(stocktake);
            setStocktakeMode('view');
            setIsStocktakeOpen(true);
          }}
          onContinueStocktake={(stocktake) => {
            setIsStocktakeListOpen(false);
            setSelectedStocktake(stocktake);
            setStocktakeMode('count');
            setIsStocktakeOpen(true);
          }}
        />

        <LowStockAlertsDrawer
          open={isLowStockAlertsOpen}
          onOpenChange={setIsLowStockAlertsOpen}
          onCreatePurchaseOrder={() => {
            setIsLowStockAlertsOpen(false);
            setIsPurchaseOrderOpen(true);
          }}
          onAdjustStock={(item) => {
            setIsLowStockAlertsOpen(false);
            handleAdjustStock(item, 'add');
          }}
        />

        <StockMovementDrawer
          open={isStockMovementOpen}
          onOpenChange={setIsStockMovementOpen}
        />

        <InventoryReportsDrawer
          open={isReportsOpen}
          onOpenChange={setIsReportsOpen}
        />

        <ImportExportDrawer
          open={isImportExportOpen}
          onOpenChange={setIsImportExportOpen}
        />

        <QuickReorderDrawer
          open={isQuickReorderOpen}
          onOpenChange={setIsQuickReorderOpen}
        />

        <ExpirationAlertsDrawer
          open={isExpirationAlertsOpen}
          onOpenChange={setIsExpirationAlertsOpen}
          onAdjustStock={(item) => {
            handleAdjustStock(item, 'remove');
          }}
        />
      </Container>
    </AppLayout>
  );
};

export default Inventory;
