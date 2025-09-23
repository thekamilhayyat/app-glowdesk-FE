import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useCalendarStore } from '@/stores/calendarStore';
import { Appointment } from '@/types/calendar';

interface CalendarDropzoneProps {
  children: React.ReactNode;
  onAppointmentMove?: (appointmentId: string, newTime: Date, newStaffId?: string) => void;
}

export function CalendarDropzone({ children, onAppointmentMove }: CalendarDropzoneProps) {
  const { setDraggedAppointment, moveAppointment } = useCalendarStore();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'appointment') {
      const appointment = active.data.current.appointment as Appointment;
      setDraggedAppointment(appointment);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedAppointment(null);

    if (!over || !active.data.current?.appointment) {
      return;
    }

    const appointment = active.data.current.appointment as Appointment;
    const dropData = over.data.current;

    if (dropData?.type === 'timeslot') {
      const { hour, minute, staffId } = dropData;
      
      // Calculate new appointment time
      const currentDate = new Date(appointment.startTime);
      const newStartTime = new Date(currentDate);
      newStartTime.setHours(hour, minute, 0, 0);
      
      // Only move if the time or staff actually changed
      const timeDifferent = newStartTime.getTime() !== appointment.startTime.getTime();
      const staffDifferent = staffId && staffId !== appointment.staffId;
      
      if (timeDifferent || staffDifferent) {
        if (onAppointmentMove) {
          onAppointmentMove(appointment.id, newStartTime, staffId);
        } else {
          moveAppointment(appointment.id, newStartTime, staffId);
        }
      }
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}