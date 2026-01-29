import { useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { BaseCard, CardHeader, CardContent } from "@/components/base/BaseCard";
import { BaseBadge } from "@/components/base/BaseBadge";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseTable, createColumn } from "@/components/base/BaseTable";
import { useSalesReport, useAppointmentsReport } from "@/hooks/api/useReports";
import { useAppointments } from "@/hooks/api/useAppointments";
import { useSales } from "@/hooks/api/useSales";
import { useLowStockAlerts } from "@/hooks/api/useInventory";
import { format, startOfDay, endOfDay, startOfMonth } from "date-fns";

const getStatusBadge = (status: string) => {
  const variants = {
    confirmed: "secondary" as const,
    "checked-in": "warning" as const, 
    "in-progress": "success" as const,
  };
  return variants[status as keyof typeof variants] || "secondary" as const;
};

export function Dashboard() {
  const today = useMemo(() => {
    const now = new Date();
    return {
      start: startOfDay(now).toISOString(),
      end: endOfDay(now).toISOString(),
    };
  }, []);

  const monthStart = useMemo(() => startOfMonth(new Date()).toISOString(), []);

  // Reports for KPIs
  const { data: todaySalesReport, isLoading: isLoadingTodaySales } = useSalesReport({
    startDate: today.start,
    endDate: today.end,
  });

  const { data: mtdSalesReport, isLoading: isLoadingMTDSales } = useSalesReport({
    startDate: monthStart,
    endDate: today.end,
  });

  const { data: todayAppointmentsReport, isLoading: isLoadingTodayAppointments } = useAppointmentsReport({
    startDate: today.start,
    endDate: today.end,
  });

  // Today's schedule and recent sales
  const { data: todayAppointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    startDate: today.start,
    endDate: today.end,
    limit: 10,
  });

  const { data: recentSalesData, isLoading: isLoadingSales } = useSales({
    startDate: today.start,
    endDate: today.end,
    limit: 5,
  });

  // Low stock alerts
  const { data: lowStockData } = useLowStockAlerts();

  // Compute KPI values
  const kpiData = useMemo(() => {
    const todayAppointmentsCount = todayAppointmentsReport?.summary?.totalAppointments || 0;
    const todaySalesAmount = todaySalesReport?.summary?.totalRevenue || 0;
    const mtdSalesAmount = mtdSalesReport?.summary?.totalRevenue || 0;
    const noShowRate = todayAppointmentsReport?.summary?.noShowRate || 0;

    return [
      {
        title: "Today's Appointments",
        value: todayAppointmentsCount.toString(),
        change: "+8%", // TODO: Calculate from previous period when backend provides
        trend: "up" as const,
        isLoading: isLoadingTodayAppointments,
      },
      {
        title: "Today's Sales",
        value: `$${todaySalesAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        change: "+12%", // TODO: Calculate from previous period
        trend: "up" as const,
        isLoading: isLoadingTodaySales,
      },
      {
        title: "MTD Sales",
        value: `$${mtdSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        change: "+15%", // TODO: Calculate from previous period
        trend: "up" as const,
        isLoading: isLoadingMTDSales,
      },
      {
        title: "No-show Rate",
        value: `${noShowRate.toFixed(1)}%`,
        change: "-1%", // TODO: Calculate from previous period
        trend: "down" as const,
        isLoading: isLoadingTodayAppointments,
      },
    ];
  }, [
    todayAppointmentsReport,
    todaySalesReport,
    mtdSalesReport,
    isLoadingTodayAppointments,
    isLoadingTodaySales,
    isLoadingMTDSales,
  ]);

  // Format today's schedule
  // Note: Backend should return appointments with populated client/service/staff names
  // If not available, fallback to IDs or 'Unknown'
  const todaysSchedule = useMemo(() => {
    if (!todayAppointmentsData?.data) return [];
    return todayAppointmentsData.data
      .slice(0, 5)
      .map((apt: any) => ({
        time: format(new Date(apt.startTime), 'HH:mm'),
        client: apt.clientName || apt.client?.name || `Client ${apt.clientId?.slice(0, 8)}` || 'Unknown',
        service: apt.serviceNames?.join(', ') || apt.services?.map((s: any) => s.name).join(', ') || 'Unknown',
        staff: apt.staffName || apt.staff?.name || `Staff ${apt.staffId?.slice(0, 8)}` || 'Unknown',
        status: apt.status,
      }));
  }, [todayAppointmentsData]);

  // Format recent sales
  const recentSales = useMemo(() => {
    if (!recentSalesData?.data) return [];
    return recentSalesData.data.map((sale) => ({
      time: format(new Date(sale.completedAt), 'HH:mm'),
      client: sale.clientName,
      total: `$${sale.total.toFixed(2)}`,
      method: sale.paymentMethods?.[0]?.type?.replace('-', ' ') || 'Unknown',
    }));
  }, [recentSalesData]);

  // Low stock items
  const lowStockItems = useMemo(() => {
    if (!lowStockData?.alerts) return [];
    return lowStockData.alerts.slice(0, 3).map((alert) => alert.itemName);
  }, [lowStockData]);

  return (
    <Container className="py-4 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-heading font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <BaseCard key={index} variant="elevated" hover="lift">
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <div className="flex items-center justify-between">
                  {kpi.isLoading ? (
                    <p className="text-2xl font-heading font-semibold">...</p>
                  ) : (
                    <>
                      <p className="text-2xl font-heading font-semibold">{kpi.value}</p>
                      <BaseBadge
                        variant={kpi.trend === "up" ? "success" : "destructive"}
                        size="sm"
                      >
                        {kpi.change}
                      </BaseBadge>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </BaseCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Schedule & Recent Sales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <BaseCard>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold">Today's Schedule</h2>
                <BaseButton variant="secondary" size="sm">
                  View Calendar
                </BaseButton>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAppointments ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading schedule...
                </div>
              ) : todaysSchedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments scheduled for today
                </div>
              ) : (
                <BaseTable
                  data={todaysSchedule}
                  columns={[
                    createColumn('time', 'Time'),
                    createColumn('client', 'Client'),
                    createColumn('service', 'Service'),
                    createColumn('staff', 'Staff'),
                    createColumn('status', 'Status', {
                      render: (value) => (
                        <BaseBadge variant={getStatusBadge(value)} size="sm">
                          {value}
                        </BaseBadge>
                      )
                    })
                  ]}
                />
              )}
            </CardContent>
          </BaseCard>

          {/* Recent Sales */}
          <BaseCard>
            <CardHeader className="pb-4">
              <h2 className="text-xl font-heading font-semibold">Recent Sales</h2>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingSales ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading sales...
                </div>
              ) : recentSales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sales today
                </div>
              ) : (
                <BaseTable
                  data={recentSales}
                  columns={[
                    createColumn('time', 'Time'),
                    createColumn('client', 'Client'),
                    createColumn('total', 'Total'),
                    createColumn('method', 'Method')
                  ]}
                />
              )}
            </CardContent>
          </BaseCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Low Stock */}
          <BaseCard>
            <CardHeader className=" pb-4">
              <h2 className="text-xl font-heading font-semibold">Low Stock</h2>
            </CardHeader>
            <CardContent className=" pt-0 space-y-4">
              <div className="space-y-2">
                {lowStockItems.map((item, index) => (
                  <BaseBadge key={index} variant="warning" className="mr-2 mb-2">
                    {item}
                  </BaseBadge>
                ))}
              </div>
              <BaseButton variant="outline" size="sm" className="w-full">
                Create PO
              </BaseButton>
            </CardContent>
          </BaseCard>

          {/* Tasks - Placeholder */}
          <BaseCard>
            <CardHeader className="pb-4">
              <h2 className="text-xl font-heading font-semibold">Tasks</h2>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Order supplies</span>
                  <BaseBadge variant="outline" size="sm">Due today</BaseBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Review staff schedules</span>
                  <BaseBadge variant="outline" size="sm">Tomorrow</BaseBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Client follow-ups</span>
                  <BaseBadge variant="outline" size="sm">This week</BaseBadge>
                </div>
              </div>
            </CardContent>
          </BaseCard>
        </div>
      </div>
    </Container>
  );
}