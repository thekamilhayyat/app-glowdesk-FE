/**
 * Date & Time Selection Component
 * Step 2: Select date and time slot
 */

import { useState } from 'react';
import { usePublicAvailability, usePublicAvailabilityCalendar } from '@/hooks/api/public/usePublicAvailability';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DateTimeSelectionProps {
  salonId: string | null;
  serviceId: string;
  onSelect: (date: string, timeSlot: { startTime: string; endTime: string }) => void;
}

export const DateTimeSelection = ({ salonId, serviceId, onSelect }: DateTimeSelectionProps) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(format(today, 'yyyy-MM-dd'));
  
  // Get availability for selected date
  const { data: availability, isLoading: isLoadingAvailability } = usePublicAvailability(
    salonId && serviceId && selectedDate
      ? { salonId, serviceId, date: selectedDate }
      : null
  );

  // Get calendar view (next 30 days)
  const { data: calendarData } = usePublicAvailabilityCalendar(
    salonId,
    serviceId,
    format(today, 'yyyy-MM-dd'),
    30
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (slot: { startTime: string; endTime: string }) => {
    if (slot.available) {
      onSelect(selectedDate, slot);
    }
  };

  // Generate next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      hasAvailability: calendarData?.dates?.some(
        (d) => d.date === format(date, 'yyyy-MM-dd') && d.slots.some((s) => s.available)
      ),
    };
  });

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose an available date for your appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {availableDates.map(({ date, dateStr, hasAvailability }) => {
              const isSelected = dateStr === selectedDate;
              const isToday = isSameDay(date, today);
              const isPast = date < today;

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPast && hasAvailability && handleDateSelect(dateStr)}
                  disabled={isPast || !hasAvailability}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-lg border p-2 text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isPast
                        ? 'border-muted bg-muted text-muted-foreground cursor-not-allowed'
                        : hasAvailability
                          ? 'border-border hover:border-primary hover:bg-accent cursor-pointer'
                          : 'border-muted bg-muted text-muted-foreground cursor-not-allowed',
                    isToday && !isSelected && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  <span className="text-xs font-medium">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-lg font-semibold">
                    {format(date, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Time</CardTitle>
          <CardDescription>
            Available time slots for {selectedDate && format(parseISO(`${selectedDate}T00:00:00`), 'EEEE, MMMM d')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAvailability ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !availability || availability.slots.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CalendarIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No available time slots for this date</p>
              <p className="text-sm">Please select another date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {availability.slots.map((slot, index) => {
                const startTime = parseISO(slot.startTime);
                const timeStr = format(startTime, 'h:mm a');

                return (
                  <Button
                    key={index}
                    variant={slot.available ? 'outline' : 'ghost'}
                    disabled={!slot.available}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className={cn(
                      'h-12',
                      slot.available && 'hover:border-primary hover:bg-accent'
                    )}
                  >
                    {timeStr}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
