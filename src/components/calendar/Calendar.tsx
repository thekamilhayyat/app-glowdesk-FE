import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarHeader } from './CalendarHeader';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { CalendarDropzone } from './CalendarDropzone';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { Appointment } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

interface CalendarProps {
  className?: string;
}

export function Calendar({ className }: CalendarProps) {
  const {
    currentView,
    currentDate,
    selectedStaffIds,
    appointments,
    staff,
    services,
    clients,
    setCurrentView,
    setCurrentDate,
    setSelectedStaffIds,
    navigatePrevious,
    navigateNext,
    goToToday,
    getAppointmentsForDay,
    getAppointmentsForWeek,
    getAppointmentsForMonth,
    updateAppointment,
    moveAppointment,
  } = useCalendarStore();

  const { startCheckout } = useCheckoutStore();
  const { toast } = useToast();

  const handleAppointmentCheckout = (appointment: Appointment) => {
    startCheckout(appointment);
  };

  const handleAppointmentEdit = (appointment: Appointment) => {
    // TODO: Open appointment edit dialog
    console.log('Edit appointment:', appointment);
  };

  const handleNewAppointment = () => {
    // TODO: Open new appointment dialog
    console.log('New appointment');
  };

  const handleTimeSlotClick = (time: Date, staffId: string) => {
    // TODO: Open new appointment dialog with pre-filled time and staff
    console.log('Time slot clicked:', time, staffId);
  };

  const handleAppointmentMove = (appointmentId: string, newStartTime: Date, newStaffId?: string) => {
    const result = moveAppointment(appointmentId, newStartTime, newStaffId);
    if (!result.ok) {
      toast({
        title: "Cannot Move Appointment",
        description: result.message || "This time slot conflicts with another appointment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Appointment Moved",
        description: "The appointment has been successfully moved",
      });
    }
    return result;
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };

  const renderCalendarView = () => {
    const commonProps = {
      date: currentDate,
      appointments,
      staff,
      clients,
      services,
      selectedStaffIds,
      onAppointmentCheckout: handleAppointmentCheckout,
      onAppointmentEdit: handleAppointmentEdit,
      onAppointmentMove: handleAppointmentMove,
    };

    switch (currentView) {
      case 'day':
        return (
          <DayView
            {...commonProps}
            onTimeSlotClick={handleTimeSlotClick}
          />
        );
      case 'week':
        return (
          <WeekView
            {...commonProps}
            onDayClick={handleDayClick}
          />
        );
      case 'month':
        return (
          <MonthView
            {...commonProps}
            onDayClick={handleDayClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={className} data-testid="calendar-container">
      <CalendarHeader
        currentView={currentView}
        currentDate={currentDate}
        selectedStaffIds={selectedStaffIds}
        staff={staff}
        onViewChange={setCurrentView}
        onDateChange={setCurrentDate}
        onStaffFilter={setSelectedStaffIds}
        onPrevious={navigatePrevious}
        onNext={navigateNext}
        onToday={goToToday}
        onNewAppointment={handleNewAppointment}
      />
      
      <CalendarDropzone onAppointmentMove={handleAppointmentMove}>
        <div className="flex-1 overflow-hidden">
          {renderCalendarView()}
        </div>
      </CalendarDropzone>
    </div>
  );
}