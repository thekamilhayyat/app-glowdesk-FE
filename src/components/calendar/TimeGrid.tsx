import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface TimeGridProps {
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
  children?: React.ReactNode;
  className?: string;
}

interface TimeSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  hour: number;
  minute: number;
  staffId?: string;
  onSlotClick?: (time: Date) => void;
  children?: React.ReactNode;
}

export function TimeGrid({ 
  startHour = 9, 
  endHour = 18, 
  intervalMinutes = 30,
  children,
  className 
}: TimeGridProps) {
  const timeSlots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      timeSlots.push({ hour, minute });
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {timeSlots.map(({ hour, minute }) => (
        <div
          key={`${hour}-${minute}`}
          className="border-b border-gray-100 min-h-[60px] p-2 text-sm text-gray-500"
          data-testid={`time-slot-${hour}-${minute}`}
        >
          {/* Time label */}
          <div>
            {hour === 12 ? '12' : hour > 12 ? hour - 12 : hour}:
            {minute.toString().padStart(2, '0')}
            {hour < 12 ? ' AM' : ' PM'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimeSlot({ 
  hour, 
  minute, 
  staffId, 
  onSlotClick, 
  children, 
  className 
}: TimeSlotProps) {
  const slotId = `slot-${hour}-${minute}${staffId ? `-${staffId}` : ''}`;
  
  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: slotId,
    data: {
      type: 'timeslot',
      hour,
      minute,
      staffId,
    },
  });

  const handleClick = () => {
    if (onSlotClick) {
      const slotTime = new Date();
      slotTime.setHours(hour, minute, 0, 0);
      onSlotClick(slotTime);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-full h-full p-1 hover:bg-gray-50 cursor-pointer transition-colors',
        isOver && 'bg-blue-50 border border-blue-200',
        className
      )}
      onClick={handleClick}
      data-testid={`time-slot-${slotId}`}
    >
      {children}
    </div>
  );
}