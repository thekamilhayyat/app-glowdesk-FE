import { Appointment, StaffMember, Client, Service } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';

interface MonthViewProps {
  date: Date;
  appointments: Appointment[];
  staff: StaffMember[];
  clients: Client[];
  services: Service[];
  selectedStaffIds: string[];
  onDayClick?: (date: Date) => void;
  onAppointmentCheckout?: (appointment: Appointment) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
  className?: string;
}

export function MonthView({
  date,
  appointments,
  staff,
  clients,
  services,
  selectedStaffIds,
  onDayClick,
  onAppointmentCheckout,
  onAppointmentEdit,
  className,
}: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Generate all days in the calendar view (including prev/next month days)
  const calendarDays = [];
  let currentDay = calendarStart;
  while (currentDay <= calendarEnd) {
    calendarDays.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  // Filter appointments for the month view
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate >= calendarStart && aptDate <= calendarEnd;
  });

  // Group appointments by day
  const appointmentsByDay = calendarDays.reduce((acc, day) => {
    const dayKey = day.toDateString();
    acc[dayKey] = monthAppointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      const matchesDay = isSameDay(aptDate, day);
      const matchesStaff = selectedStaffIds.length === 0 || selectedStaffIds.includes(apt.staffId);
      return matchesDay && matchesStaff;
    });
    return acc;
  }, {} as Record<string, Appointment[]>);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('flex flex-col h-full', className)} data-testid="month-view">
      {/* Month header with day names */}
      <div className="grid grid-cols-7 border-b border-border bg-[hsl(var(--calendar-header-bg))]">
        {weekDays.map((dayName) => (
          <div
            key={dayName}
            className="p-3 md:p-4 lg:p-5 text-center text-sm md:text-base font-medium text-[hsl(var(--calendar-header-text))] border-r border-border last:border-r-0"
            data-testid={`month-header-${dayName.toLowerCase()}`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, date);
          const dayAppointments = appointmentsByDay[day.toDateString()] || [];
          const hasAppointments = dayAppointments.length > 0;

          return (
            <div
              key={day.toDateString()}
              className={cn(
                'border-r border-b border-border last:border-r-0 p-2 md:p-3 lg:p-4 cursor-pointer hover:bg-accent transition-colors min-h-[120px] md:min-h-[150px] lg:min-h-[180px] bg-card',
                !isCurrentMonth && 'opacity-50 bg-muted',
                isToday && 'bg-primary/10 ring-2 ring-primary/30',
                hasAppointments && 'bg-success/5'
              )}
              onClick={() => onDayClick?.(day)}
              data-testid={`month-day-${format(day, 'yyyy-MM-dd')}`}
            >
              {/* Day number */}
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  'text-sm font-medium text-foreground',
                  isToday && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center',
                  !isCurrentMonth && 'text-muted-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                
                {/* Appointment count badge */}
                {dayAppointments.length > 0 && (
                  <span 
                    className="text-xs bg-primary/20 text-primary px-1 rounded"
                    data-testid={`appointment-count-${format(day, 'yyyy-MM-dd')}`}
                  >
                    {dayAppointments.length}
                  </span>
                )}
              </div>

              {/* Appointment previews */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => {
                  const client = clients.find(c => c.id === appointment.clientId);
                  const appointmentStaff = staff.find(s => s.id === appointment.staffId);
                  const primaryService = services.find(s => appointment.serviceIds[0] === s.id);

                  if (!client || !appointmentStaff) return null;

                  return (
                    <div
                      key={appointment.id}
                      className={cn(
                        'text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow group',
                        'bg-background border border-border'
                      )}
                      style={{ borderLeftColor: appointmentStaff.color, borderLeftWidth: '3px' }}
                      data-testid={`month-appointment-${appointment.id}`}
                    >
                      <div 
                        className="font-medium truncate text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentEdit?.(appointment);
                        }}
                      >
                        {format(appointment.startTime, 'h:mm a')} - {client.firstName}
                      </div>
                      {primaryService && (
                        <div className="text-muted-foreground truncate flex justify-between items-center">
                          <span>{primaryService.name}</span>
                          {(['confirmed', 'checked-in', 'in-progress'].includes(appointment.status)) && (
                            <button
                              className="text-primary hover:text-primary-hover text-xs md:text-sm font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity px-1 py-1 rounded touch-manipulation"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAppointmentCheckout?.(appointment);
                              }}
                              data-testid={`checkout-${appointment.id}`}
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Show "+X more" if there are more appointments */}
                {dayAppointments.length > 3 && (
                  <div 
                    className="text-xs text-primary font-medium cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick?.(day);
                    }}
                    data-testid={`more-appointments-${format(day, 'yyyy-MM-dd')}`}
                  >
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}