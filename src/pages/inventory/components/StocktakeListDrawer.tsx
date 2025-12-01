import React, { useState } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseBadge } from '@/components/base/BaseBadge';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { useInventoryStore } from '@/stores/inventoryStore';
import { Stocktake } from '@/types/inventory';
import { format } from 'date-fns';
import {
  ClipboardList,
  Plus,
  Eye,
  Play,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface StocktakeListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStocktake: () => void;
  onViewStocktake: (stocktake: Stocktake) => void;
  onContinueStocktake: (stocktake: Stocktake) => void;
}

export const StocktakeListDrawer: React.FC<StocktakeListDrawerProps> = ({
  open,
  onOpenChange,
  onCreateStocktake,
  onViewStocktake,
  onContinueStocktake,
}) => {
  const { stocktakes } = useInventoryStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStocktakes = stocktakes.filter((st) => {
    if (statusFilter === 'all') return true;
    return st.status === statusFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Stocktakes"
      width={600}
      footer={
        <BaseButton
          variant="gradient"
          onClick={() => {
            onOpenChange(false);
            onCreateStocktake();
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Stocktake
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <BaseSelect value={statusFilter} onValueChange={setStatusFilter}>
          <BaseSelectItem value="all">All Status</BaseSelectItem>
          <BaseSelectItem value="in_progress">In Progress</BaseSelectItem>
          <BaseSelectItem value="completed">Completed</BaseSelectItem>
          <BaseSelectItem value="cancelled">Cancelled</BaseSelectItem>
        </BaseSelect>

        <div className="space-y-3">
          {filteredStocktakes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No stocktakes found</p>
              <p className="text-sm">Start a new stocktake to count your inventory</p>
            </div>
          ) : (
            filteredStocktakes.map((stocktake) => (
              <div
                key={stocktake.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{stocktake.name}</h4>
                      <BaseBadge 
                        variant={getStatusVariant(stocktake.status)}
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon(stocktake.status)}
                        {stocktake.status.replace('_', ' ')}
                      </BaseBadge>
                    </div>
                    {stocktake.description && (
                      <p className="text-sm text-muted-foreground mt-1">{stocktake.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span>
                        {stocktake.countedItems}/{stocktake.totalItems} items counted
                      </span>
                      <span>
                        Discrepancy: {stocktake.totalDiscrepancy} units (${stocktake.totalDiscrepancyValue.toFixed(2)})
                      </span>
                      <span>
                        Started: {format(new Date(stocktake.startedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      {stocktake.completedAt && (
                        <span>
                          Completed: {format(new Date(stocktake.completedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {stocktake.status === 'in_progress' && (
                      <BaseButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onOpenChange(false);
                          onContinueStocktake(stocktake);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Continue
                      </BaseButton>
                    )}
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onViewStocktake(stocktake);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </BaseButton>
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
