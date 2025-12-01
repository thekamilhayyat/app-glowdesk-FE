import React, { useState } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { useInventoryStore } from '@/stores/inventoryStore';
import { StockMovement, InventoryItem } from '@/types/inventory';
import { format } from 'date-fns';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Package,
  History,
} from 'lucide-react';

interface StockMovementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
}

const reasonLabels: Record<string, string> = {
  received: 'Received from supplier',
  sold: 'Sold',
  damaged: 'Damaged',
  expired: 'Expired',
  lost: 'Lost',
  stolen: 'Stolen',
  returned: 'Customer return',
  used_in_service: 'Used in service',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  stocktake_adjustment: 'Stocktake adjustment',
  initial_stock: 'Initial stock',
  other: 'Other',
};

export const StockMovementDrawer: React.FC<StockMovementDrawerProps> = ({
  open,
  onOpenChange,
  item,
}) => {
  const { getStockMovements, items } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string>(item?.id || 'all');

  const movements = getStockMovements(selectedItemId === 'all' ? undefined : selectedItemId);

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || movement.movementType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={item ? `Stock History: ${item.name}` : 'Stock Movement History'}
      width={600}
      footer={
        <BaseButton
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          Close
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <BaseInput
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <BaseSelect value={typeFilter} onValueChange={setTypeFilter}>
            <BaseSelectItem value="all">All Types</BaseSelectItem>
            <BaseSelectItem value="in">Stock In</BaseSelectItem>
            <BaseSelectItem value="out">Stock Out</BaseSelectItem>
          </BaseSelect>
        </div>

        {!item && (
          <BaseSelect value={selectedItemId} onValueChange={setSelectedItemId}>
            <BaseSelectItem value="all">All Products</BaseSelectItem>
            {items.map((i) => (
              <BaseSelectItem key={i.id} value={i.id}>
                {i.name}
              </BaseSelectItem>
            ))}
          </BaseSelect>
        )}

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No stock movements found</p>
              <p className="text-sm">Stock changes will appear here</p>
            </div>
          ) : (
            filteredMovements.map((movement) => (
              <div
                key={movement.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    movement.movementType === 'in' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {movement.movementType === 'in' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{movement.itemName}</h5>
                      <span className={`font-bold ${
                        movement.movementType === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.movementType === 'in' ? '+' : '-'}{movement.quantity}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <BaseBadge variant="outline">
                        {reasonLabels[movement.reason] || movement.reason}
                      </BaseBadge>
                      <span className="text-xs text-muted-foreground">
                        {movement.previousStock} → {movement.newStock}
                      </span>
                    </div>
                    {movement.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{movement.notes}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>By: {movement.performedByName}</span>
                      <span>{format(new Date(movement.createdAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BaseDrawer>
  );
};
