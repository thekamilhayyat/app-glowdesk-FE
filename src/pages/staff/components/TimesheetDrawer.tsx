import React, { useState, useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseCard } from '@/components/base/BaseCard';
import { BaseBadge } from '@/components/base/BaseBadge';
import { Calendar, Clock, Coffee, DollarSign, FileCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useStaffStore } from '@/stores/staffStore';
import type { StaffMember } from '@/types/staff';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns';

interface TimesheetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember;
}

export const TimesheetDrawer: React.FC<TimesheetDrawerProps> = ({
  open,
  onOpenChange,
  staffMember,
}) => {
  const { generateTimesheet, approveTimesheet, timesheets, timeEntries } = useStaffStore();
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const staffTimesheet = useMemo(() => {
    return timesheets.find(
      ts => ts.staffId === staffMember.id &&
      format(new Date(ts.periodStart), 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd')
    );
  }, [timesheets, staffMember.id, weekStart]);

  const staffTimeEntries = useMemo(() => {
    return timeEntries.filter(
      te => te.staffId === staffMember.id &&
      new Date(te.clockIn) >= weekStart &&
      new Date(te.clockIn) <= weekEnd
    );
  }, [timeEntries, staffMember.id, weekStart, weekEnd]);

  const getEntriesForDay = (day: Date) => {
    return staffTimeEntries.filter(te => isSameDay(new Date(te.clockIn), day));
  };

  const calculateDayHours = (day: Date) => {
    const entries = getEntriesForDay(day);
    return entries.reduce((total, entry) => {
      if (entry.clockOut) {
        const hoursWorked = (new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime()) / (1000 * 60 * 60);
        const breakMinutes = entry.breaks?.reduce((bTotal, b) => {
          if (b.endTime) {
            return bTotal + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60);
          }
          return bTotal;
        }, 0) || 0;
        return total + hoursWorked - (breakMinutes / 60);
      }
      return total;
    }, 0);
  };

  const totalHours = daysInWeek.reduce((total, day) => total + calculateDayHours(day), 0);
  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(totalHours - 40, 0);

  const handleGenerateTimesheet = () => {
    generateTimesheet(staffMember.id, format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'));
    toast.success('Timesheet generated successfully');
  };

  const handleApproveTimesheet = () => {
    if (staffTimesheet) {
      approveTimesheet(staffTimesheet.id, 'current_manager');
      toast.success('Timesheet approved');
    }
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Timesheet"
      width={600}
      footer={
        <div className="flex gap-2 w-full">
          {!staffTimesheet ? (
            <BaseButton
              variant="gradient"
              onClick={handleGenerateTimesheet}
              className="w-full"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Generate Timesheet
            </BaseButton>
          ) : staffTimesheet.status === 'pending' ? (
            <BaseButton
              variant="gradient"
              onClick={handleApproveTimesheet}
              className="w-full"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Approve Timesheet
            </BaseButton>
          ) : (
            <BaseButton
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </BaseButton>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
          >
            Previous Week
          </BaseButton>
          <div className="text-center">
            <p className="font-medium">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </p>
            {staffTimesheet && (
              <BaseBadge 
                variant={
                  staffTimesheet.status === 'approved' ? 'default' :
                  staffTimesheet.status === 'pending' ? 'secondary' :
                  'outline'
                }
              >
                {staffTimesheet.status.charAt(0).toUpperCase() + staffTimesheet.status.slice(1)}
              </BaseBadge>
            )}
          </div>
          <BaseButton
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
          >
            Next Week
          </BaseButton>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <BaseCard className="p-3">
            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Total Hours</p>
          </BaseCard>
          <BaseCard className="p-3">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{regularHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Regular</p>
          </BaseCard>
          <BaseCard className="p-3">
            <AlertCircle className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{overtimeHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Overtime</p>
          </BaseCard>
          <BaseCard className="p-3">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">
              ${((regularHours * (staffMember.hourlyRate || 0)) + (overtimeHours * (staffMember.hourlyRate || 0) * 1.5)).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Est. Pay</p>
          </BaseCard>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Daily Breakdown</h3>
          {daysInWeek.map((day) => {
            const dayHours = calculateDayHours(day);
            const entries = getEntriesForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <BaseCard 
                key={day.toISOString()} 
                className={`p-3 ${isToday ? 'border-primary' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      dayHours > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
                    }`}>
                      <span className={`text-sm font-medium ${
                        dayHours > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                        {format(day, 'EEE')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{format(day, 'MMMM d')}</p>
                      {entries.length > 0 ? (
                        <div className="text-sm text-muted-foreground">
                          {entries.map((entry, idx) => (
                            <span key={entry.id}>
                              {idx > 0 && ', '}
                              {format(new Date(entry.clockIn), 'h:mm a')}
                              {entry.clockOut && ` - ${format(new Date(entry.clockOut), 'h:mm a')}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No entries</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${dayHours > 8 ? 'text-orange-500' : ''}`}>
                      {dayHours.toFixed(1)} hrs
                    </p>
                    {entries.some(e => e.breaks && e.breaks.length > 0) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Coffee className="h-3 w-3" />
                        <span>Breaks taken</span>
                      </div>
                    )}
                  </div>
                </div>
              </BaseCard>
            );
          })}
        </div>
      </div>
    </BaseDrawer>
  );
};
