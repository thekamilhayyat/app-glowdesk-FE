import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle, Repeat } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { Client } from '@/types/client';
import { Service } from '@/types/service';
import { StaffMember } from '@/types/staff';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-md p-2 shadow-sm hover:shadow-md transition-all duration-200',
        getStatusClasses(appointment.status),
        isDragging && 'opacity-50 scale-95',
        appointment.status === 'canceled' && 'line-through',
        className
      )}
      data-testid={`appointment-card-${appointment.id}`}
    >
      <div
        className="cursor-grab"
        {...listeners}
        {...attributes}
      >
        {/* Line 1: Client name (title) - can wrap to 2 lines */}
        <div className="flex items-start gap-1 mb-0.5">
          <span className="font-semibold text-sm line-clamp-2 flex-1">
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
          </div>
        </div>

        {/* Line 2: Time */}
        <div className="text-xs mb-0.5">
          {format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}
        </div>

        {/* Line 3: Status */}
        <div className="text-xs font-medium" data-testid={`status-${appointment.status}`}>
          {statusLabels[appointment.status]}
        </div>

        {/* Service name - subtle */}
        {appointmentServices.length > 0 && (
          <div className="text-xs opacity-90 mt-1 truncate">
            {appointmentServices.map(s => s.name).join(', ')}
          </div>
        )}
      </div>

      {/* Action buttons - compact at bottom */}
      <div className="flex gap-1 mt-2 pt-1 border-t border-current/20">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-foreground/10 hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            data-testid="button-edit-appointment"
          >
            Edit
          </Button>
        )}
        {showCheckoutButton && (
          <Button
            size="sm"
            className="h-6 px-2 text-xs bg-primary text-primary-foreground hover:bg-primary-hover ml-auto"
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