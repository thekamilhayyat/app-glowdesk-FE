import React, { useState, useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useServicesStore } from '@/stores/servicesStore';
import { useStaffStore } from '@/stores/staffStore';
import { ProductConsumptionLog } from '@/types/service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Package, DollarSign, Calendar, TrendingDown, AlertCircle } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfToday, endOfToday } from 'date-fns';

interface StaffConsumptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DateRange = 'today' | 'week' | 'month' | 'all';

export function StaffConsumptionDrawer({ open, onOpenChange }: StaffConsumptionDrawerProps) {
  const { consumptionLogs, getConsumptionLogsForStaff, services } = useServicesStore();
  const { staff } = useStaffStore();
  
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('month');

  const filteredLogs = useMemo(() => {
    let logs = selectedStaffId === 'all' 
      ? [...consumptionLogs]
      : [...getConsumptionLogsForStaff(selectedStaffId)];
    
    if (dateRange !== 'all') {
      const now = new Date();
      let start: Date;
      let end: Date;
      
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
        default:
          start = new Date(0);
          end = now;
      }
      
      logs = logs.filter(log => {
        const logDate = parseISO(log.consumedAt);
        return isWithinInterval(logDate, { start, end });
      });
    }
    
    return logs.sort((a, b) => 
      new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime()
    );
  }, [consumptionLogs, selectedStaffId, dateRange, getConsumptionLogsForStaff]);

  const staffStats = useMemo(() => {
    const stats: Record<string, { 
      totalCost: number; 
      servicesPerformed: number; 
      productsUsed: number;
      staffName: string;
    }> = {};
    
    filteredLogs.forEach(log => {
      if (!stats[log.staffId]) {
        stats[log.staffId] = {
          totalCost: 0,
          servicesPerformed: 0,
          productsUsed: 0,
          staffName: log.staffName,
        };
      }
      stats[log.staffId].totalCost += log.totalCost;
      stats[log.staffId].servicesPerformed += 1;
      stats[log.staffId].productsUsed += log.consumptions.reduce((sum, c) => sum + c.quantityUsed, 0);
    });
    
    return stats;
  }, [filteredLogs]);

  const totalCost = filteredLogs.reduce((sum, log) => sum + log.totalCost, 0);
  const totalServices = filteredLogs.length;

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Staff Product Consumption"
      width={700}
    >
      <div className="flex flex-col h-full">
        <p className="text-sm text-muted-foreground mb-4">
          Track product consumption by staff members during service performance. 
          Monitor costs and identify usage patterns.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <BaseLabel>Staff Member</BaseLabel>
            <BaseSelect
              value={selectedStaffId}
              onValueChange={setSelectedStaffId}
            >
              <BaseSelectItem value="all">All Staff</BaseSelectItem>
              {staff.filter(s => s.isActive).map((s) => (
                <BaseSelectItem key={s.id} value={s.id}>
                  {s.displayName}
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

        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">${totalCost.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalServices}</div>
            <div className="text-sm text-muted-foreground">Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Object.keys(staffStats).length}</div>
            <div className="text-sm text-muted-foreground">Staff Active</div>
          </div>
        </div>

        {selectedStaffId === 'all' && Object.keys(staffStats).length > 0 && (
          <div className="mb-4">
            <BaseLabel className="mb-2 block">Staff Summary</BaseLabel>
            <div className="grid gap-2">
              {Object.entries(staffStats)
                .sort((a, b) => b[1].totalCost - a[1].totalCost)
                .map(([staffId, stats]) => (
                  <div 
                    key={staffId} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => setSelectedStaffId(staffId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{stats.staffName}</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.servicesPerformed} services, {stats.productsUsed} products
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-primary">${stats.totalCost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">total cost</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <BaseLabel className="mb-2">Consumption History</BaseLabel>
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No consumption records found</p>
                <p className="text-sm">Product consumption will be logged when services are completed</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.serviceName}</span>
                        <BaseBadge variant="outline" size="sm">
                          {log.staffName}
                        </BaseBadge>
                      </div>
                      {log.clientName && (
                        <div className="text-sm text-muted-foreground">
                          Client: {log.clientName}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${log.totalCost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(log.consumedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-2 pt-2 border-t">
                    {log.consumptions.map((consumption, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span>{consumption.productName}</span>
                          <span className="text-muted-foreground">x{consumption.quantityUsed}</span>
                        </div>
                        <span className="text-muted-foreground">${consumption.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {log.notes && (
                    <div className="mt-2 text-sm text-muted-foreground italic">
                      Note: {log.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </BaseDrawer>
  );
}
