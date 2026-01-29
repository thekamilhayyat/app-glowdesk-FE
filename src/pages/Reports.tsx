/**
 * Reports Page
 * MVP Reports UI with date filters, metric cards, and charts
 */

import { useState, useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseDatePicker } from '@/components/base/BaseDatePicker';
import { BaseCard, CardHeader, CardContent } from '@/components/base/BaseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalesReport, useAppointmentsReport, useInventoryReport } from '@/hooks/api/useReports';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Format currency value
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get default date range (last 30 days)
 */
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = subDays(endDate, 30);
  return { startDate, endDate };
};

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
  className?: string;
}

function MetricCard({ title, value, isLoading, className }: MetricCardProps) {
  return (
    <BaseCard className={cn('h-full', className)}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </BaseCard>
  );
}

/**
 * Chart Card Component
 */
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

function ChartCard({ title, children, isLoading, error, className }: ChartCardProps) {
  return (
    <BaseCard className={cn('h-full', className)}>
      <CardHeader className="pb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : error ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 text-destructive" />
            <p className="text-sm">Failed to load chart data</p>
          </div>
        ) : (
          <div className="h-[300px]">{children}</div>
        )}
      </CardContent>
    </BaseCard>
  );
}

/**
 * Chart colors
 */
const CHART_COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.error];

