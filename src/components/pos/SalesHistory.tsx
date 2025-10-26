import { useState, useMemo } from 'react';
import { BaseCard } from '@/components/base/BaseCard';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseDatePicker } from '@/components/base/BaseDatePicker';
import { BaseTable, createColumn } from '@/components/base/BaseTable';
import { Search, Filter, Eye, Calendar, DollarSign, TrendingUp, Receipt } from 'lucide-react';
import { Sale, SaleFilters } from '@/types/checkout';
import { useSalesStore } from '@/stores/salesStore';
import { format } from 'date-fns';

interface SalesHistoryProps {
  onViewDetails: (sale: Sale) => void;
}

export function SalesHistory({ onViewDetails }: SalesHistoryProps) {
  const { sales, getSalesHistory, getTotalRevenue, getSalesCount, getAverageTicket } = useSalesStore();
  
  const [filters, setFilters] = useState<SaleFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Quick date filters
  const setQuickDateFilter = (days?: number) => {
    if (days === undefined) {
      // Clear date filters
      setFilters((prev) => {
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    } else {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      setFilters((prev) => ({
        ...prev,
        startDate,
        endDate,
      }));
    }
  };

  // Apply filters
  const filteredSales = useMemo(() => {
    const currentFilters = { ...filters };
    if (searchTerm) {
      currentFilters.searchTerm = searchTerm;
    }
    return getSalesHistory(currentFilters);
  }, [sales, filters, searchTerm, getSalesHistory]);

  // Statistics
  const stats = useMemo(() => {
    const currentFilters = { ...filters };
    if (searchTerm) {
      currentFilters.searchTerm = searchTerm;
    }
    
    return {
      totalRevenue: getTotalRevenue(currentFilters),
      salesCount: getSalesCount(currentFilters),
      averageTicket: getAverageTicket(currentFilters),
    };
  }, [filters, searchTerm, getTotalRevenue, getSalesCount, getAverageTicket]);

  const columns = [
    createColumn({
      id: 'transactionId',
      header: 'Transaction ID',
      cell: (sale: Sale) => (
        <span className="font-mono text-sm">{sale.transactionId}</span>
      ),
    }),
    createColumn({
      id: 'completedAt',
      header: 'Date & Time',
      cell: (sale: Sale) => (
        <div className="text-sm">
          <div className="font-medium">
            {format(new Date(sale.completedAt), 'MMM dd, yyyy')}
          </div>
          <div className="text-muted-foreground">
            {format(new Date(sale.completedAt), 'h:mm a')}
          </div>
        </div>
      ),
    }),
    createColumn({
      id: 'clientName',
      header: 'Client',
      cell: (sale: Sale) => (
        <span className="font-medium">{sale.clientName}</span>
      ),
    }),
    createColumn({
      id: 'items',
      header: 'Items',
      cell: (sale: Sale) => (
        <div className="text-sm">
          <div>{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</div>
          <div className="text-muted-foreground truncate max-w-[200px]">
            {sale.items.map((item) => item.name).join(', ')}
          </div>
        </div>
      ),
    }),
    createColumn({
      id: 'paymentMethods',
      header: 'Payment',
      cell: (sale: Sale) => (
        <div className="text-sm capitalize">
          {sale.paymentMethods.map((pm) => pm.type.replace('-', ' ')).join(', ')}
        </div>
      ),
    }),
    createColumn({
      id: 'total',
      header: 'Total',
      cell: (sale: Sale) => (
        <span className="font-bold">${sale.total.toFixed(2)}</span>
      ),
    }),
    createColumn({
      id: 'actions',
      header: 'Actions',
      cell: (sale: Sale) => (
        <BaseButton
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(sale)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </BaseButton>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{stats.salesCount}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Ticket</p>
                <p className="text-2xl font-bold">${stats.averageTicket.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      {/* Search and Filters */}
      <BaseCard>
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <BaseInput
                placeholder="Search by client name or transaction ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <BaseButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </BaseButton>
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap gap-2">
            <BaseButton
              variant={!filters.startDate ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDateFilter()}
            >
              All Time
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              onClick={() => setQuickDateFilter(0)}
            >
              Today
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              onClick={() => setQuickDateFilter(7)}
            >
              Last 7 Days
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              onClick={() => setQuickDateFilter(30)}
            >
              Last 30 Days
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              onClick={() => setQuickDateFilter(90)}
            >
              Last 90 Days
            </BaseButton>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <BaseLabel>Start Date</BaseLabel>
                <BaseDatePicker
                  selected={filters.startDate}
                  onSelect={(date) =>
                    setFilters((prev) => ({ ...prev, startDate: date }))
                  }
                  placeholder="Select start date"
                />
              </div>

              <div>
                <BaseLabel>End Date</BaseLabel>
                <BaseDatePicker
                  selected={filters.endDate}
                  onSelect={(date) =>
                    setFilters((prev) => ({ ...prev, endDate: date }))
                  }
                  placeholder="Select end date"
                />
              </div>

              <div>
                <BaseLabel>Payment Method</BaseLabel>
                <BaseSelect
                  value={filters.paymentMethod || ''}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      paymentMethod: value || undefined,
                    }))
                  }
                  placeholder="All methods"
                >
                  <BaseSelectItem value="">All Methods</BaseSelectItem>
                  <BaseSelectItem value="cash">Cash</BaseSelectItem>
                  <BaseSelectItem value="credit-card">Credit Card</BaseSelectItem>
                  <BaseSelectItem value="gift-card">Gift Card</BaseSelectItem>
                  <BaseSelectItem value="check">Check</BaseSelectItem>
                  <BaseSelectItem value="online">Online</BaseSelectItem>
                </BaseSelect>
              </div>

              <div className="flex items-end">
                <BaseButton
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilters({});
                    setSearchTerm('');
                  }}
                >
                  Clear All Filters
                </BaseButton>
              </div>
            </div>
          )}
        </div>
      </BaseCard>

      {/* Sales Table */}
      <BaseCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Sales History ({filteredSales.length})
            </h3>
          </div>

          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'No sales found matching your filters'
                  : 'No sales recorded yet'}
              </p>
            </div>
          ) : (
            <BaseTable
              data={filteredSales}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
              }}
            />
          )}
        </div>
      </BaseCard>
    </div>
  );
}

