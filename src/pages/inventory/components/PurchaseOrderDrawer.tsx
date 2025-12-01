import React, { useState, useEffect } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/inventory';
import { Plus, Trash2, Package, ShoppingCart, Calendar } from 'lucide-react';

interface PurchaseOrderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrder?: PurchaseOrder | null;
}

interface OrderItemForm {
  id: string;
  itemId: string;
  quantityOrdered: number;
  unitCost: number;
}

export const PurchaseOrderDrawer: React.FC<PurchaseOrderDrawerProps> = ({
  open,
  onOpenChange,
  editingOrder,
}) => {
  const { suppliers, items, createPurchaseOrder, updatePurchaseOrder } = useInventoryStore();
  const isEditing = !!editingOrder;

  const [supplierId, setSupplierId] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);

  useEffect(() => {
    if (open && editingOrder) {
      setSupplierId(editingOrder.supplierId);
      setExpectedDeliveryDate(editingOrder.expectedDeliveryDate || '');
      setNotes(editingOrder.notes || '');
      setOrderItems(
        editingOrder.items.map((item) => ({
          id: item.id,
          itemId: item.itemId,
          quantityOrdered: item.quantityOrdered,
          unitCost: item.unitCost,
        }))
      );
    } else if (!open) {
      setSupplierId('');
      setExpectedDeliveryDate('');
      setNotes('');
      setOrderItems([]);
    }
  }, [open, editingOrder]);

  const activeSuppliers = suppliers.filter((s) => s.status === 'active');
  const activeItems = items.filter((i) => i.status === 'active');

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        id: `temp_${Date.now()}`,
        itemId: '',
        quantityOrdered: 1,
        unitCost: 0,
      },
    ]);
  };

  const updateOrderItem = (index: number, updates: Partial<OrderItemForm>) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], ...updates };

    if (updates.itemId) {
      const item = items.find((i) => i.id === updates.itemId);
      if (item) {
        newItems[index].unitCost = item.costPrice;
      }
    }

    setOrderItems(newItems);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getItemName = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    return item?.name || 'Unknown Item';
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantityOrdered * item.unitCost, 0);
  };

  const handleSubmit = () => {
    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const invalidItems = orderItems.filter((item) => !item.itemId || item.quantityOrdered < 1);
    if (invalidItems.length > 0) {
      toast.error('Please fill in all item details');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    const subtotal = calculateSubtotal();

    const poItems: PurchaseOrderItem[] = orderItems.map((item) => ({
      id: item.id.startsWith('temp_') ? `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : item.id,
      itemId: item.itemId,
      itemName: getItemName(item.itemId),
      sku: items.find((i) => i.id === item.itemId)?.sku || '',
      quantityOrdered: item.quantityOrdered,
      quantityReceived: 0,
      unitCost: item.unitCost,
      totalCost: item.quantityOrdered * item.unitCost,
    }));

    if (isEditing && editingOrder) {
      updatePurchaseOrder(editingOrder.id, {
        supplierId,
        supplierName: supplier?.name || '',
        items: poItems,
        subtotal,
        total: subtotal,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes: notes || undefined,
      });
      toast.success('Purchase order updated successfully');
    } else {
      createPurchaseOrder({
        supplierId,
        supplierName: supplier?.name || '',
        items: poItems,
        subtotal,
        tax: 0,
        shipping: 0,
        total: subtotal,
        status: 'draft',
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes: notes || undefined,
        createdBy: 'current_user',
        createdByName: 'Current User',
      });
      toast.success('Purchase order created successfully');
    }

    onOpenChange(false);
  };

  const suggestReorderItems = () => {
    const lowStockItems = items.filter(
      (item) =>
        item.trackStock &&
        item.status === 'active' &&
        item.currentStock <= item.reorderPoint &&
        (!supplierId || item.supplierId === supplierId)
    );

    if (lowStockItems.length === 0) {
      toast.info('No items need reordering');
      return;
    }

    const newItems: OrderItemForm[] = lowStockItems.map((item) => ({
      id: `temp_${Date.now()}_${item.id}`,
      itemId: item.id,
      quantityOrdered: item.reorderQuantity,
      unitCost: item.costPrice,
    }));

    setOrderItems([...orderItems, ...newItems]);
    toast.success(`Added ${lowStockItems.length} items that need reordering`);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Purchase Order' : 'Create Purchase Order'}
      width={600}
      footer={
        <div className="flex gap-2 w-full">
          <BaseButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="button"
            variant="gradient"
            onClick={handleSubmit}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Order' : 'Create Order'}
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <BaseLabel>Supplier *</BaseLabel>
            <BaseSelect
              value={supplierId}
              onValueChange={setSupplierId}
              placeholder="Select a supplier"
            >
              {activeSuppliers.map((supplier) => (
                <BaseSelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </BaseSelectItem>
              ))}
            </BaseSelect>
          </div>

          {selectedSupplier && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium">{selectedSupplier.name}</p>
              {selectedSupplier.email && <p className="text-muted-foreground">{selectedSupplier.email}</p>}
              {selectedSupplier.leadTimeDays && (
                <p className="text-muted-foreground">Lead time: {selectedSupplier.leadTimeDays} days</p>
              )}
            </div>
          )}

          <div>
            <BaseLabel>
              <Calendar className="h-3 w-3 inline mr-1" />
              Expected Delivery Date
            </BaseLabel>
            <BaseInput
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h3>
            <div className="flex gap-2">
              <BaseButton variant="outline" size="sm" onClick={suggestReorderItems}>
                Auto-fill Low Stock
              </BaseButton>
              <BaseButton variant="outline" size="sm" onClick={addOrderItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </BaseButton>
            </div>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No items added yet</p>
              <BaseButton variant="ghost" size="sm" onClick={addOrderItem}>
                Add your first item
              </BaseButton>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((orderItem, index) => (
                <div
                  key={orderItem.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <BaseLabel>Product</BaseLabel>
                        <BaseSelect
                          value={orderItem.itemId}
                          onValueChange={(value) => updateOrderItem(index, { itemId: value })}
                          placeholder="Select a product"
                        >
                          {activeItems.map((item) => (
                            <BaseSelectItem key={item.id} value={item.id}>
                              {item.name} (Stock: {item.currentStock})
                            </BaseSelectItem>
                          ))}
                        </BaseSelect>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <BaseLabel>Quantity</BaseLabel>
                          <BaseInput
                            type="number"
                            min="1"
                            value={orderItem.quantityOrdered}
                            onChange={(e) =>
                              updateOrderItem(index, { quantityOrdered: parseInt(e.target.value) || 1 })
                            }
                          />
                        </div>
                        <div>
                          <BaseLabel>Unit Cost ($)</BaseLabel>
                          <BaseInput
                            type="number"
                            step="0.01"
                            min="0"
                            value={orderItem.unitCost}
                            onChange={(e) =>
                              updateOrderItem(index, { unitCost: parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>
                      <div className="text-sm text-right text-muted-foreground">
                        Line Total: ${(orderItem.quantityOrdered * orderItem.unitCost).toFixed(2)}
                      </div>
                    </div>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrderItem(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {orderItems.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Order Total:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <BaseLabel>Notes</BaseLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for this order..."
            rows={3}
          />
        </div>
      </div>
    </BaseDrawer>
  );
};
