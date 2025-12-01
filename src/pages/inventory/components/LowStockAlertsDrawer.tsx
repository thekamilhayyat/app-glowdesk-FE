import React from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useInventoryStore } from '@/stores/inventoryStore';
import { LowStockAlert, InventoryItem } from '@/types/inventory';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  Check,
  XCircle,
} from 'lucide-react';

interface LowStockAlertsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePurchaseOrder: () => void;
  onAdjustStock: (item: InventoryItem) => void;
}

export const LowStockAlertsDrawer: React.FC<LowStockAlertsDrawerProps> = ({
  open,
  onOpenChange,
  onCreatePurchaseOrder,
  onAdjustStock,
}) => {
  const { 
    getActiveAlerts, 
    acknowledgeLowStockAlert, 
    getItemById,
    getLowStockItems,
    getOutOfStockItems
  } = useInventoryStore();

  const activeAlerts = getActiveAlerts();
  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();

  const handleAcknowledge = (alertId: string) => {
    acknowledgeLowStockAlert(alertId, 'current_user');
    toast.success('Alert acknowledged');
  };

  const handleAcknowledgeAll = () => {
    activeAlerts.forEach((alert) => {
      acknowledgeLowStockAlert(alert.id, 'current_user');
    });
    toast.success('All alerts acknowledged');
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Low Stock Alerts"
      width={600}
      footer={
        <div className="flex gap-2 w-full">
          <BaseButton
            variant="outline"
            onClick={handleAcknowledgeAll}
            className="flex-1"
            disabled={activeAlerts.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Acknowledge All
          </BaseButton>
          <BaseButton
            variant="gradient"
            onClick={() => {
              onOpenChange(false);
              onCreatePurchaseOrder();
            }}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Order
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">{lowStockItems.length}</p>
                <p className="text-sm text-yellow-600">Low Stock Items</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700">{outOfStockItems.length}</p>
                <p className="text-sm text-red-600">Out of Stock</p>
              </div>
            </div>
          </div>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active alerts</p>
            <p className="text-sm">All stock levels are healthy</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Active Alerts ({activeAlerts.length})</h4>
            {activeAlerts.map((alert) => {
              const item = getItemById(alert.itemId);
              
              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.severity === 'critical' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        alert.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {alert.severity === 'critical' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium">{alert.itemName}</h5>
                        <p className="text-sm text-muted-foreground">SKU: {alert.sku}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>
                            Current: <strong>{alert.currentStock}</strong>
                          </span>
                          <span>
                            Threshold: <strong>{alert.lowStockThreshold}</strong>
                          </span>
                          <span>
                            Reorder Qty: <strong>{alert.reorderQuantity}</strong>
                          </span>
                        </div>
                        {alert.supplierName && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Supplier: {alert.supplierName}
                          </p>
                        )}
                        <div className="mt-2">
                          <BaseBadge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity === 'critical' ? 'Out of Stock' : 'Low Stock'}
                          </BaseBadge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <Check className="h-4 w-4" />
                      </BaseButton>
                      {item && (
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onAdjustStock(item);
                          }}
                        >
                          <Package className="h-4 w-4" />
                        </BaseButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Items Needing Attention
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {[...outOfStockItems, ...lowStockItems].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-card border border-border rounded-lg p-3"
                >
                  <div>
                    <h5 className="font-medium text-sm">{item.name}</h5>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-medium ${item.currentStock <= 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                        {item.currentStock} in stock
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.lowStockThreshold}
                      </p>
                    </div>
                    <BaseButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onAdjustStock(item);
                      }}
                    >
                      Add Stock
                    </BaseButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseDrawer>
  );
};
