import { Container } from "@/components/ui/Container";
import { BaseCard, CardHeader, CardContent } from "@/components/base/BaseCard";
import { BaseBadge } from "@/components/base/BaseBadge";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseTable, createColumn } from "@/components/base/BaseTable";

// Mock data
const kpiData = [
  { title: "Today's Appointments", value: "12", change: "+8%", trend: "up" },
  { title: "Today's Sales", value: "$2,547", change: "+12%", trend: "up" },
  { title: "MTD Sales", value: "$45,892", change: "+15%", trend: "up" },
  { title: "No-show Rate", value: "4.2%", change: "-1%", trend: "down" },
];

const todaysSchedule = [
  { time: "09:00", client: "Sarah Johnson", service: "Hair Cut", staff: "Emma", status: "confirmed" },
  { time: "09:30", client: "Mike Davis", service: "Beard Trim", staff: "Jake", status: "checked-in" },
  { time: "10:00", client: "Lisa Chen", service: "Color & Style", staff: "Emma", status: "in-progress" },
  { time: "11:00", client: "John Smith", service: "Hair Cut", staff: "Alex", status: "confirmed" },
  { time: "11:30", client: "Maria Garcia", service: "Highlights", staff: "Emma", status: "confirmed" },
];

const recentSales = [
  { time: "14:30", client: "Sarah Johnson", total: "$85", method: "Card" },
  { time: "13:45", client: "Mike Davis", total: "$35", method: "Cash" },
  { time: "13:15", client: "Lisa Chen", total: "$145", method: "Card" },
  { time: "12:30", client: "Tom Wilson", total: "$65", method: "Card" },
];

const lowStockItems = [
  "Shampoo 250ml",
  "Hair Gel 150ml", 
  "Styling Cream",
];

const getStatusBadge = (status: string) => {
  const variants = {
    confirmed: "secondary" as const,
    "checked-in": "warning" as const, 
    "in-progress": "success" as const,
  };
  return variants[status as keyof typeof variants] || "secondary" as const;
};

export function Dashboard() {
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
            <CardContent >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-heading font-semibold">{kpi.value}</p>
                  <BaseBadge 
                    variant={kpi.trend === "up" ? "success" : "destructive"}
                    size="sm"
                  >
                    {kpi.change}
                  </BaseBadge>
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
            </CardContent>
          </BaseCard>

          {/* Recent Sales */}
          <BaseCard>
            <CardHeader className="pb-4">
              <h2 className="text-xl font-heading font-semibold">Recent Sales</h2>
            </CardHeader>
            <CardContent className="p-0">
              <BaseTable
                data={recentSales}
                columns={[
                  createColumn('time', 'Time'),
                  createColumn('client', 'Client'),
                  createColumn('total', 'Total'),
                  createColumn('method', 'Method')
                ]}
              />
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