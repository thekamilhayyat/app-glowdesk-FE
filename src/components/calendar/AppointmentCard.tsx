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

const statusColors: Record<AppointmentStatus, string> = {
  'pending': 'bg-orange-100 border-orange-300 text-orange-800',
  'confirmed': 'bg-blue-100 border-blue-300 text-blue-800',
  'checked-in': 'bg-purple-100 border-purple-300 text-purple-800',
  'in-progress': 'bg-pink-100 border-pink-300 text-pink-800',
  'completed': 'bg-gray-100 border-gray-300 text-gray-600',
  'canceled': 'bg-red-100 border-red-300 text-red-600 opacity-60',
  'no-show': 'bg-yellow-100 border-yellow-300 text-yellow-700 opacity-70',
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
        'rounded-md p-2 text-white shadow-sm hover:shadow-md transition-shadow',
        statusColors[appointment.status],
        isDragging && 'opacity-50',
        appointment.status === 'canceled' && 'line-through opacity-60',
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
      <div className="flex gap-1 mt-2 pt-1 border-t border-white/20">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-white hover:bg-white/20 hover:text-white"
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
            className="h-6 px-2 text-xs bg-white/90 text-gray-900 hover:bg-white ml-auto"
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