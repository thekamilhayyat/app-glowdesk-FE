import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/ui/Container";
import { BaseButton } from "@/components/base/BaseButton";
import { IconPlus, IconCalendar, IconClock, IconUser, IconCash } from "@tabler/icons-react";

export function Appointments() {
  // Mock data for appointments
  const appointments = [
    {
      id: "1",
      clientName: "Sarah Johnson",
      service: "Haircut & Style",
      date: "2024-01-25",
      time: "10:00 AM",
      duration: "60 min",
      staff: "Emma Wilson",
      price: "$75",
      status: "confirmed"
    },
    {
      id: "2",
      clientName: "Mike Davis",
      service: "Hair Coloring",
      date: "2024-01-25",
      time: "2:00 PM",
      duration: "120 min",
      staff: "Lisa Chen",
      price: "$150",
      status: "confirmed"
    },
    {
      id: "3",
      clientName: "John Smith",
      service: "Manicure",
      date: "2024-01-26",
      time: "11:30 AM",
      duration: "30 min",
      staff: "Maria Garcia",
      price: "$30",
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <Container className="py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">Manage and schedule client appointments</p>
          </div>
          
          <BaseButton variant="gradient" className="gap-2">
            <IconPlus className="h-4 w-4" />
            New Appointment
          </BaseButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <IconCalendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-semibold text-foreground">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <IconClock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-semibold text-foreground">6</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <IconUser className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-foreground">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <IconCash className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-semibold text-foreground">$1,250</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
          </div>
          
          <div className="divide-y divide-border">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                      {appointment.clientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-foreground">{appointment.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconCalendar className="h-3 w-3" />
                          {appointment.date}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          {appointment.time} ({appointment.duration})
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconUser className="h-3 w-3" />
                          {appointment.staff}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">{appointment.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <BaseButton variant="outline" size="sm">
                      View Details
                    </BaseButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </AppLayout>
  );
} 