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
import { useSales } from '@/hooks/api/useSales';
import { useSalesReport } from '@/hooks/api/useReports';
import { format } from 'date-fns';

interface SalesHistoryProps {
  onViewDetails: (sale: Sale) => void;
}

export function SalesHistory({ onViewDetails }: SalesHistoryProps) {
  const [filters, setFilters] = useState<SaleFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Convert Date filters to ISO strings for API
  const reportFilters = useMemo(() => {
    const apiFilters: { startDate?: string; endDate?: string; staffId?: string } = {};
    if (filters.startDate) {
      apiFilters.startDate = filters.startDate instanceof Date 
        ? filters.startDate.toISOString() 
        : filters.startDate;
    }
    if (filters.endDate) {
      apiFilters.endDate = filters.endDate instanceof Date 
        ? filters.endDate.toISOString() 
        : filters.endDate;
    }
    if (filters.staffId) {
      apiFilters.staffId = filters.staffId;
    }
    return apiFilters;
  }, [filters]);

  // Fetch sales data and report
  const { data: salesData, isLoading: isLoadingSales } = useSales({
    ...filters,
    startDate: filters.startDate instanceof Date ? filters.startDate.toISOString() : filters.startDate,
    endDate: filters.endDate instanceof Date ? filters.endDate.toISOString() : filters.endDate,
    searchTerm,
  });

  const { data: salesReport, isLoading: isLoadingReport } = useSalesReport(reportFilters);

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
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }));
    }
  };

  // Apply client-side search filter to sales data
  const filteredSales = useMemo(() => {
    if (!salesData?.data) return [];
    let filtered = [...salesData.data];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.clientName.toLowerCase().includes(searchLower) ||
          sale.transactionId.toLowerCase().includes(searchLower)
      );
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter((sale) =>
        sale.paymentMethods.some((method) => method.type === filters.paymentMethod)
      );
    }

    return filtered;
  }, [salesData, filters, searchTerm]);

  // Statistics from report (preferred) or computed from filtered sales
  const stats = useMemo(() => {
    if (salesReport?.summary) {
      return {
        totalRevenue: salesReport.summary.totalRevenue || 0,
        salesCount: salesReport.summary.totalTransactions || 0,
        averageTicket: salesReport.summary.averageTicket || 0,
      };
    }

    // Fallback: compute from filtered sales if report not available
    const completedSales = filteredSales.filter((s) => s.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
    const salesCount = completedSales.length;
    const averageTicket = salesCount > 0 ? totalRevenue / salesCount : 0;

    return {
      totalRevenue,
      salesCount,
      averageTicket,
    };
  }, [salesReport, filteredSales]);

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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              {isLoadingReport ? (
                <p className="text-2xl font-bold">...</p>
              ) : (
                <p className="text-2xl font-bold">${Number(stats.totalRevenue).toFixed(2)}</p>
              )}
            </div>
            <div className="h-12 w-12 bg-success/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              {isLoadingReport ? (
                <p className="text-2xl font-bold">...</p>
              ) : (
                <p className="text-2xl font-bold">{Number(stats.salesCount)}</p>
              )}
            </div>
            <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Ticket</p>
              {isLoadingReport ? (
                <p className="text-2xl font-bold">...</p>
              ) : (
                <p className="text-2xl font-bold">${Number(stats.averageTicket).toFixed(2)}</p>
              )}
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </BaseCard>
      </div>

      {/* Search and Filters */}
      <BaseCard>
        <div className="space-y-4">
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
                  selected={filters.startDate instanceof Date ? filters.startDate : filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(date) =>
                    setFilters((prev) => ({ ...prev, startDate: date ? date.toISOString() : undefined }))
                  }
                  placeholder="Select start date"
                />
              </div>

              <div>
                <BaseLabel>End Date</BaseLabel>
                <BaseDatePicker
                  selected={filters.endDate instanceof Date ? filters.endDate : filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(date) =>
                    setFilters((prev) => ({ ...prev, endDate: date ? date.toISOString() : undefined }))
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Sales History ({filteredSales.length})
          </h3>
        </div>

        {isLoadingSales ? (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
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
              currentPage: salesData?.pagination?.page || 1,
              itemsPerPage: salesData?.pagination?.limit || 10,
              totalItems: salesData?.pagination?.total || filteredSales.length,
            }}
          />
        )}
      </BaseCard>
    </div>
  );
}

