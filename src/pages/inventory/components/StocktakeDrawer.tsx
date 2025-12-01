import React, { useState, useEffect } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseBadge } from '@/components/base/BaseBadge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { Stocktake, StocktakeItem } from '@/types/inventory';
import { 
  ClipboardList, 
  CheckCircle, 
  AlertTriangle, 
  Package,
  Search,
  Barcode,
  Save
} from 'lucide-react';

interface StocktakeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stocktake: Stocktake | null;
  mode: 'create' | 'count' | 'view';
  onCreate?: () => void;
}

export const StocktakeDrawer: React.FC<StocktakeDrawerProps> = ({
  open,
  onOpenChange,
  stocktake,
  mode,
  onCreate,
}) => {
  const { 
    createStocktake, 
    updateStocktakeItem, 
    completeStocktake, 
    cancelStocktake 
  } = useInventoryStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [countedItems, setCountedItems] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (open && mode === 'create') {
      const date = new Date();
      setName(`Stocktake ${date.toLocaleDateString()}`);
      setDescription('');
    } else if (open && stocktake && (mode === 'count' || mode === 'view')) {
      const counts: Record<string, number | null> = {};
      stocktake.items.forEach((item) => {
        counts[item.itemId] = item.countedQuantity;
      });
      setCountedItems(counts);
    }
  }, [open, mode, stocktake]);

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the stocktake');
      return;
    }

    createStocktake(name, description, 'current_user', 'Current User');
    toast.success('Stocktake created successfully');
    onOpenChange(false);
    onCreate?.();
  };

  const handleUpdateCount = (itemId: string, quantity: number | null) => {
    setCountedItems((prev) => ({ ...prev, [itemId]: quantity }));
  };

  const handleSaveCount = (itemId: string) => {
    if (!stocktake) return;
    const quantity = countedItems[itemId];
    if (quantity !== null && quantity !== undefined) {
      updateStocktakeItem(stocktake.id, itemId, quantity, undefined, 'current_user');
      toast.success('Count saved');
    }
  };

  const handleComplete = (applyAdjustments: boolean) => {
    if (!stocktake) return;

    const uncountedItems = stocktake.items.filter((item) => countedItems[item.itemId] === null);
    if (uncountedItems.length > 0) {
      toast.error(`${uncountedItems.length} items have not been counted`);
      return;
    }

    completeStocktake(stocktake.id, 'current_user', 'Current User', applyAdjustments);
    toast.success(
      applyAdjustments 
        ? 'Stocktake completed and adjustments applied' 
        : 'Stocktake completed without adjustments'
    );
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (!stocktake) return;
    cancelStocktake(stocktake.id);
    toast.success('Stocktake cancelled');
    onOpenChange(false);
  };

  const filteredItems = stocktake?.items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDiscrepancyColor = (discrepancy: number) => {
    if (discrepancy === 0) return 'text-green-600';
    if (discrepancy > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  if (mode === 'create') {
    return (
      <BaseDrawer
        open={open}
        onOpenChange={onOpenChange}
        title="Start New Stocktake"
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
              onClick={handleCreate}
              className="flex-1"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Start Stocktake
            </BaseButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              A stocktake will create a list of all active products with stock tracking enabled. 
              You can then count each item and the system will calculate any discrepancies.
            </p>
          </div>

          <div>
            <BaseLabel htmlFor="name">Stocktake Name *</BaseLabel>
            <BaseInput
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter stocktake name"
            />
          </div>

          <div>
            <BaseLabel htmlFor="description">Description</BaseLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
        </div>
      </BaseDrawer>
    );
  }

  if (!stocktake) return null;

  const isEditable = mode === 'count' && stocktake.status === 'in_progress';

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'count' ? 'Count Inventory' : 'View Stocktake'}
      width={600}
      footer={
        isEditable ? (
          <div className="flex gap-2 w-full">
            <BaseButton
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel Stocktake
            </BaseButton>
            <BaseButton
              variant="outline"
              onClick={() => handleComplete(false)}
              className="flex-1"
            >
              Complete (No Adjust)
            </BaseButton>
            <BaseButton
              variant="gradient"
              onClick={() => handleComplete(true)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete & Adjust
            </BaseButton>
          </div>
        ) : (
          <BaseButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </BaseButton>
        )
      }
    >
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{stocktake.name}</h3>
              {stocktake.description && (
                <p className="text-sm text-muted-foreground">{stocktake.description}</p>
              )}
            </div>
            <BaseBadge 
              variant={stocktake.status === 'completed' ? 'default' : 
                       stocktake.status === 'cancelled' ? 'destructive' : 'secondary'}
            >
              {stocktake.status}
            </BaseBadge>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Items:</span>
              <span className="ml-2 font-medium">{stocktake.totalItems}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Counted:</span>
              <span className="ml-2 font-medium">{stocktake.countedItems}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Discrepancy:</span>
              <span className="ml-2 font-medium">{stocktake.totalDiscrepancy} units</span>
            </div>
            <div>
              <span className="text-muted-foreground">Value:</span>
              <span className="ml-2 font-medium">${stocktake.totalDiscrepancyValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search items by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredItems.map((item) => {
            const currentCount = countedItems[item.itemId];
            const isCounted = currentCount !== null && currentCount !== undefined;
            const discrepancy = isCounted ? currentCount - item.expectedQuantity : 0;

            return (
              <div
                key={item.id}
                className={`bg-card border rounded-lg p-3 ${
                  isCounted ? 'border-green-200' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{item.itemName}</h5>
                      {isCounted && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Barcode className="h-3 w-3" />
                        {item.sku}
                      </span>
                      <span>Expected: {item.expectedQuantity}</span>
                      {isCounted && (
                        <span className={getDiscrepancyColor(discrepancy)}>
                          {discrepancy > 0 ? '+' : ''}{discrepancy} difference
                        </span>
                      )}
                    </div>
                  </div>
                  {isEditable ? (
                    <div className="flex items-center gap-2">
                      <BaseInput
                        type="number"
                        min="0"
                        value={currentCount ?? ''}
                        onChange={(e) => 
                          handleUpdateCount(
                            item.itemId, 
                            e.target.value === '' ? null : parseInt(e.target.value)
                          )
                        }
                        className="w-24"
                        placeholder="Count"
                      />
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveCount(item.itemId)}
                        disabled={currentCount === null || currentCount === undefined}
                      >
                        <Save className="h-4 w-4" />
                      </BaseButton>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="font-medium">{item.countedQuantity ?? '-'}</div>
                      {item.countedQuantity !== null && (
                        <div className={`text-xs ${getDiscrepancyColor(item.discrepancy)}`}>
                          {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BaseDrawer>
  );
};
