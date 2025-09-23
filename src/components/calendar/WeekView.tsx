import { Appointment, StaffMember, Client, Service } from '@/types/calendar';
import { AppointmentCard } from './AppointmentCard';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface WeekViewProps {
  date: Date;
  appointments: Appointment[];
  staff: StaffMember[];
  clients: Client[];
  services: Service[];
  selectedStaffIds: string[];
  onAppointmentCheckout?: (appointment: Appointment) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
  onDayClick?: (date: Date) => void;
  className?: string;
}

export function WeekView({
  date,
  appointments,
  staff,
  clients,
  services,
  selectedStaffIds,
  onAppointmentCheckout,
  onAppointmentEdit,
  onDayClick,
  className,
}: WeekViewProps) {
  const weekStart = startOfWeek(date);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // If staff is filtered, show only selected staff member's week
  // Otherwise show all active staff
  const displayStaff = staff.filter(s => 
    s.isActive && 
    (selectedStaffIds.length === 0 || selectedStaffIds.includes(s.id))
  );

  // For week view, typically show one staff member at a time if filtered
  const currentStaff = selectedStaffIds.length === 1 
    ? staff.find(s => s.id === selectedStaffIds[0])
    : displayStaff[0]; // Default to first staff if none selected

  // Filter appointments for the current week and staff
  const weekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    const isInWeek = weekDays.some(day => isSameDay(aptDate, day));
    const matchesStaff = !currentStaff || apt.staffId === currentStaff.id;
    return isInWeek && matchesStaff;
  });

  // Group appointments by day
  const appointmentsByDay = weekDays.reduce((acc, day) => {
    acc[day.toDateString()] = weekAppointments.filter(apt => 
      isSameDay(new Date(apt.startTime), day)
    );
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className={cn('flex flex-col h-full', className)} data-testid="week-view">
      {/* Staff selector if multiple staff */}
      {displayStaff.length > 1 && (
        <div className="p-4 border-b bg-gray-50">
          <span className="text-sm font-medium text-gray-600 mr-2">Viewing:</span>
          <select 
            className="text-sm border rounded px-2 py-1"
            value={currentStaff?.id || ''}
            onChange={(e) => {
              // This would typically update the staff filter
              console.log('Switch to staff:', e.target.value);
            }}
            data-testid="staff-selector"
          >
            {displayStaff.map(staffMember => (
              <option key={staffMember.id} value={staffMember.id}>
                {staffMember.firstName} {staffMember.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Week header with days */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          const dayAppointments = appointmentsByDay[day.toDateString()] || [];
          
          return (
            <div
              key={day.toDateString()}
              className={cn(
                'p-3 md:p-4 lg:p-5 border-r last:border-r-0 cursor-pointer hover:bg-gray-100 transition-colors',
                isToday && 'bg-blue-50 border-blue-200'
              )}
              onClick={() => onDayClick?.(day)}
              data-testid={`week-day-${format(day, 'yyyy-MM-dd')}`}
            >
              <div className="text-center">
                <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide">
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  'text-lg md:text-xl lg:text-2xl font-semibold mt-1',
                  isToday && 'text-blue-600'
                )}>
                  {format(day, 'd')}
                </div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">
                  {dayAppointments.length} apt{dayAppointments.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week content with appointments */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 h-full">
          {weekDays.map((day) => {
            const dayAppointments = appointmentsByDay[day.toDateString()] || [];
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toDateString()}
                className={cn(
                  'border-r last:border-r-0 p-2 space-y-1',
                  isToday && 'bg-blue-50/30'
                )}
                data-testid={`week-day-content-${format(day, 'yyyy-MM-dd')}`}
              >
                {dayAppointments.map((appointment) => {
                  const client = clients.find(c => c.id === appointment.clientId);
                  const appointmentServices = services.filter(s => 
                    appointment.serviceIds.includes(s.id)
                  );
                  const appointmentStaff = staff.find(s => s.id === appointment.staffId);

                  if (!client || !appointmentStaff) return null;

                  return (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      client={client}
                      services={appointmentServices}
                      staff={appointmentStaff}
                      onCheckout={() => onAppointmentCheckout?.(appointment)}
                      onEdit={() => onAppointmentEdit?.(appointment)}
                      className="text-xs"
                    />
                  );
                })}
                
                {/* Empty state for days with no appointments */}
                {dayAppointments.length === 0 && (
                  <div 
                    className="text-center text-gray-400 text-xs py-4 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={() => onDayClick?.(day)}
                    data-testid={`empty-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    No appointments
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}