import React, { useState, useEffect } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseBadge } from '@/components/base/BaseBadge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { PurchaseOrder } from '@/types/inventory';
import { Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReceiveOrderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
}

interface ReceiveItemForm {
  itemId: string;
  itemName: string;
  sku: string;
  quantityOrdered: number;
  quantityPreviouslyReceived: number;
  quantityReceiving: number;
  notes: string;
}

export const ReceiveOrderDrawer: React.FC<ReceiveOrderDrawerProps> = ({
  open,
  onOpenChange,
  order,
}) => {
  const { receivePurchaseOrder } = useInventoryStore();
  const [receiveItems, setReceiveItems] = useState<ReceiveItemForm[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && order) {
      setReceiveItems(
        order.items.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          sku: item.sku,
          quantityOrdered: item.quantityOrdered,
          quantityPreviouslyReceived: item.quantityReceived,
          quantityReceiving: item.quantityOrdered - item.quantityReceived,
          notes: '',
        }))
      );
      setNotes('');
    }
  }, [open, order]);

  const updateReceiveItem = (index: number, updates: Partial<ReceiveItemForm>) => {
    const newItems = [...receiveItems];
    newItems[index] = { ...newItems[index], ...updates };
    setReceiveItems(newItems);
  };

  const handleReceiveAll = () => {
    setReceiveItems(
      receiveItems.map((item) => ({
        ...item,
        quantityReceiving: item.quantityOrdered - item.quantityPreviouslyReceived,
      }))
    );
  };

  const handleSubmit = () => {
    if (!order) return;

    const itemsToReceive = receiveItems
      .filter((item) => item.quantityReceiving > 0)
      .map((item) => ({
        itemId: item.itemId,
        quantityReceived: item.quantityReceiving,
        notes: item.notes || undefined,
      }));

    if (itemsToReceive.length === 0) {
      toast.error('Please enter quantities for items to receive');
      return;
    }

    const result = receivePurchaseOrder(
      order.id,
      itemsToReceive,
      'current_user',
      'Current User',
      notes || undefined
    );

    if (result) {
      toast.success('Items received successfully');
      onOpenChange(false);
    } else {
      toast.error('Failed to receive items');
    }
  };

  if (!order) return null;

  const totalReceiving = receiveItems.reduce((sum, item) => sum + item.quantityReceiving, 0);

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Receive Purchase Order"
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
            disabled={totalReceiving === 0}
          >
            <Truck className="h-4 w-4 mr-2" />
            Receive {totalReceiving} Items
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{order.orderNumber}</h3>
              <p className="text-sm text-muted-foreground">{order.supplierName}</p>
            </div>
            <BaseBadge variant="outline">
              {order.status === 'partially_received' ? 'Partially Received' : 'Ordered'}
            </BaseBadge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items to Receive
          </h4>
          <BaseButton variant="outline" size="sm" onClick={handleReceiveAll}>
            Receive All
          </BaseButton>
        </div>

        <div className="space-y-3">
          {receiveItems.map((item, index) => {
            const remaining = item.quantityOrdered - item.quantityPreviouslyReceived;
            const isFullyReceived = remaining === 0;
            const isOverReceiving = item.quantityReceiving > remaining;

            return (
              <div
                key={item.itemId}
                className={`bg-card border rounded-lg p-4 ${
                  isFullyReceived ? 'border-green-200 bg-green-50/50' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium flex items-center gap-2">
                      {item.itemName}
                      {isFullyReceived && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </h5>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ordered:</span>
                    <span className="ml-2 font-medium">{item.quantityOrdered}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Received:</span>
                    <span className="ml-2 font-medium">{item.quantityPreviouslyReceived}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="ml-2 font-medium">{remaining}</span>
                  </div>
                </div>

                {!isFullyReceived && (
                  <div className="space-y-3">
                    <div>
                      <BaseLabel>Quantity Receiving</BaseLabel>
                      <BaseInput
                        type="number"
                        min="0"
                        max={remaining}
                        value={item.quantityReceiving}
                        onChange={(e) =>
                          updateReceiveItem(index, {
                            quantityReceiving: parseInt(e.target.value) || 0,
                          })
                        }
                        className={isOverReceiving ? 'border-yellow-500' : ''}
                      />
                      {isOverReceiving && (
                        <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Receiving more than expected
                        </p>
                      )}
                    </div>
                    <div>
                      <BaseLabel>Notes</BaseLabel>
                      <BaseInput
                        value={item.notes}
                        onChange={(e) => updateReceiveItem(index, { notes: e.target.value })}
                        placeholder="Optional notes for this item"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <BaseLabel>Receiving Notes</BaseLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="General notes about this receiving..."
            rows={3}
          />
        </div>
      </div>
    </BaseDrawer>
  );
};
