import React, { useState } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { useInventoryStore } from '@/stores/inventoryStore';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types/inventory';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ShoppingCart,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
} from 'lucide-react';

interface PurchaseOrdersListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOrder: () => void;
  onEditOrder: (order: PurchaseOrder) => void;
  onReceiveOrder: (order: PurchaseOrder) => void;
}

const statusConfig: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  pending: { label: 'Pending', variant: 'outline', icon: <Clock className="h-3 w-3" /> },
  ordered: { label: 'Ordered', variant: 'default', icon: <ShoppingCart className="h-3 w-3" /> },
  partially_received: { label: 'Partial', variant: 'outline', icon: <Truck className="h-3 w-3" /> },
  received: { label: 'Received', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

export const PurchaseOrdersListDrawer: React.FC<PurchaseOrdersListDrawerProps> = ({
  open,
  onOpenChange,
  onAddOrder,
  onEditOrder,
  onReceiveOrder,
}) => {
  const { purchaseOrders, deletePurchaseOrder, updatePurchaseOrder } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (order: PurchaseOrder) => {
    if (order.status === 'received' || order.status === 'partially_received') {
      toast.error('Cannot delete orders that have been received');
      return;
    }
    deletePurchaseOrder(order.id);
    toast.success('Purchase order deleted');
  };

  const handleMarkOrdered = (order: PurchaseOrder) => {
    updatePurchaseOrder(order.id, { status: 'ordered' });
    toast.success('Purchase order marked as ordered');
  };

  const handleCancel = (order: PurchaseOrder) => {
    updatePurchaseOrder(order.id, { status: 'cancelled' });
    toast.success('Purchase order cancelled');
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Purchase Orders"
      width={600}
      footer={
        <BaseButton
          variant="gradient"
          onClick={() => {
            onOpenChange(false);
            onAddOrder();
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <BaseInput
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <BaseSelect value={statusFilter} onValueChange={setStatusFilter}>
            <BaseSelectItem value="all">All Status</BaseSelectItem>
            <BaseSelectItem value="draft">Draft</BaseSelectItem>
            <BaseSelectItem value="pending">Pending</BaseSelectItem>
            <BaseSelectItem value="ordered">Ordered</BaseSelectItem>
            <BaseSelectItem value="partially_received">Partial</BaseSelectItem>
            <BaseSelectItem value="received">Received</BaseSelectItem>
            <BaseSelectItem value="cancelled">Cancelled</BaseSelectItem>
          </BaseSelect>
        </div>

        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No purchase orders found</p>
              <p className="text-sm">Create your first order to get started</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{order.orderNumber}</h4>
                        <BaseBadge variant={config.variant} className="flex items-center gap-1">
                          {config.icon}
                          {config.label}
                        </BaseBadge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{order.supplierName}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {order.items.length} items
                        </span>
                        <span>${order.total.toFixed(2)}</span>
                        <span>Ordered: {format(new Date(order.orderDate), 'MMM d, yyyy')}</span>
                        {order.expectedDeliveryDate && (
                          <span>Expected: {format(new Date(order.expectedDeliveryDate), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {(order.status === 'ordered' || order.status === 'partially_received') && (
                        <BaseButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onReceiveOrder(order);
                          }}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Receive
                        </BaseButton>
                      )}
                      {order.status === 'draft' && (
                        <BaseButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkOrdered(order)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Order
                        </BaseButton>
                      )}
                      {(order.status === 'draft' || order.status === 'pending') && (
                        <>
                          <BaseButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onOpenChange(false);
                              onEditOrder(order);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </BaseButton>
                          <BaseButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(order)}
                            className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </BaseButton>
                          <BaseButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(order)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </BaseButton>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </BaseDrawer>
  );
};
