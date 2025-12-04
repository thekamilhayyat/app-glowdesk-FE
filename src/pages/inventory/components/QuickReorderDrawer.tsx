import React, { useState, useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseCard, CardContent, CardHeader, CardTitle } from '@/components/base/BaseCard';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem, PurchaseOrder, PurchaseOrderItem } from '@/types/inventory';
import { 
  ShoppingCart, 
  AlertTriangle, 
  Package, 
  Check,
  Truck,
  XCircle
} from 'lucide-react';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';

interface QuickReorderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (order: PurchaseOrder) => void;
}

interface ReorderItem extends InventoryItem {
  selected: boolean;
  orderQuantity: number;
}

export const QuickReorderDrawer: React.FC<QuickReorderDrawerProps> = ({
  open,
  onOpenChange,
  onOrderCreated,
}) => {
  const { 
    getLowStockItems, 
    getOutOfStockItems, 
    suppliers, 
    createPurchaseOrder,
    getItemById
  } = useInventoryStore();

  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();
  const allNeedingReorder = [...outOfStockItems, ...lowStockItems];

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});

  const getOrderQuantity = (item: InventoryItem) => {
    return orderQuantities[item.id] ?? item.reorderQuantity;
  };

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(allNeedingReorder.map(item => item.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const itemsBySupplier = useMemo(() => {
    const grouped: Record<string, InventoryItem[]> = {};
    
    allNeedingReorder.forEach(item => {
      const supplierId = item.supplierId || 'no_supplier';
      if (!grouped[supplierId]) {
        grouped[supplierId] = [];
      }
      grouped[supplierId].push(item);
    });

    return grouped;
  }, [allNeedingReorder]);

  const getSupplierName = (supplierId: string) => {
    if (supplierId === 'no_supplier') return 'No Supplier Assigned';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const selectedItemsList = allNeedingReorder.filter(item => selectedItems.has(item.id));

  const totalOrderValue = selectedItemsList.reduce((sum, item) => {
    return sum + (item.costPrice * getOrderQuantity(item));
  }, 0);

  const handleCreateOrders = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to reorder');
      return;
    }

    const ordersBySupplier: Record<string, InventoryItem[]> = {};
    
    selectedItemsList.forEach(item => {
      const supplierId = item.supplierId || 'no_supplier';
      if (!ordersBySupplier[supplierId]) {
        ordersBySupplier[supplierId] = [];
      }
      ordersBySupplier[supplierId].push(item);
    });

    let ordersCreated = 0;

    Object.entries(ordersBySupplier).forEach(([supplierId, items]) => {
      if (supplierId === 'no_supplier') {
        toast.warning(`${items.length} item(s) have no supplier assigned and were skipped`);
        return;
      }

      const supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) return;

      const orderItems: PurchaseOrderItem[] = items.map(item => ({
        id: `poi_${Date.now()}_${item.id}`,
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        quantityOrdered: getOrderQuantity(item),
        quantityReceived: 0,
        unitCost: item.costPrice,
        totalCost: item.costPrice * getOrderQuantity(item),
      }));

      const subtotal = orderItems.reduce((sum, oi) => sum + oi.totalCost, 0);

      const order: PurchaseOrder = {
        id: `po_${Date.now()}_${supplierId}`,
        orderNumber: `PO-${Date.now().toString().slice(-6)}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        items: orderItems,
        subtotal,
        tax: 0,
        shipping: 0,
        total: subtotal,
        status: 'draft',
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: supplier.leadTimeDays 
          ? new Date(Date.now() + supplier.leadTimeDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        notes: 'Auto-generated from Quick Reorder',
        createdBy: 'current_user',
        createdByName: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createPurchaseOrder(order);
      ordersCreated++;

      if (onOrderCreated) {
        onOrderCreated(order);
      }
    });

    if (ordersCreated > 0) {
      toast.success(`Created ${ordersCreated} purchase order(s)`);
      setSelectedItems(new Set());
      onOpenChange(false);
    }
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Quick Reorder"
      width={700}
      footer={
        <div className="flex gap-2 w-full">
          <BaseButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="gradient"
            onClick={handleCreateOrders}
            className="flex-1"
            disabled={selectedItems.size === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create {Object.keys(itemsBySupplier).filter(s => 
              selectedItemsList.some(item => (item.supplierId || 'no_supplier') === s && s !== 'no_supplier')
            ).length || 0} Order(s)
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{outOfStockItems.length}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Out of Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{lowStockItems.length}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">Low Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{selectedItems.size}</p>
                <p className="text-sm text-muted-foreground">Selected</p>
              </div>
            </div>
          </div>
        </div>

        {allNeedingReorder.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">All products are well stocked</p>
            <p className="text-sm">No items need reordering at this time</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BaseButton variant="ghost" size="sm" onClick={selectAll}>
                  Select All ({allNeedingReorder.length})
                </BaseButton>
                <BaseButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={deselectAll}
                  disabled={selectedItems.size === 0}
                >
                  Deselect All
                </BaseButton>
              </div>
              {selectedItems.size > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Order Total: </span>
                  <span className="font-semibold">${totalOrderValue.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {Object.entries(itemsBySupplier).map(([supplierId, items]) => (
                <BaseCard key={supplierId}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {getSupplierName(supplierId)}
                      <span className="text-muted-foreground font-normal">
                        ({items.length} item{items.length > 1 ? 's' : ''})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {items.map(item => {
                        const isSelected = selectedItems.has(item.id);
                        const isOutOfStock = item.currentStock <= 0;
                        
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              isSelected 
                                ? 'bg-primary/5 border-primary/30' 
                                : 'bg-card border-border hover:border-primary/20'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleItem(item.id)}
                              disabled={supplierId === 'no_supplier'}
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{item.name}</span>
                                {isOutOfStock ? (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                                    Out of Stock
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                                    Low Stock
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                <span>SKU: {item.sku}</span>
                                <span>Current: {item.currentStock}</span>
                                <span>Min: {item.lowStockThreshold}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Order Qty</p>
                                <input
                                  type="number"
                                  min="1"
                                  value={getOrderQuantity(item)}
                                  onChange={(e) => {
                                    setOrderQuantities(prev => ({
                                      ...prev,
                                      [item.id]: parseInt(e.target.value) || item.reorderQuantity
                                    }));
                                  }}
                                  className="w-16 text-center text-sm border rounded px-2 py-1"
                                />
                              </div>
                              <div className="text-right min-w-[80px]">
                                <p className="text-xs text-muted-foreground">Cost</p>
                                <p className="text-sm font-medium">
                                  ${(item.costPrice * getOrderQuantity(item)).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {supplierId === 'no_supplier' && (
                      <p className="text-xs text-amber-600 mt-2">
                        Items without a supplier cannot be included in purchase orders. 
                        Assign a supplier to these products to enable quick reordering.
                      </p>
                    )}
                  </CardContent>
                </BaseCard>
              ))}
            </div>
          </>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Check className="h-4 w-4" />
            How Quick Reorder Works
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Select items you want to reorder</li>
            <li>• Adjust quantities if needed (defaults to reorder quantity)</li>
            <li>• One purchase order will be created per supplier</li>
            <li>• Orders are created as drafts - review before sending</li>
          </ul>
        </div>
      </div>
    </BaseDrawer>
  );
};
