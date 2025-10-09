import { useState } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarHeader } from './CalendarHeader';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { CalendarDropzone } from './CalendarDropzone';
import { AppointmentDialog } from './AppointmentDialog';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { Appointment } from '@/types/appointment';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [prefillData, setPrefillData] = useState<{ date?: Date; time?: string; staffId?: string } | undefined>();

  const handleAppointmentCheckout = (appointment: Appointment) => {
    startCheckout(appointment);
  };

  const handleAppointmentEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDialogMode('edit');
    setPrefillData(undefined);
    setDialogOpen(true);
  };

  const handleNewAppointment = () => {
    const now = new Date();
    const roundedMinutes = Math.ceil(now.getMinutes() / 30) * 30;
    const roundedTime = new Date(now);
    roundedTime.setMinutes(roundedMinutes, 0, 0);
    
    setSelectedAppointment(undefined);
    setDialogMode('create');
    setPrefillData({
      date: roundedTime,
      time: roundedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    });
    setDialogOpen(true);
  };

  const handleTimeSlotClick = (time: Date, staffId: string) => {
    setSelectedAppointment(undefined);
    setDialogMode('create');
    setPrefillData({
      date: time,
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      staffId,
    });
    setDialogOpen(true);
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
    <div className={cn('bg-background', className)} data-testid="calendar-container">
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
        <div className="flex-1 overflow-hidden bg-background">
          {renderCalendarView()}
        </div>
      </CalendarDropzone>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        appointment={selectedAppointment}
        prefillData={prefillData}
      />
    </div>
  );
}