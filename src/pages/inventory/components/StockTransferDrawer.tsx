import React, { useState, useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useStaffStore } from '@/stores/staffStore';
import { StockTransfer, LocationStock } from '@/types/inventory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowRightLeft,
  Package,
  MapPin,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface StockTransferDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockTransferDrawer({ open, onOpenChange }: StockTransferDrawerProps) {
  const { 
    items, 
    createStockTransfer, 
    completeStockTransfer, 
    cancelStockTransfer,
    getStockTransfers,
    getItemById,
    getStockByLocation
  } = useInventoryStore();
  const { locations } = useStaffStore();
  
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [fromLocationId, setFromLocationId] = useState<string>('');
  const [toLocationId, setToLocationId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('create');

  const activeLocations = useMemo(() => {
    return locations.filter(loc => loc.isActive);
  }, [locations]);

  const selectedItem = useMemo(() => {
    return selectedItemId ? getItemById(selectedItemId) : null;
  }, [selectedItemId, getItemById]);

  const hasLocationStock = useMemo(() => {
    if (!selectedItemId) return false;
    return getStockByLocation(selectedItemId).length > 0;
  }, [selectedItemId, getStockByLocation]);

  const locationStockMap = useMemo(() => {
    if (!selectedItemId) return new Map<string, number>();
    const stocks = getStockByLocation(selectedItemId);
    if (stocks.length === 0 && selectedItem?.currentStock) {
      return new Map<string, number>();
    }
    return new Map(stocks.map(ls => [ls.locationId, ls.quantity]));
  }, [selectedItemId, selectedItem, getStockByLocation]);

  const getLocationStock = (locationId: string): number => {
    if (!selectedItem) return 0;
    if (locationStockMap.has(locationId)) {
      return locationStockMap.get(locationId) || 0;
    }
    if (!hasLocationStock) {
      return selectedItem.currentStock;
    }
    return 0;
  };

  const pendingTransfers = useMemo(() => {
    return getStockTransfers({ status: 'pending' });
  }, [getStockTransfers]);

  const completedTransfers = useMemo(() => {
    return getStockTransfers({ status: 'completed' });
  }, [getStockTransfers]);

  const allTransfers = useMemo(() => {
    return getStockTransfers();
  }, [getStockTransfers]);

  const handleCreateTransfer = () => {
    if (!selectedItemId || !fromLocationId || !toLocationId || quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (fromLocationId === toLocationId) {
      toast.error('Source and destination locations must be different');
      return;
    }
    
    const fromLocation = activeLocations.find(l => l.id === fromLocationId);
    const toLocation = activeLocations.find(l => l.id === toLocationId);
    
    if (!fromLocation || !toLocation) {
      toast.error('Invalid locations selected');
      return;
    }
    
    const transfer = createStockTransfer(
      selectedItemId,
      fromLocationId,
      fromLocation.name,
      toLocationId,
      toLocation.name,
      quantity,
      'current_user',
      'Current User',
      notes || undefined
    );
    
    if (transfer) {
      toast.success(`Transfer request created for ${transfer.itemName}`);
      setSelectedItemId('');
      setFromLocationId('');
      setToLocationId('');
      setQuantity(1);
      setNotes('');
      setActiveTab('pending');
    } else {
      toast.error('Failed to create transfer. Check stock availability.');
    }
  };

  const handleCompleteTransfer = (transferId: string) => {
    const success = completeStockTransfer(transferId, 'current_user', 'Current User');
    if (success) {
      toast.success('Transfer completed successfully');
    } else {
      toast.error('Failed to complete transfer');
    }
  };

  const handleCancelTransfer = (transferId: string) => {
    const success = cancelStockTransfer(transferId);
    if (success) {
      toast.success('Transfer cancelled');
    } else {
      toast.error('Failed to cancel transfer');
    }
  };

  const getStatusBadge = (status: StockTransfer['status']) => {
    switch (status) {
      case 'pending':
        return <BaseBadge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</BaseBadge>;
      case 'completed':
        return <BaseBadge variant="default"><Check className="h-3 w-3 mr-1" />Completed</BaseBadge>;
      case 'cancelled':
        return <BaseBadge variant="destructive"><X className="h-3 w-3 mr-1" />Cancelled</BaseBadge>;
    }
  };

  const TransferCard = ({ transfer }: { transfer: StockTransfer }) => (
    <div className="border rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{transfer.itemName}</h4>
            <p className="text-sm text-muted-foreground">SKU: {transfer.sku}</p>
          </div>
        </div>
        {getStatusBadge(transfer.status)}
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{transfer.fromLocationName}</span>
        <ArrowRightLeft className="h-4 w-4 text-primary" />
        <span>{transfer.toLocationName}</span>
      </div>
      
      <div className="mt-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span>Qty: <strong>{transfer.quantity}</strong></span>
          <span className="text-muted-foreground">
            {format(new Date(transfer.requestedAt), 'MMM d, yyyy HH:mm')}
          </span>
        </div>
        
        {transfer.status === 'pending' && (
          <div className="flex gap-2">
            <BaseButton
              size="sm"
              variant="default"
              onClick={() => handleCompleteTransfer(transfer.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </BaseButton>
            <BaseButton
              size="sm"
              variant="outline"
              onClick={() => handleCancelTransfer(transfer.id)}
            >
              <X className="h-4 w-4" />
            </BaseButton>
          </div>
        )}
      </div>
      
      {transfer.notes && (
        <p className="mt-2 text-sm text-muted-foreground italic">{transfer.notes}</p>
      )}
      
      {transfer.completedAt && (
        <p className="mt-2 text-xs text-muted-foreground">
          Completed by {transfer.completedByName} on {format(new Date(transfer.completedAt), 'MMM d, yyyy HH:mm')}
        </p>
      )}
    </div>
  );

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Stock Transfers"
      width={600}
    >
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="create">Create Transfer</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTransfers.length})
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="flex-1">
            <div className="space-y-4">
              <div>
                <BaseLabel>Product *</BaseLabel>
                <BaseSelect
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <BaseSelectItem value="">Select a product</BaseSelectItem>
                  {items.filter(i => i.status === 'active' && i.trackStock).map(item => (
                    <BaseSelectItem key={item.id} value={item.id}>
                      {item.name} (Stock: {item.currentStock})
                    </BaseSelectItem>
                  ))}
                </BaseSelect>
              </div>
              
              {selectedItem && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedItem.name}</span>
                    <BaseBadge variant="outline">
                      Total Stock: {selectedItem.currentStock}
                    </BaseBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">SKU: {selectedItem.sku}</p>
                  {hasLocationStock ? (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Stock by Location:</p>
                      <div className="flex flex-wrap gap-2">
                        {activeLocations.map(loc => {
                          const qty = getLocationStock(loc.id);
                          return (
                            <BaseBadge key={loc.id} variant={qty > 0 ? "secondary" : "outline"} className="text-xs">
                              {loc.name}: {qty}
                            </BaseBadge>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        No location-specific stock. First transfer will assign stock to source location.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <BaseLabel>From Location *</BaseLabel>
                  <BaseSelect
                    value={fromLocationId}
                    onValueChange={setFromLocationId}
                  >
                    <BaseSelectItem value="">Select source</BaseSelectItem>
                    {activeLocations.map(loc => {
                      const qty = getLocationStock(loc.id);
                      return (
                        <BaseSelectItem key={loc.id} value={loc.id}>
                          {loc.name} ({qty} in stock)
                        </BaseSelectItem>
                      );
                    })}
                  </BaseSelect>
                </div>
                <div>
                  <BaseLabel>To Location *</BaseLabel>
                  <BaseSelect
                    value={toLocationId}
                    onValueChange={setToLocationId}
                  >
                    <BaseSelectItem value="">Select destination</BaseSelectItem>
                    {activeLocations.filter(loc => loc.id !== fromLocationId).map(loc => {
                      const qty = getLocationStock(loc.id);
                      return (
                        <BaseSelectItem key={loc.id} value={loc.id}>
                          {loc.name} ({qty} in stock)
                        </BaseSelectItem>
                      );
                    })}
                  </BaseSelect>
                </div>
              </div>
              
              <div>
                <BaseLabel>Quantity *</BaseLabel>
                <BaseInput
                  type="number"
                  min={1}
                  max={fromLocationId ? getLocationStock(fromLocationId) || 999 : 999}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                {fromLocationId && quantity > getLocationStock(fromLocationId) && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Quantity exceeds available stock at source location ({getLocationStock(fromLocationId)} available)
                  </p>
                )}
              </div>
              
              <div>
                <BaseLabel>Notes (Optional)</BaseLabel>
                <BaseInput
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Transfer reason or notes..."
                />
              </div>
              
              <BaseButton
                className="w-full"
                onClick={handleCreateTransfer}
                disabled={
                  !selectedItemId || 
                  !fromLocationId || 
                  !toLocationId || 
                  quantity <= 0 ||
                  (fromLocationId && quantity > getLocationStock(fromLocationId))
                }
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Create Transfer Request
              </BaseButton>
              
              {activeLocations.length < 2 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Multiple locations required</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need at least 2 active locations to create stock transfers. 
                    Add locations in Staff settings.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {pendingTransfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4 opacity-50" />
                  <p>No pending transfers</p>
                </div>
              ) : (
                pendingTransfers.map(transfer => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {allTransfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ArrowRightLeft className="h-12 w-12 mb-4 opacity-50" />
                  <p>No transfer history</p>
                </div>
              ) : (
                allTransfers.map(transfer => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </BaseDrawer>
  );
}

export default StockTransferDrawer;
