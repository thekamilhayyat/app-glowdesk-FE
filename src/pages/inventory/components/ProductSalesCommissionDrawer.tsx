import React, { useState, useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useSalesStore } from '@/stores/salesStore';
import { useStaffStore } from '@/stores/staffStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  Calendar,
  Percent,
  ShoppingBag
} from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfToday, endOfToday } from 'date-fns';

interface ProductSalesCommissionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DateRange = 'today' | 'week' | 'month' | 'all';

interface StaffProductSale {
  saleId: string;
  transactionId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalRevenue: number;
  commission: number;
  commissionRate: number;
  saleDate: Date;
  clientName: string;
}

interface StaffSalesData {
  staffId: string;
  staffName: string;
  productSales: StaffProductSale[];
  totalRevenue: number;
  totalCommission: number;
  productCount: number;
  uniqueSaleIds: Set<string>;
}

export function ProductSalesCommissionDrawer({ open, onOpenChange }: ProductSalesCommissionDrawerProps) {
  const { sales } = useSalesStore();
  const { staff, calculateCommission, getStaffById } = useStaffStore();
  const { items: inventoryItems } = useInventoryStore();
  
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('month');

  const staffSalesData = useMemo(() => {
    const staffMap = new Map<string, StaffSalesData>();
    
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    
    if (dateRange !== 'all') {
      switch (dateRange) {
        case 'today':
          start = startOfToday();
          end = endOfToday();
          break;
        case 'week':
          start = startOfWeek(now);
          end = endOfWeek(now);
          break;
        case 'month':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
      }
    }
    
    sales.forEach(sale => {
      if (sale.status !== 'completed') return;
      
      const saleDate = new Date(sale.completedAt);
      if (start && end && !isWithinInterval(saleDate, { start, end })) {
        return;
      }
      
      sale.items.forEach(item => {
        if (item.type !== 'product' || !item.staffId) return;
        
        if (selectedStaffId !== 'all' && item.staffId !== selectedStaffId) return;
        
        const staffMember = getStaffById(item.staffId);
        const staffName = staffMember?.displayName || staffMember?.firstName || 'Unknown Staff';
        
        if (!staffMap.has(item.staffId)) {
          staffMap.set(item.staffId, {
            staffId: item.staffId,
            staffName,
            productSales: [],
            totalRevenue: 0,
            totalCommission: 0,
            productCount: 0,
            uniqueSaleIds: new Set<string>(),
          });
        }
        
        const data = staffMap.get(item.staffId)!;
        const revenue = item.price * item.quantity;
        const commission = calculateCommission(item.staffId, revenue, 'product');
        const effectiveRate = revenue > 0 ? (commission / revenue) * 100 : 0;
        
        data.productSales.push({
          saleId: sale.id,
          transactionId: sale.transactionId,
          productId: item.productId || '',
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          totalRevenue: revenue,
          commission,
          commissionRate: effectiveRate,
          saleDate,
          clientName: sale.clientName,
        });
        
        data.totalRevenue += revenue;
        data.totalCommission += commission;
        data.productCount += item.quantity;
        data.uniqueSaleIds.add(sale.id);
      });
    });
    
    return Array.from(staffMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sales, selectedStaffId, dateRange, calculateCommission, getStaffById]);

  const totals = useMemo(() => {
    const allUniqueSaleIds = new Set<string>();
    let totalRevenue = 0;
    let totalCommission = 0;
    let totalProducts = 0;
    
    staffSalesData.forEach(data => {
      totalRevenue += data.totalRevenue;
      totalCommission += data.totalCommission;
      totalProducts += data.productCount;
      data.uniqueSaleIds.forEach(id => allUniqueSaleIds.add(id));
    });
    
    return {
      revenue: totalRevenue,
      commission: totalCommission,
      products: totalProducts,
      transactions: allUniqueSaleIds.size,
    };
  }, [staffSalesData]);

  const getProductImage = (productId: string) => {
    const product = inventoryItems.find(p => p.id === productId);
    return product?.imageUrl;
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Product Sales Commission"
      width={700}
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <BaseLabel>Staff Member</BaseLabel>
            <BaseSelect
              value={selectedStaffId}
              onValueChange={setSelectedStaffId}
            >
              <BaseSelectItem value="all">All Staff</BaseSelectItem>
              {staff.map(s => (
                <BaseSelectItem key={s.id} value={s.id}>
                  {s.displayName || `${s.firstName} ${s.lastName}`}
                </BaseSelectItem>
              ))}
            </BaseSelect>
          </div>
          <div>
            <BaseLabel>Date Range</BaseLabel>
            <BaseSelect
              value={dateRange}
              onValueChange={(v) => setDateRange(v as DateRange)}
            >
              <BaseSelectItem value="today">Today</BaseSelectItem>
              <BaseSelectItem value="week">This Week</BaseSelectItem>
              <BaseSelectItem value="month">This Month</BaseSelectItem>
              <BaseSelectItem value="all">All Time</BaseSelectItem>
            </BaseSelect>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </div>
            <div className="text-xl font-semibold">${totals.revenue.toFixed(2)}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Commission
            </div>
            <div className="text-xl font-semibold text-green-600">${totals.commission.toFixed(2)}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Package className="h-4 w-4" />
              Products Sold
            </div>
            <div className="text-xl font-semibold">{totals.products}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <ShoppingBag className="h-4 w-4" />
              Transactions
            </div>
            <div className="text-xl font-semibold">{totals.transactions}</div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {staffSalesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p>No product sales found for the selected period</p>
            </div>
          ) : (
            <div className="space-y-6">
              {staffSalesData.map(staffData => (
                <div key={staffData.staffId} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{staffData.staffName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {staffData.productCount} products sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Commission</div>
                      <div className="font-semibold text-green-600">
                        ${staffData.totalCommission.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {staffData.productSales.map((sale, index) => (
                      <div key={`${sale.saleId}-${index}`} className="px-4 py-3 flex items-center gap-4">
                        {getProductImage(sale.productId) ? (
                          <img 
                            src={getProductImage(sale.productId)} 
                            alt={sale.productName}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{sale.productName}</span>
                            <BaseBadge variant="secondary" className="text-xs">
                              x{sale.quantity}
                            </BaseBadge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{sale.clientName}</span>
                            <span>•</span>
                            <span>{format(sale.saleDate, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${sale.totalRevenue.toFixed(2)}</div>
                          <div className="text-sm text-green-600 flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            ${sale.commission.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-muted/50 px-4 py-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Staff Total</span>
                    <div className="flex items-center gap-4">
                      <span>Revenue: <strong>${staffData.totalRevenue.toFixed(2)}</strong></span>
                      <span className="text-green-600">Commission: <strong>${staffData.totalCommission.toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Commission rates are based on staff settings and commission plans</span>
            <BaseButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
}

export default ProductSalesCommissionDrawer;
