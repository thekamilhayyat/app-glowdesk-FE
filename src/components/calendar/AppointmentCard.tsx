import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle, Repeat, Pencil } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { Client } from '@/types/client';
import { Service } from '@/types/service';
import { StaffMember } from '@/types/staff';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AppointmentCardProps {
  appointment: Appointment;
  client: Client;
  services: Service[];
  staff: StaffMember;
  onCheckout?: () => void;
  onEdit?: () => void;
  className?: string;
}

/**
 * Get status-based CSS classes using CSS variables
 * These variables adapt automatically to light/dark theme
 */
const getStatusClasses = (status: AppointmentStatus): string => {
  const baseClasses = 'border-2';
  
  const statusMap: Record<AppointmentStatus, string> = {
    'pending': 'bg-[hsl(var(--status-pending-bg))] border-[hsl(var(--status-pending-border))] text-[hsl(var(--status-pending-text))]',
    'confirmed': 'bg-[hsl(var(--status-confirmed-bg))] border-[hsl(var(--status-confirmed-border))] text-[hsl(var(--status-confirmed-text))]',
    'checked-in': 'bg-[hsl(var(--status-checked-in-bg))] border-[hsl(var(--status-checked-in-border))] text-[hsl(var(--status-checked-in-text))]',
    'in-progress': 'bg-[hsl(var(--status-in-progress-bg))] border-[hsl(var(--status-in-progress-border))] text-[hsl(var(--status-in-progress-text))]',
    'completed': 'bg-[hsl(var(--status-completed-bg))] border-[hsl(var(--status-completed-border))] text-[hsl(var(--status-completed-text))]',
    'canceled': 'bg-[hsl(var(--status-canceled-bg))] border-[hsl(var(--status-canceled-border))] text-[hsl(var(--status-canceled-text))] opacity-70',
    'no-show': 'bg-[hsl(var(--status-no-show-bg))] border-[hsl(var(--status-no-show-border))] text-[hsl(var(--status-no-show-text))] opacity-75',
  };

  return cn(baseClasses, statusMap[status]);
};

const statusLabels: Record<AppointmentStatus, string> = {
  'pending': 'Pending',
  'confirmed': 'Confirmed',
  'checked-in': 'Checked In',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'canceled': 'Canceled',
  'no-show': 'No Show',
};

export function AppointmentCard({ 
  appointment, 
  client, 
  services, 
  staff, 
  onCheckout, 
  onEdit,
  className 
}: AppointmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: appointment.id,
    data: {
      type: 'appointment',
      appointment,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const appointmentServices = services.filter(s => appointment.serviceIds.includes(s.id));
  
  const canCheckout = ['confirmed', 'checked-in', 'in-progress'].includes(appointment.status);
  const showCheckoutButton = canCheckout && onCheckout;

  // Calculate duration in minutes
  const durationInMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60);
  const isShortAppointment = durationInMinutes <= 30;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col',
        isShortAppointment ? 'p-1.5' : 'p-2',
        getStatusClasses(appointment.status),
        isDragging && 'opacity-50 scale-95',
        appointment.status === 'canceled' && 'line-through',
        className
      )}
      data-testid={`appointment-card-${appointment.id}`}
    >
      <div
        className="cursor-grab flex-1 min-h-0"
        {...listeners}
        {...attributes}
      >
        {/* Line 1: Client name with icons and staff avatar */}
        <div className="flex items-start gap-1 mb-0.5">
          <span className={cn(
            "font-semibold flex-1 truncate",
            isShortAppointment ? "text-xs" : "text-sm"
          )}>
            {client.firstName} {client.lastName}
            {client.isNew && ' (NEW)'}
          </span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {client.isMember && (
              <div title="VIP">
                <Star className="h-3 w-3" />
              </div>
            )}
            {appointment.hasUnreadMessages && (
              <div title="Unread messages">
                <MessageCircle className="h-3 w-3" />
              </div>
            )}
            {appointment.isRecurring && (
              <div title="Recurring">
                <Repeat className="h-3 w-3" />
              </div>
            )}
            {/* Staff avatar */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 cursor-help",
                      isShortAppointment ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[9px]"
                    )}
                    style={{ backgroundColor: staff.color }}
                  >
                    {staff.firstName.charAt(0).toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{staff.firstName} {staff.lastName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Line 2: Time and Status combined for short appointments */}
        {isShortAppointment ? (
          <div className="text-[10px] leading-tight">
            {format(appointment.startTime, 'h:mm a')} • {statusLabels[appointment.status]}
          </div>
        ) : (
          <>
            {/* Line 2: Time */}
            <div className="text-xs mb-0.5">
              {format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}
            </div>

            {/* Line 3: Status */}
            <div className="text-xs font-medium" data-testid={`status-${appointment.status}`}>
              {statusLabels[appointment.status]}
            </div>

            {/* Service name - only show for longer appointments */}
            {appointmentServices.length > 0 && (
              <div className="text-xs opacity-90 mt-1 truncate">
                {appointmentServices.map(s => s.name).join(', ')}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons - always visible with increased cell height */}
      <div className={cn(
        "flex gap-1 flex-shrink-0 items-center",
        isShortAppointment ? "mt-1" : "mt-2 pt-1 border-t border-current/20"
      )}>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hover:bg-foreground/10 hover:text-foreground cursor-pointer",
              isShortAppointment ? "h-5 w-5 p-0" : "h-6 w-6 p-0"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            data-testid="button-edit-appointment"
            title="Edit appointment"
          >
            <Pencil className="h-3.5 w-3.5" style={{ width: '14px', height: '14px' }} />
          </Button>
        )}
        {showCheckoutButton && (
          <Button
            size="sm"
            className={cn(
              "bg-primary text-primary-foreground hover:bg-primary-hover ml-auto",
              isShortAppointment ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-xs"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onCheckout();
            }}
            data-testid="button-checkout-appointment"
          >
            Checkout
          </Button>
        )}
      </div>
    </div>
  );
}