import React, { useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem } from '@/types/inventory';
import { toast } from 'sonner';
import { 
  Calendar, 
  AlertTriangle, 
  Package, 
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { format, differenceInDays, isPast, addDays } from 'date-fns';

interface ExpirationAlertsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjustStock?: (item: InventoryItem) => void;
}

interface ExpirationCategory {
  label: string;
  items: InventoryItem[];
  variant: 'destructive' | 'secondary' | 'outline';
  icon: React.ReactNode;
}

export const ExpirationAlertsDrawer: React.FC<ExpirationAlertsDrawerProps> = ({
  open,
  onOpenChange,
  onAdjustStock,
}) => {
  const { items, adjustStock } = useInventoryStore();

  const { expired, expiringSoon, expiringLater, totalWithExpiration } = useMemo(() => {
    const itemsWithExpiration = items.filter(item => item.expirationDate && item.currentStock > 0);
    const today = new Date();
    const in30Days = addDays(today, 30);
    const in90Days = addDays(today, 90);

    const expired: InventoryItem[] = [];
    const expiringSoon: InventoryItem[] = [];
    const expiringLater: InventoryItem[] = [];

    itemsWithExpiration.forEach(item => {
      const expDate = new Date(item.expirationDate!);
      
      if (isPast(expDate)) {
        expired.push(item);
      } else if (expDate <= in30Days) {
        expiringSoon.push(item);
      } else if (expDate <= in90Days) {
        expiringLater.push(item);
      }
    });

    expired.sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime());
    expiringSoon.sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime());
    expiringLater.sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime());

    return {
      expired,
      expiringSoon,
      expiringLater,
      totalWithExpiration: itemsWithExpiration.length
    };
  }, [items]);

  const handleMarkAsExpired = (item: InventoryItem) => {
    adjustStock(item.id, -item.currentStock, 'expired', 'Marked as expired from Expiration Alerts');
    toast.success(`${item.name} marked as expired and removed from stock`);
  };

  const getDaysUntilExpiration = (dateStr: string) => {
    const expDate = new Date(dateStr);
    const days = differenceInDays(expDate, new Date());
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const categories: ExpirationCategory[] = [
    {
      label: 'Expired',
      items: expired,
      variant: 'destructive',
      icon: <XCircle className="h-5 w-5 text-red-500" />
    },
    {
      label: 'Expiring Within 30 Days',
      items: expiringSoon,
      variant: 'secondary',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
    },
    {
      label: 'Expiring Within 90 Days',
      items: expiringLater,
      variant: 'outline',
      icon: <Clock className="h-5 w-5 text-blue-500" />
    }
  ];

  const totalAlerts = expired.length + expiringSoon.length;

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Expiration Alerts"
      width={600}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{expired.length}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Expired</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{expiringSoon.length}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">Within 30 Days</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{expiringLater.length}</p>
                <p className="text-sm text-blue-600 dark:text-blue-500">Within 90 Days</p>
              </div>
            </div>
          </div>
        </div>

        {totalAlerts === 0 && expiringLater.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No expiration alerts</p>
            <p className="text-sm">All products with expiration dates are fresh</p>
            {totalWithExpiration === 0 && (
              <p className="text-xs mt-2">
                Tip: Add expiration dates to your products to track them here
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto">
            {categories.map(category => {
              if (category.items.length === 0) return null;
              
              return (
                <div key={category.label}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    {category.icon}
                    {category.label} ({category.items.length})
                  </h4>
                  <div className="space-y-2">
                    {category.items.map(item => {
                      const isExpired = isPast(new Date(item.expirationDate!));
                      
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isExpired 
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                              : category.label.includes('30') 
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover border border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <h5 className="font-medium">{item.name}</h5>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>SKU: {item.sku}</span>
                                <span>Stock: {item.currentStock}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className={`text-sm font-medium ${
                                  isExpired ? 'text-red-600' : 'text-foreground'
                                }`}>
                                  {format(new Date(item.expirationDate!), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <p className={`text-xs ${
                                isExpired ? 'text-red-500' : 'text-muted-foreground'
                              }`}>
                                {getDaysUntilExpiration(item.expirationDate!)}
                              </p>
                            </div>
                            
                            <div className="flex gap-1">
                              {isExpired && (
                                <BaseButton
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleMarkAsExpired(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </BaseButton>
                              )}
                              {onAdjustStock && (
                                <BaseButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    onOpenChange(false);
                                    onAdjustStock(item);
                                  }}
                                >
                                  Adjust
                                </BaseButton>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            About Expiration Tracking
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Products with stock and expiration dates are monitored</li>
            <li>• Red: Already expired - remove from inventory</li>
            <li>• Yellow: Expiring within 30 days - use or discount</li>
            <li>• Blue: Expiring within 90 days - plan usage</li>
          </ul>
        </div>
      </div>
    </BaseDrawer>
  );
};
