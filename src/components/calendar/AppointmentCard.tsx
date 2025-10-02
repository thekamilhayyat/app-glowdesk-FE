import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Star, MessageCircle, Repeat, DollarSign } from 'lucide-react';
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

  const duration = Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));
  const appointmentServices = services.filter(s => appointment.serviceIds.includes(s.id));
  
  const canCheckout = ['confirmed', 'checked-in', 'in-progress'].includes(appointment.status);
  const showCheckoutButton = canCheckout && onCheckout;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white',
        isDragging && 'opacity-50',
        appointment.status === 'canceled' && 'opacity-60',
        className
      )}
      data-testid={`appointment-card-${appointment.id}`}
    >
      {/* Header with time and status */}
      <div 
        className={cn(
          'p-3 flex justify-between items-start cursor-grab',
          statusColors[appointment.status]
        )}
        {...listeners}
        {...attributes}
      >
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 mt-1" />
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-bold">
              {format(appointment.startTime, 'h:mm')}
            </span>
            <span className="text-2xl font-bold">
              {format(appointment.startTime, 'a').toUpperCase()} -
            </span>
            <span className="text-2xl font-bold">
              {format(appointment.endTime, 'h:mm')}
            </span>
            <span className="text-2xl font-bold">
              {format(appointment.endTime, 'a').toUpperCase()}
            </span>
            <span className="text-sm text-gray-600 mt-1">({duration}m)</span>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className="text-sm bg-white border-gray-300"
          data-testid={`status-${appointment.status}`}
        >
          {statusLabels[appointment.status]}
        </Badge>
      </div>

      {/* Body with client, services, and actions */}
      <div className="p-3">
        {/* Client info */}
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-gray-600" />
          <span className="font-bold text-lg text-blue-700">
            {client.firstName} {client.lastName}
          </span>
          {client.isNew && (
            <Badge variant="secondary" className="text-sm font-bold bg-blue-100 text-blue-700" data-testid="new-client-badge">
              NEW
            </Badge>
          )}
        </div>

        {/* Services */}
        <div className="mb-3 text-lg font-medium text-gray-700">
          {appointmentServices.map((service, index) => (
            <div key={service.id}>
              {index > 0 && <span className="text-gray-400"> + </span>}
              <span>{service.name}</span>
            </div>
          ))}
        </div>

        {/* Icons for special attributes */}
        <div className="flex items-center gap-2 mb-3">
          {client.preferredStaff === staff.id && (
            <div title="Preferred stylist">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          )}
          {appointment.hasUnreadMessages && (
            <div title="Unread messages">
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </div>
          )}
          {appointment.isRecurring && (
            <div title="Recurring appointment">
              <Repeat className="h-5 w-5 text-green-500" />
            </div>
          )}
          {appointment.depositPaid && (
            <div title="Deposit paid">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          )}
          {client.isMember && (
            <Badge variant="outline" className="text-sm h-5 px-2">
              VIP
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          {onEdit && (
            <Button
              variant="ghost"
              size="lg"
              className="text-lg font-bold text-blue-700 hover:text-blue-800 hover:bg-transparent px-0"
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
              size="lg"
              className="text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white px-8 rounded-full ml-auto"
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
          <div className="mt-3 text-sm text-gray-600 italic border-t pt-2" data-testid="appointment-notes">
            {appointment.notes}
          </div>
        )}
      </div>
    </div>
  );
}