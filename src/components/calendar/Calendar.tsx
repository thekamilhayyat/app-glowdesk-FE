import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarHeader } from './CalendarHeader';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { CalendarDropzone } from './CalendarDropzone';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { Appointment } from '@/types/calendar';

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
  } = useCalendarStore();

  const { startCheckout } = useCheckoutStore();

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
            onAppointmentClick={handleAppointmentEdit}
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
      
      <CalendarDropzone>
        <div className="flex-1 overflow-hidden">
          {renderCalendarView()}
        </div>
      </CalendarDropzone>
    </div>
  );
}