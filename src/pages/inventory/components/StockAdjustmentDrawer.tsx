import React, { useEffect } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem, StockAdjustmentReason } from '@/types/inventory';
import { Plus, Minus, Package, AlertTriangle } from 'lucide-react';

interface StockAdjustmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  adjustmentType: 'add' | 'remove';
}

const adjustmentReasons: { value: StockAdjustmentReason; label: string; type: 'add' | 'remove' | 'both' }[] = [
  { value: 'received', label: 'Received from supplier', type: 'add' },
  { value: 'returned', label: 'Customer return', type: 'add' },
  { value: 'transfer_in', label: 'Transfer in from location', type: 'add' },
  { value: 'initial_stock', label: 'Initial stock count', type: 'add' },
  { value: 'sold', label: 'Sold', type: 'remove' },
  { value: 'damaged', label: 'Damaged', type: 'remove' },
  { value: 'expired', label: 'Expired', type: 'remove' },
  { value: 'lost', label: 'Lost', type: 'remove' },
  { value: 'stolen', label: 'Stolen', type: 'remove' },
  { value: 'used_in_service', label: 'Used in service', type: 'remove' },
  { value: 'transfer_out', label: 'Transfer out to location', type: 'remove' },
  { value: 'stocktake_adjustment', label: 'Stocktake adjustment', type: 'both' },
  { value: 'other', label: 'Other', type: 'both' },
];

export const StockAdjustmentDrawer: React.FC<StockAdjustmentDrawerProps> = ({
  open,
  onOpenChange,
  item,
  adjustmentType,
}) => {
  const { adjustStock } = useInventoryStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: '',
      reason: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const quantity = watch('quantity');
  const parsedQuantity = parseInt(quantity) || 0;
  const newStock = adjustmentType === 'add' 
    ? (item?.currentStock || 0) + parsedQuantity 
    : (item?.currentStock || 0) - parsedQuantity;

  const filteredReasons = adjustmentReasons.filter(
    (r) => r.type === adjustmentType || r.type === 'both'
  );

  const onSubmit = (data: { quantity: string; reason: string; notes?: string }) => {
    if (!item) return;

    const qty = parseInt(data.quantity) || 0;
    const adjustmentQuantity = adjustmentType === 'add' ? qty : -qty;
    
    const result = adjustStock(
      item.id,
      adjustmentQuantity,
      data.reason as StockAdjustmentReason,
      data.notes,
      'current_user',
      'Current User'
    );

    if (result) {
      toast.success(
        adjustmentType === 'add' 
          ? `Added ${qty} units to ${item.name}` 
          : `Removed ${qty} units from ${item.name}`
      );
      onOpenChange(false);
    } else {
      toast.error('Failed to adjust stock. Negative stock not allowed.');
    }
  };

  if (!item) return null;

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
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
            variant={adjustmentType === 'add' ? 'gradient' : 'destructive'}
            onClick={handleSubmit(onSubmit)}
            className="flex-1"
          >
            {adjustmentType === 'add' ? (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </>
            ) : (
              <>
                <Minus className="h-4 w-4 mr-2" />
                Remove Stock
              </>
            )}
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Stock:</span>
              <span className="ml-2 font-medium">{item.currentStock} {item.unitOfMeasure}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Low Stock Alert:</span>
              <span className="ml-2 font-medium">{item.lowStockThreshold} {item.unitOfMeasure}</span>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <BaseLabel htmlFor="quantity">
              Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'} *
            </BaseLabel>
            <BaseInput
              id="quantity"
              type="number"
              min="1"
              {...register('quantity')}
              className={errors.quantity ? 'border-red-500' : ''}
              placeholder={`Enter quantity to ${adjustmentType}`}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <BaseLabel htmlFor="reason">Reason *</BaseLabel>
            <BaseSelect
              value={watch('reason')}
              onValueChange={(value) => setValue('reason', value)}
            >
              <BaseSelectItem value="" disabled>Select a reason</BaseSelectItem>
              {filteredReasons.map((reason) => (
                <BaseSelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </BaseSelectItem>
              ))}
            </BaseSelect>
            {errors.reason && (
              <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <BaseLabel htmlFor="notes">Notes</BaseLabel>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {parsedQuantity > 0 && (
            <div className={`rounded-lg p-4 ${
              adjustmentType === 'remove' && newStock < 0 
                ? 'bg-red-50 border border-red-200' 
                : newStock <= item.lowStockThreshold 
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                {adjustmentType === 'remove' && newStock < 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : newStock <= item.lowStockThreshold ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Package className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <p className="font-medium">
                    New Stock Level: {Math.max(0, newStock)} {item.unitOfMeasure}
                  </p>
                  {adjustmentType === 'remove' && newStock < 0 && (
                    <p className="text-sm text-red-600">
                      Cannot remove more than current stock
                    </p>
                  )}
                  {newStock <= item.lowStockThreshold && newStock >= 0 && (
                    <p className="text-sm text-yellow-600">
                      Stock will be below low stock threshold
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </BaseDrawer>
  );
};
