import React, { useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseCard } from '@/components/base/BaseCard';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { Switch } from '@/components/ui/switch';
import { Copy, Plus, Trash2, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useStaffStore } from '@/stores/staffStore';
import type { StaffMember, SchedulePattern, DaySchedule, Shift, SchedulePatternType, WeekPattern } from '@/types/staff';

interface StaffScheduleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface LocalDaySchedule {
  dayOfWeek: DayOfWeek;
  isWorking: boolean;
  shifts: { id: string; startTime: string; endTime: string }[];
}

export const StaffScheduleDrawer: React.FC<StaffScheduleDrawerProps> = ({
  open,
  onOpenChange,
  staffMember,
}) => {
  const { addSchedulePattern } = useStaffStore();
  
  const [schedule, setSchedule] = useState<Record<number, LocalDaySchedule>>(() => {
    const initial: Record<number, LocalDaySchedule> = {};
    for (let i = 0; i < 7; i++) {
      initial[i] = {
        dayOfWeek: i as DayOfWeek,
        isWorking: i < 5,
        shifts: i < 5 ? [{ id: `shift_${i}_0`, startTime: '09:00', endTime: '17:00' }] : [],
      };
    }
    return initial;
  });

  const [patternType, setPatternType] = useState<SchedulePatternType>('weekly');

  const handleDayToggle = (dayIndex: number, isWorking: boolean) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        isWorking,
        shifts: isWorking && prev[dayIndex].shifts.length === 0 
          ? [{ id: `shift_${dayIndex}_${Date.now()}`, startTime: '09:00', endTime: '17:00' }]
          : prev[dayIndex].shifts,
      },
    }));
  };

  const handleShiftChange = (
    dayIndex: number, 
    shiftIndex: number, 
    field: 'startTime' | 'endTime', 
    value: string
  ) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        shifts: prev[dayIndex].shifts.map((shift, idx) =>
          idx === shiftIndex ? { ...shift, [field]: value } : shift
        ),
      },
    }));
  };

  const handleAddShift = (dayIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        shifts: [...prev[dayIndex].shifts, { id: `shift_${dayIndex}_${Date.now()}`, startTime: '09:00', endTime: '17:00' }],
      },
    }));
  };

  const handleRemoveShift = (dayIndex: number, shiftIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        shifts: prev[dayIndex].shifts.filter((_, idx) => idx !== shiftIndex),
      },
    }));
  };

  const handleCopyToAll = (sourceDayIndex: number) => {
    const sourceSchedule = schedule[sourceDayIndex];
    setSchedule(prev => {
      const newSchedule = { ...prev };
      for (let i = 0; i < 7; i++) {
        if (i !== sourceDayIndex) {
          newSchedule[i] = {
            ...sourceSchedule,
            dayOfWeek: i as DayOfWeek,
            shifts: sourceSchedule.shifts.map((s, idx) => ({ ...s, id: `shift_${i}_${idx}` })),
          };
        }
      }
      return newSchedule;
    });
    toast.success('Schedule copied to all days');
  };

  const validateSchedule = (): string | null => {
    const workingDays = Object.values(schedule).filter(d => d.isWorking);
    if (workingDays.length === 0) {
      return 'At least one working day is required';
    }

    for (const day of workingDays) {
      for (const shift of day.shifts) {
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        if (startMinutes >= endMinutes) {
          const dayName = DAYS_OF_WEEK[day.dayOfWeek];
          return `${dayName}: Shift end time must be after start time`;
        }
      }
    }
    return null;
  };

  const handleSave = () => {
    const validationError = validateSchedule();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const now = new Date().toISOString();
    
    const days: DaySchedule[] = Object.values(schedule).map(day => ({
      dayOfWeek: day.dayOfWeek,
      isWorking: day.isWorking,
      shifts: day.shifts.map(s => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
      })) as Shift[],
    }));

    const weekPattern: WeekPattern = {
      weekNumber: 1,
      days,
    };

    const pattern: SchedulePattern = {
      id: `pattern_${Date.now()}`,
      staffId: staffMember.id,
      patternType,
      startDate: now,
      patterns: [weekPattern],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    addSchedulePattern(pattern);
    toast.success('Schedule saved successfully');
    onOpenChange(false);
  };

  const calculateDayHours = (daySchedule: LocalDaySchedule) => {
    if (!daySchedule.isWorking) return 0;
    return daySchedule.shifts.reduce((total, shift) => {
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const hours = (endH + endM / 60) - (startH + startM / 60);
      return total + Math.max(0, hours);
    }, 0);
  };

  const totalWeeklyHours = Object.values(schedule).reduce(
    (total, day) => total + calculateDayHours(day), 0
  );

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Schedule - ${staffMember.firstName} ${staffMember.lastName}`}
      width={600}
      footer={
        <div className="flex gap-2 w-full">
          <BaseButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="gradient"
            onClick={handleSave}
            className="flex-1"
          >
            Save Schedule
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-6">
        <BaseCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Hours</p>
              <p className="text-2xl font-bold text-primary">{totalWeeklyHours.toFixed(1)} hrs</p>
            </div>
            <div className="space-y-2">
              <BaseLabel className="text-xs">Schedule Type</BaseLabel>
              <BaseSelect value={patternType} onValueChange={(v: SchedulePatternType) => setPatternType(v)}>
                <BaseSelectItem value="weekly">Weekly</BaseSelectItem>
                <BaseSelectItem value="biweekly">Biweekly</BaseSelectItem>
                <BaseSelectItem value="rotating">Rotating</BaseSelectItem>
              </BaseSelect>
            </div>
          </div>
        </BaseCard>

        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day, index) => {
            const daySchedule = schedule[index];
            const dayHours = calculateDayHours(daySchedule);

            return (
              <BaseCard key={day} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={daySchedule.isWorking}
                      onCheckedChange={(checked) => handleDayToggle(index, checked)}
                    />
                    <span className={`font-medium ${!daySchedule.isWorking ? 'text-muted-foreground' : ''}`}>
                      {day}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {dayHours.toFixed(1)} hrs
                    </span>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToAll(index)}
                      title="Copy to all days"
                    >
                      <Copy className="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>

                {daySchedule.isWorking && (
                  <div className="space-y-2">
                    {daySchedule.shifts.map((shift, shiftIndex) => (
                      <div key={shift.id} className="flex items-center gap-2">
                        <BaseSelect
                          value={shift.startTime}
                          onValueChange={(v) => handleShiftChange(index, shiftIndex, 'startTime', v)}
                        >
                          {TIME_OPTIONS.map(time => (
                            <BaseSelectItem key={time} value={time}>{time}</BaseSelectItem>
                          ))}
                        </BaseSelect>
                        <span className="text-muted-foreground">to</span>
                        <BaseSelect
                          value={shift.endTime}
                          onValueChange={(v) => handleShiftChange(index, shiftIndex, 'endTime', v)}
                        >
                          {TIME_OPTIONS.map(time => (
                            <BaseSelectItem key={time} value={time}>{time}</BaseSelectItem>
                          ))}
                        </BaseSelect>
                        {daySchedule.shifts.length > 1 && (
                          <BaseButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveShift(index, shiftIndex)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </BaseButton>
                        )}
                      </div>
                    ))}
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddShift(index)}
                      className="text-primary"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Shift
                    </BaseButton>
                  </div>
                )}
              </BaseCard>
            );
          })}
        </div>

        {patternType === 'rotating' && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              <p className="text-sm">
                Rotating schedules allow you to set up multi-week patterns. 
                Additional weeks can be configured after saving the initial schedule.
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseDrawer>
  );
};
