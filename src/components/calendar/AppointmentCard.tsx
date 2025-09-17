import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Star, MessageCircle, Repeat, DollarSign } from 'lucide-react';
import { Appointment, AppointmentStatus, Client, Service, StaffMember } from '@/types/calendar';
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

  const duration = Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));
  const appointmentServices = services.filter(s => appointment.serviceIds.includes(s.id));
  
  const canCheckout = ['confirmed', 'checked-in', 'in-progress'].includes(appointment.status);
  const showCheckoutButton = canCheckout && onCheckout;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'p-3 rounded-lg border-l-4 border shadow-sm hover:shadow-md transition-shadow cursor-grab',
        statusColors[appointment.status],
        isDragging && 'opacity-50',
        appointment.status === 'canceled' && 'line-through',
        className
      )}
      data-testid={`appointment-card-${appointment.id}`}
    >
      {/* Header with time and status */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-medium">
            {format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}
          </span>
          <span className="text-xs text-gray-500">({duration}m)</span>
        </div>
        <Badge 
          variant="outline" 
          className="text-xs"
          data-testid={`status-${appointment.status}`}
        >
          {statusLabels[appointment.status]}
        </Badge>
      </div>

      {/* Client info */}
      <div className="flex items-center gap-2 mb-2">
        <User className="h-4 w-4" />
        <span className="font-semibold text-sm">
          {client.firstName} {client.lastName}
        </span>
        {client.isNew && (
          <Badge variant="secondary" className="text-xs" data-testid="new-client-badge">
            NEW
          </Badge>
        )}
      </div>

      {/* Services */}
      <div className="mb-2">
        {appointmentServices.map((service, index) => (
          <div key={service.id} className="text-sm">
            {index > 0 && <span className="text-gray-400"> + </span>}
            <span>{service.name}</span>
          </div>
        ))}
      </div>

      {/* Icons for special attributes */}
      <div className="flex items-center gap-1 mb-2">
        {client.preferredStaff === staff.id && (
          <div title="Preferred stylist">
            <Star className="h-3 w-3 text-yellow-500" />
          </div>
        )}
        {appointment.hasUnreadMessages && (
          <div title="Unread messages">
            <MessageCircle className="h-3 w-3 text-blue-500" />
          </div>
        )}
        {appointment.isRecurring && (
          <div title="Recurring appointment">
            <Repeat className="h-3 w-3 text-green-500" />
          </div>
        )}
        {appointment.depositPaid && (
          <div title="Deposit paid">
            <DollarSign className="h-3 w-3 text-green-600" />
          </div>
        )}
        {client.isMember && (
          <Badge variant="outline" className="text-xs h-4">
            VIP
          </Badge>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 mt-2">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
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
            variant="default"
            size="sm"
            className="h-6 px-2 text-xs"
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

      {/* Notes if any */}
      {appointment.notes && (
        <div className="mt-2 text-xs text-gray-600 italic" data-testid="appointment-notes">
          {appointment.notes}
        </div>
      )}
    </div>
  );
}