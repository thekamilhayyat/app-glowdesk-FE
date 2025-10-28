import { useMemo } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseBadge } from '@/components/base/BaseBadge';
import { BaseCard } from '@/components/base/BaseCard';
import { Separator } from '@/components/ui/separator';
import { Client } from '@/types/client';
import { useCalendarStore } from '@/stores/calendarStore';
import { useSalesStore } from '@/stores/salesStore';
import { format } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Edit,
  Plus,
  ShoppingCart,
  Receipt,
} from 'lucide-react';

interface ClientDetailDrawerProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (client: Client) => void;
  onNewAppointment?: (client: Client) => void;
  onNewSale?: (client: Client) => void;
}

export function ClientDetailDrawer({
  client,
  isOpen,
  onClose,
  onEdit,
  onNewAppointment,
  onNewSale,
}: ClientDetailDrawerProps) {
  const { getAppointmentsByClient, services, staff } = useCalendarStore();
  const { sales } = useSalesStore();

  // Get client's appointments
  const clientAppointments = useMemo(() => {
    if (!client) return [];
    return getAppointmentsByClient(client.id);
  }, [client, getAppointmentsByClient]);

  // Get client's sales/purchases
  const clientSales = useMemo(() => {
    if (!client) return [];
    return sales.filter((sale) => sale.clientId === client.id);
  }, [client, sales]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAppointments = clientAppointments.length;
    const lifetimeSpend = clientSales.reduce((sum, sale) => sum + sale.total, 0);
    const lastVisit = clientAppointments.length > 0 
      ? clientAppointments[0].startTime 
      : null;
    const averageTicket = clientSales.length > 0 
      ? lifetimeSpend / clientSales.length 
      : 0;

    return {
      totalAppointments,
      lifetimeSpend,
      lastVisit,
      averageTicket,
    };
  }, [clientAppointments, clientSales]);

  // Get upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return clientAppointments
      .filter((apt) => new Date(apt.startTime) >= now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [clientAppointments]);

  // Get past appointments
  const pastAppointments = useMemo(() => {
    const now = new Date();
    return clientAppointments
      .filter((apt) => new Date(apt.startTime) < now)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [clientAppointments]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-[hsl(var(--status-pending-border))]',
      confirmed: 'bg-[hsl(var(--status-confirmed-border))]',
      'checked-in': 'bg-[hsl(var(--status-checked-in-border))]',
      'in-progress': 'bg-[hsl(var(--status-in-progress-border))]',
      completed: 'bg-[hsl(var(--status-completed-border))]',
      canceled: 'bg-[hsl(var(--status-canceled-border))]',
      'no-show': 'bg-[hsl(var(--status-no-show-border))]',
    };
    return colors[status] || 'bg-muted';
  };

  if (!client) return null;

  return (
    <BaseDrawer isOpen={isOpen} onClose={onClose} title="Client Details" size="lg">
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <BaseButton variant="outline" size="sm" onClick={() => onEdit(client)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </BaseButton>
          )}
          {onNewAppointment && (
            <BaseButton variant="outline" size="sm" onClick={() => onNewAppointment(client)}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </BaseButton>
          )}
          {onNewSale && (
            <BaseButton variant="outline" size="sm" onClick={() => onNewSale(client)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Sale
            </BaseButton>
          )}
        </div>

        {/* Personal Information */}
        <BaseCard>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-medium">{client.name}</p>
              </div>

              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{client.email}</p>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{client.phone}</p>
                  </div>
                </div>
              )}

              {client.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{client.notes}</p>
                </div>
              )}

              {client.tags && client.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag, index) => (
                      <BaseBadge key={index} variant="secondary">
                        {tag}
                      </BaseBadge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </BaseCard>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BaseCard>
            <div className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
              <p className="text-xs text-muted-foreground">Total Visits</p>
            </div>
          </BaseCard>

          <BaseCard>
            <div className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">${stats.lifetimeSpend.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Lifetime Spend</p>
            </div>
          </BaseCard>

          <BaseCard>
            <div className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">${stats.averageTicket.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Avg. Ticket</p>
            </div>
          </BaseCard>

          <BaseCard>
            <div className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-bold">
                {stats.lastVisit ? format(stats.lastVisit, 'MMM dd') : 'Never'}
              </p>
              <p className="text-xs text-muted-foreground">Last Visit</p>
            </div>
          </BaseCard>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <BaseCard>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  Upcoming Appointments ({upcomingAppointments.length})
                </h3>
              </div>

              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((apt) => {
                  const service = services.find((s) => apt.serviceIds.includes(s.id));
                  const staffMember = staff.find((s) => s.id === apt.staffId);

                  return (
                    <div
                      key={apt.id}
                      className="flex items-start justify-between border-l-4 pl-4 py-2"
                      style={{ borderColor: getStatusColor(apt.status) }}
                    >
                      <div>
                        <p className="font-medium">
                          {format(apt.startTime, 'MMM dd, yyyy • h:mm a')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {service?.name || 'Service'} • {staffMember?.name || 'Staff'}
                        </p>
                      </div>
                      <BaseBadge variant="secondary" className="capitalize">
                        {apt.status}
                      </BaseBadge>
                    </div>
                  );
                })}
              </div>
            </div>
          </BaseCard>
        )}

        {/* Past Appointments */}
        <BaseCard>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                Appointment History ({pastAppointments.length})
              </h3>
            </div>

            {pastAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No past appointments
              </p>
            ) : (
              <div className="space-y-3">
                {pastAppointments.slice(0, 10).map((apt) => {
                  const service = services.find((s) => apt.serviceIds.includes(s.id));
                  const staffMember = staff.find((s) => s.id === apt.staffId);

                  return (
                    <div
                      key={apt.id}
                      className="flex items-start justify-between border-l-4 pl-4 py-2"
                      style={{ borderColor: getStatusColor(apt.status) }}
                    >
                      <div>
                        <p className="font-medium">
                          {format(apt.startTime, 'MMM dd, yyyy • h:mm a')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {service?.name || 'Service'} • {staffMember?.name || 'Staff'}
                        </p>
                      </div>
                      <BaseBadge variant="secondary" className="capitalize">
                        {apt.status}
                      </BaseBadge>
                    </div>
                  );
                })}
                {pastAppointments.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    and {pastAppointments.length - 10} more...
                  </p>
                )}
              </div>
            )}
          </div>
        </BaseCard>

        {/* Purchase History */}
        <BaseCard>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                Purchase History ({clientSales.length})
              </h3>
            </div>

            {clientSales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No purchase history
              </p>
            ) : (
              <div className="space-y-3">
                {clientSales.slice(0, 10).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-start justify-between border-l-4 border-green-500 pl-4 py-2"
                  >
                    <div>
                      <p className="font-medium">
                        {format(sale.completedAt, 'MMM dd, yyyy • h:mm a')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} •{' '}
                        {sale.transactionId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sale.items.map((item) => item.name).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${sale.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sale.paymentMethods.map((pm) => pm.type).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
                {clientSales.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    and {clientSales.length - 10} more...
                  </p>
                )}
              </div>
            )}
          </div>
        </BaseCard>

        {/* Close Button */}
        <BaseButton variant="outline" className="w-full" onClick={onClose}>
          Close
        </BaseButton>
      </div>
    </BaseDrawer>
  );
}

