import React from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useInventoryStore } from '@/stores/inventoryStore';
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  XCircle,
  BarChart3,
} from 'lucide-react';

interface InventoryReportsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InventoryReportsDrawer: React.FC<InventoryReportsDrawerProps> = ({
  open,
  onOpenChange,
}) => {
  const { 
    getInventoryStats, 
    getInventoryValue, 
    getTopSellingProducts,
    getLowStockItems,
    getOutOfStockItems,
    items
  } = useInventoryStore();

  const stats = getInventoryStats();
  const value = getInventoryValue();
  const topSelling = getTopSellingProducts(5);
  const lowStock = getLowStockItems();
  const outOfStock = getOutOfStockItems();

  const profitMargin = value.retailValue > 0 
    ? ((value.retailValue - value.costValue) / value.retailValue * 100).toFixed(1)
    : '0';

  const activeItems = items.filter((i) => i.status === 'active');
  const avgStockValue = activeItems.length > 0 
    ? value.costValue / activeItems.length 
    : 0;

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Inventory Reports"
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Total Inventory Value</span>
            </div>
            <p className="text-2xl font-bold">${value.costValue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              Retail: ${value.retailValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Profit Margin</span>
            </div>
            <p className="text-2xl font-bold">{profitMargin}%</p>
            <p className="text-sm text-muted-foreground">
              Potential: ${(value.retailValue - value.costValue).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold">{stats.totalProducts}</p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-xl font-bold">{stats.activeProducts}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-xl font-bold">{stats.lowStockCount}</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <p className="text-xl font-bold">{stats.outOfStockCount}</p>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </div>
        </div>

        {topSelling.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Top Selling Products
            </h4>
            <div className="space-y-2">
              {topSelling.map((product, index) => (
                <div
                  key={product.itemId}
                  className="flex items-center justify-between bg-card border border-border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{product.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantitySold} units sold
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">
                    ${product.revenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowStock.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alert
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {lowStock.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{item.currentStock} left</p>
                    <p className="text-xs text-muted-foreground">
                      Reorder: {item.reorderQuantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {outOfStock.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              Out of Stock
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {outOfStock.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                  </div>
                  <BaseBadge variant="destructive">Out of Stock</BaseBadge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg. Stock Value:</span>
              <span className="font-medium">${avgStockValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive Products:</span>
              <span className="font-medium">{stats.inactiveProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cost Value:</span>
              <span className="font-medium">${stats.totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Retail Value:</span>
              <span className="font-medium">${stats.totalRetailValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
};
