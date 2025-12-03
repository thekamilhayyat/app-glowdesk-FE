import React, { useState, useEffect } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseCard, CardContent } from '@/components/base/BaseCard';
import { BaseBadge } from '@/components/base/BaseBadge';
import { Clock, Play, Pause, Coffee, LogOut, Timer } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useStaffStore } from '@/stores/staffStore';
import type { StaffMember, TimeEntry } from '@/types/staff';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';

interface TimeClockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember;
}

export const TimeClockDrawer: React.FC<TimeClockDrawerProps> = ({
  open,
  onOpenChange,
  staffMember,
}) => {
  const { clockIn, clockOut, startBreak, endBreak, getActiveTimeEntry } = useStaffStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const activeEntry = getActiveTimeEntry(staffMember.id);
  const isOnBreak = activeEntry?.breaks?.some(b => !b.endTime);
  const currentBreak = activeEntry?.breaks?.find(b => !b.endTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (startTime: Date, endTime: Date = new Date()) => {
    const totalSeconds = differenceInSeconds(endTime, startTime);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTotalBreakMinutes = (entry: TimeEntry) => {
    if (!entry.breaks) return 0;
    return entry.breaks.reduce((total, breakEntry) => {
      if (breakEntry.endTime) {
        return total + differenceInMinutes(new Date(breakEntry.endTime), new Date(breakEntry.startTime));
      }
      return total;
    }, 0);
  };

  const handleClockIn = () => {
    clockIn(staffMember.id);
    toast.success(`${staffMember.firstName} clocked in at ${format(new Date(), 'h:mm a')}`);
  };

  const handleClockOut = () => {
    if (isOnBreak) {
      endBreak(staffMember.id);
    }
    clockOut(staffMember.id);
    toast.success(`${staffMember.firstName} clocked out at ${format(new Date(), 'h:mm a')}`);
  };

  const handleStartBreak = (type: 'paid' | 'unpaid') => {
    startBreak(staffMember.id, type);
    toast.success(`Break started (${type})`);
  };

  const handleEndBreak = () => {
    endBreak(staffMember.id);
    toast.success('Break ended');
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Time Clock"
      width={400}
    >
      <div className="space-y-6">
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">Current Time</p>
          <p className="text-4xl font-bold">{format(currentTime, 'h:mm:ss a')}</p>
          <p className="text-muted-foreground">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
        </div>

        <BaseCard>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {staffMember.firstName[0]}{staffMember.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{staffMember.firstName} {staffMember.lastName}</h3>
                <p className="text-sm text-muted-foreground">{staffMember.roleId}</p>
              </div>
            </div>

            {activeEntry ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <BaseBadge variant="default" className="mb-2">
                    {isOnBreak ? 'On Break' : 'Clocked In'}
                  </BaseBadge>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatDuration(new Date(activeEntry.clockIn))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Started at {format(new Date(activeEntry.clockIn), 'h:mm a')}
                  </p>
                </div>

                {activeEntry.breaks && activeEntry.breaks.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p>Total break time: {getTotalBreakMinutes(activeEntry)} minutes</p>
                  </div>
                )}

                {isOnBreak && currentBreak && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <Coffee className="h-4 w-4" />
                      <span className="font-medium">
                        Break: {formatDuration(new Date(currentBreak.startTime))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentBreak.type === 'paid' ? 'Paid' : 'Unpaid'} break
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {!isOnBreak ? (
                    <>
                      <BaseButton
                        variant="outline"
                        onClick={() => handleStartBreak('paid')}
                        className="w-full"
                      >
                        <Coffee className="h-4 w-4 mr-2" />
                        Paid Break
                      </BaseButton>
                      <BaseButton
                        variant="outline"
                        onClick={() => handleStartBreak('unpaid')}
                        className="w-full"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Unpaid Break
                      </BaseButton>
                    </>
                  ) : (
                    <BaseButton
                      variant="default"
                      onClick={handleEndBreak}
                      className="w-full col-span-2"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      End Break
                    </BaseButton>
                  )}
                </div>

                <BaseButton
                  variant="destructive"
                  onClick={handleClockOut}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Clock Out
                </BaseButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <Timer className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Not clocked in</p>
                </div>

                <BaseButton
                  variant="gradient"
                  onClick={handleClockIn}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Clock In
                </BaseButton>
              </div>
            )}
          </CardContent>
        </BaseCard>

        <div className="text-xs text-center text-muted-foreground">
          <p>All times are recorded in your local timezone</p>
        </div>
      </div>
    </BaseDrawer>
  );
};