export function Reports() {
  // Date range state
  const defaultRange = getDefaultDateRange();
  const [dateRange, setDateRange] = useState(defaultRange);
  const [appliedFilters, setAppliedFilters] = useState<{ startDate: string; endDate: string } | null>(() => {
    // Initialize with default date range
    return {
      startDate: formatDateForAPI(defaultRange.startDate),
      endDate: formatDateForAPI(defaultRange.endDate),
    };
  });

  // Format dates for API
  const apiFilters = useMemo(() => {
    if (!appliedFilters) return undefined;
    return {
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
    };
  }, [appliedFilters]);

  // Fetch reports
  const {
    data: salesData,
    isLoading: isLoadingSales,
    error: salesError,
  } = useSalesReport(apiFilters);

  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useAppointmentsReport(apiFilters);

  const {
    data: inventoryData,
    isLoading: isLoadingInventory,
    error: inventoryError,
  } = useInventoryReport();

  /**
   * Handle Apply button click
   */
  const handleApply = () => {
    setAppliedFilters({
      startDate: formatDateForAPI(dateRange.startDate),
      endDate: formatDateForAPI(dateRange.endDate),
    });
  };

  /**
   * Check if all values are zero (empty state)
   */
  const hasNoData = useMemo(() => {
    if (!salesData && !appointmentsData && !inventoryData) return true;
    
    const salesEmpty = salesData
      ? salesData.totalRevenue === 0 && salesData.totalTransactions === 0 && salesData.averageTicket === 0
      : false;
    
    const appointmentsEmpty = appointmentsData
      ? appointmentsData.total === 0 &&
        appointmentsData.completed === 0 &&
        appointmentsData.cancelled === 0 &&
        appointmentsData.noShow === 0
      : false;
    
    const inventoryEmpty = inventoryData
      ? inventoryData.lowStock === 0 &&
        inventoryData.outOfStock === 0 &&
        inventoryData.totalProducts === 0
      : false;

    return salesEmpty && appointmentsEmpty && inventoryEmpty;
  }, [salesData, appointmentsData, inventoryData]);

  /**
   * Prepare chart data
   */
  const revenueChartData = useMemo(() => {
    // For MVP, we'll create a simple trend based on the date range
    // In a real implementation, this would come from the API
    if (!salesData || salesData.totalRevenue === 0) return [];
    
    const startDate = appliedFilters?.startDate || formatDateForAPI(dateRange.startDate);
    const endDate = appliedFilters?.endDate || formatDateForAPI(dateRange.endDate);
    
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    
    if (days <= 0) return [];
    
    // Simple distribution across days (limit to 30 days for performance)
    const chartDays = Math.min(days, 30);
    const dailyAverage = salesData.totalRevenue / days;
    
    // Use a seeded random-like distribution for consistency
    return Array.from({ length: chartDays }, (_, i) => {
      const dayIndex = chartDays - i - 1;
      const variance = 0.8 + (dayIndex % 5) * 0.08; // Deterministic variance
      return {
        date: format(subDays(new Date(endDate), dayIndex), 'MMM dd'),
        revenue: Math.round(dailyAverage * variance),
      };
    });
  }, [salesData, appliedFilters, dateRange]);

  const appointmentsChartData = useMemo(() => {
    if (!appointmentsData) return [];
    
    const { completed, cancelled, noShow } = appointmentsData;
    const total = completed + cancelled + noShow;
    
    if (total === 0) return [];
    
    return [
      { name: 'Completed', value: completed, fill: PIE_COLORS[1] },
      { name: 'Cancelled', value: cancelled, fill: PIE_COLORS[2] },
      { name: 'No Show', value: noShow, fill: PIE_COLORS[3] },
    ].filter((item) => item.value > 0);
  }, [appointmentsData]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      {/* Date Range Filter */}
      <BaseCard>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <BaseDatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(date) => setDateRange((prev) => ({ ...prev, startDate: date }))}
              />
            </div>
            <div className="flex-1">
              <BaseDatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(date) => setDateRange((prev) => ({ ...prev, endDate: date }))}
              />
            </div>
            <BaseButton onClick={handleApply} className="w-full sm:w-auto">
              Apply
            </BaseButton>
          </div>
        </CardContent>
      </BaseCard>

      {/* Error State */}
      {(salesError || appointmentsError || inventoryError) && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            {salesError?.message || appointmentsError?.message || inventoryError?.message || 'Failed to load reports'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingSales && !isLoadingAppointments && !isLoadingInventory && hasNoData && (
        <BaseCard>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No data available for the selected date range</p>
          </CardContent>
        </BaseCard>
      )}

      {/* Sales Overview Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Revenue"
            value={salesData ? formatCurrency(salesData.totalRevenue) : '$0.00'}
            isLoading={isLoadingSales}
          />
          <MetricCard
            title="Total Transactions"
            value={salesData?.totalTransactions ?? 0}
            isLoading={isLoadingSales}
          />
          <MetricCard
            title="Average Ticket"
            value={salesData ? formatCurrency(salesData.averageTicket) : '$0.00'}
            isLoading={isLoadingSales}
          />
        </div>
      </div>

      {/* Appointments Summary Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Appointments Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total"
            value={appointmentsData?.total ?? 0}
            isLoading={isLoadingAppointments}
          />
          <MetricCard
            title="Completed"
            value={appointmentsData?.completed ?? 0}
            isLoading={isLoadingAppointments}
          />
          <MetricCard
            title="Cancelled"
            value={appointmentsData?.cancelled ?? 0}
            isLoading={isLoadingAppointments}
          />
          <MetricCard
            title="No Show"
            value={appointmentsData?.noShow ?? 0}
            isLoading={isLoadingAppointments}
          />
        </div>
      </div>

      {/* Inventory Health Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Inventory Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Low Stock"
            value={inventoryData?.lowStock ?? 0}
            isLoading={isLoadingInventory}
          />
          <MetricCard
            title="Out of Stock"
            value={inventoryData?.outOfStock ?? 0}
            isLoading={isLoadingInventory}
          />
          <MetricCard
            title="Total Products"
            value={inventoryData?.totalProducts ?? 0}
            isLoading={isLoadingInventory}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <ChartCard
          title="Revenue Trend"
          isLoading={isLoadingSales}
          error={salesError}
        >
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill={CHART_COLORS.primary} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No revenue data available</p>
            </div>
          )}
        </ChartCard>

        {/* Appointment Breakdown Chart */}
        <ChartCard
          title="Appointment Breakdown"
          isLoading={isLoadingAppointments}
          error={appointmentsError}
        >
          {appointmentsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentsChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No appointment data available</p>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
