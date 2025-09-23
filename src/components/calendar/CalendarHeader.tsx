import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { CalendarView, StaffMember } from '@/types/calendar';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface CalendarHeaderProps {
  currentView: CalendarView;
  currentDate: Date;
  selectedStaffIds: string[];
  staff: StaffMember[];
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onStaffFilter: (staffIds: string[]) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewAppointment?: () => void;
}

export function CalendarHeader({
  currentView,
  currentDate,
  selectedStaffIds,
  staff,
  onViewChange,
  onDateChange,
  onStaffFilter,
  onPrevious,
  onNext,
  onToday,
  onNewAppointment,
}: CalendarHeaderProps) {
  const getDateRangeLabel = () => {
    switch (currentView) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week': {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  const handleStaffSelection = (staffId: string) => {
    const isSelected = selectedStaffIds.includes(staffId);
    if (isSelected) {
      onStaffFilter(selectedStaffIds.filter(id => id !== staffId));
    } else {
      onStaffFilter([...selectedStaffIds, staffId]);
    }
  };

  const activeStaff = staff.filter(s => s.isActive);

  return (
    <div className="border-b bg-white p-4 md:p-5 lg:p-6">
      {/* Top row - View toggles and actions */}
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-2 md:gap-3">
          {/* View toggle buttons */}
          <div className="flex rounded-lg border">
            {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
              <Button
                key={view}
                variant={currentView === view ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none first:rounded-l-lg last:rounded-r-lg px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                onClick={() => onViewChange(view)}
                data-testid={`view-${view}`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNewAppointment && (
            <Button
              onClick={onNewAppointment}
              className="flex items-center gap-2"
              data-testid="button-new-appointment"
            >
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Bottom row - Navigation and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Date navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              data-testid="button-previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              data-testid="button-today"
            >
              Today
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              data-testid="button-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Current date/range display */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-lg" data-testid="date-range-label">
              {getDateRangeLabel()}
            </span>
          </div>
        </div>

        {/* Staff filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Staff:</span>
          
          {/* Show all/none toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedStaffIds.length === activeStaff.length) {
                onStaffFilter([]);
              } else {
                onStaffFilter(activeStaff.map(s => s.id));
              }
            }}
            data-testid="button-toggle-all-staff"
          >
            {selectedStaffIds.length === activeStaff.length ? 'None' : 'All'}
          </Button>

          {/* Individual staff toggles */}
          <div className="flex flex-wrap gap-1" data-testid="staff-filter-badges">
            {activeStaff.map((member) => {
              const isSelected = selectedStaffIds.includes(member.id);
              return (
                <Badge
                  key={member.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-100"
                  style={{
                    backgroundColor: isSelected ? member.color : undefined,
                    borderColor: member.color,
                  }}
                  onClick={() => handleStaffSelection(member.id)}
                  data-testid={`staff-badge-${member.id}`}
                >
                  {member.firstName} {member.lastName.charAt(0)}.
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}