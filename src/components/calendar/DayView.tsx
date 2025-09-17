import { Appointment, StaffMember, Client, Service } from '@/types/calendar';
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
      top: (minutesFromStart / 30) * 60, // 60px per 30-minute slot
      height: (duration / 30) * 60,
    };
  };

  return (
    <div className={cn('flex flex-col h-full', className)} data-testid="day-view">
      {/* Staff header row */}
      <div className="flex border-b bg-gray-50">
        <div className="w-20 p-2 border-r">
          <span className="text-sm font-medium text-gray-600">Time</span>
        </div>
        {displayStaff.map((staffMember) => (
          <div
            key={staffMember.id}
            className="flex-1 p-2 border-r last:border-r-0 text-center"
            style={{ borderLeftColor: staffMember.color, borderLeftWidth: '3px' }}
            data-testid={`staff-column-${staffMember.id}`}
          >
            <div className="font-medium text-sm">
              {staffMember.firstName} {staffMember.lastName}
            </div>
            <div className="text-xs text-gray-500">
              {appointmentsByStaff[staffMember.id]?.length || 0} appointments
            </div>
          </div>
        ))}
      </div>

      {/* Time grid with appointments */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          <TimeGrid startHour={9} endHour={18} intervalMinutes={30}>
            {/* Staff columns */}
            <div className="flex absolute inset-0">
              {displayStaff.map((staffMember, staffIndex) => (
                <div
                  key={staffMember.id}
                  className="flex-1 relative border-r last:border-r-0"
                  data-testid={`staff-time-column-${staffMember.id}`}
                >
                  {/* Time slots for drag and drop */}
                  {Array.from({ length: 18 }, (_, slotIndex) => {
                    const hour = 9 + Math.floor(slotIndex / 2);
                    const minute = (slotIndex % 2) * 30;
                    return (
                      <div
                        key={`${hour}-${minute}`}
                        className="absolute w-full h-[60px] border-b border-gray-100"
                        style={{ top: slotIndex * 60 }}
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
          </TimeGrid>
        </div>
      </div>
    </div>
  );
}