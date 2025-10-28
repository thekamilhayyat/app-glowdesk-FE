import { Appointment } from '@/types/appointment';
import { StaffMember } from '@/types/staff';
import { Client } from '@/types/client';
import { Service } from '@/types/service';
import { AppointmentCard } from './AppointmentCard';
import { TimeGrid, TimeSlot } from './TimeGrid';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  staff: StaffMember[];
  clients: Client[];
  services: Service[];
  selectedStaffIds: string[];
  onAppointmentCheckout?: (appointment: Appointment) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
  onTimeSlotClick?: (time: Date, staffId: string) => void;
  className?: string;
}

export function DayView({
  date,
  appointments,
  staff,
  clients,
  services,
  selectedStaffIds,
  onAppointmentCheckout,
  onAppointmentEdit,
  onTimeSlotClick,
  className,
}: DayViewProps) {
  // Filter staff based on selection
  const displayStaff = staff.filter(s => 
    s.isActive && 
    (selectedStaffIds.length === 0 || selectedStaffIds.includes(s.id))
  );

  // Filter appointments for the current day
  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate.toDateString() === date.toDateString();
  });

  // Group appointments by staff
  const appointmentsByStaff = displayStaff.reduce((acc, staffMember) => {
    acc[staffMember.id] = dayAppointments.filter(apt => apt.staffId === staffMember.id);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Calculate position for appointments in the grid
  const getAppointmentPosition = (appointment: Appointment) => {
    const startHour = 9;
    const startTime = appointment.startTime;
    const minutesFromStart = (startTime.getHours() - startHour) * 60 + startTime.getMinutes();
    const duration = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60);
    
    return {
      top: (minutesFromStart / 30) * 80, // 80px per 30-minute slot
      height: (duration / 30) * 80,
    };
  };

  return (
    <div className={cn('flex flex-col h-full', className)} data-testid="day-view">
      {/* Staff header row */}
      <div className="flex border-b border-border bg-[hsl(var(--calendar-header-bg))]">
        <div className="w-20 md:w-24 lg:w-28 p-2 md:p-3 border-r border-border">
          <span className="text-sm md:text-base font-medium text-[hsl(var(--calendar-time-text))]">Time</span>
        </div>
        {displayStaff.map((staffMember) => (
          <div
            key={staffMember.id}
            className="flex-1 p-2 md:p-3 lg:p-4 border-r border-border last:border-r-0 text-center"
            style={{ borderLeftColor: staffMember.color, borderLeftWidth: '3px' }}
            data-testid={`staff-column-${staffMember.id}`}
          >
            <div className="font-medium text-sm md:text-base text-[hsl(var(--calendar-header-text))]">
              {staffMember.firstName} {staffMember.lastName}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {appointmentsByStaff[staffMember.id]?.length || 0} appointments
            </div>
          </div>
        ))}
      </div>

      {/* Time grid with appointments */}
      <div className="flex-1 overflow-auto">
        <div className="flex relative">
          {/* Time column */}
          <div className="w-20 md:w-24 lg:w-28 border-r border-border bg-[hsl(var(--calendar-time-bg))]">
            <TimeGrid startHour={9} endHour={18} intervalMinutes={30} />
          </div>
          
          {/* Staff columns */}
          <div className="flex flex-1">
            {displayStaff.map((staffMember, staffIndex) => (
              <div
                key={staffMember.id}
                className="flex-1 relative border-r border-border last:border-r-0 bg-card"
                data-testid={`staff-time-column-${staffMember.id}`}
                style={{ minHeight: '1440px' }} // 18 slots * 80px
              >
                {/* Time slots for drag and drop */}
                {Array.from({ length: 18 }, (_, slotIndex) => {
                  const hour = 9 + Math.floor(slotIndex / 2);
                  const minute = (slotIndex % 2) * 30;
                  return (
                    <div
                      key={`${hour}-${minute}`}
                      className="absolute w-full h-[80px] border-b border-[hsl(var(--calendar-grid-border))]"
                      style={{ top: slotIndex * 80 }}
                    >
                      <TimeSlot
                        hour={hour}
                        minute={minute}
                        staffId={staffMember.id}
                        onSlotClick={(time) => onTimeSlotClick?.(time, staffMember.id)}
                      />
                    </div>
                  );
                })}

                {/* Appointments for this staff member */}
                {appointmentsByStaff[staffMember.id]?.map((appointment) => {
                  const client = clients.find(c => c.id === appointment.clientId);
                  const appointmentServices = services.filter(s => 
                    appointment.serviceIds.includes(s.id)
                  );
                  const position = getAppointmentPosition(appointment);

                  if (!client) return null;

                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-1 right-1 z-10"
                      style={{
                        top: position.top,
                        height: position.height,
                      }}
                      data-testid={`appointment-position-${appointment.id}`}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        client={client}
                        services={appointmentServices}
                        staff={staffMember}
                        onCheckout={() => onAppointmentCheckout?.(appointment)}
                        onEdit={() => onAppointmentEdit?.(appointment)}
                        className="h-full"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}