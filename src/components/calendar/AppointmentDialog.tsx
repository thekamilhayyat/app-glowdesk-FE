import { useState, useEffect } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { BaseDatePicker } from '@/components/base/BaseDatePicker';
import { BaseTimePicker } from '@/components/base/BaseTimePicker';
import { BaseCombobox } from '@/components/base/BaseCombobox';
import { BaseMultiSelect } from '@/components/base/BaseMultiSelect';
import { ClientQuickAdd } from './ClientQuickAdd';
import { Client } from '@/types/client';
import { Service } from '@/types/service';
import { StaffMember } from '@/types/staff';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { useCalendarStore } from '@/stores/calendarStore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  appointment?: Appointment;
  prefillData?: {
    date?: Date;
    time?: string;
    staffId?: string;
  };
}

export function AppointmentDialog({
  open,
  onOpenChange,
  mode,
  appointment,
  prefillData,
}: AppointmentDialogProps) {
  const { toast } = useToast();
  const {
    clients,
    staff,
    services,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    canSchedule,
  } = useCalendarStore();

  // Client quick add dialog state
  const [clientQuickAddOpen, setClientQuickAddOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    staffId: '',
    date: new Date(),
    startTime: '',
    serviceIds: [] as string[],
    duration: 30,
    status: 'pending' as AppointmentStatus,
    notes: '',
  });

  // Track if duration was manually edited
  const [manualDuration, setManualDuration] = useState(false);

  // Initialize form data based on mode
  useEffect(() => {
    if (mode === 'edit' && appointment) {
      const client = clients.find(c => c.id === appointment.clientId);
      setFormData({
        clientId: appointment.clientId,
        staffId: appointment.staffId,
        date: appointment.startTime,
        startTime: format(appointment.startTime, 'h:mm a'),
        serviceIds: appointment.serviceIds,
        duration: Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60)),
        status: appointment.status,
        notes: appointment.notes || '',
      });
      setManualDuration(false); // Reset manual flag on edit
    } else if (mode === 'create' && prefillData) {
      const now = new Date();
      const defaultTime = prefillData.time || format(now, 'h:mm a');
      setFormData({
        clientId: '',
        staffId: prefillData.staffId || '',
        date: prefillData.date || now,
        startTime: defaultTime,
        serviceIds: [],
        duration: 30,
        status: 'pending',
        notes: '',
      });
      setManualDuration(false); // Reset manual flag on create
    } else {
      // Default for new appointment button
      const now = new Date();
      setFormData({
        clientId: '',
        staffId: '',
        date: now,
        startTime: format(now, 'h:mm a'),
        serviceIds: [],
        duration: 30,
        status: 'pending',
        notes: '',
      });
      setManualDuration(false); // Reset manual flag on default
    }
  }, [mode, appointment, prefillData, clients, open]);

  // Filter services based on selected staff
  const availableServices = formData.staffId
    ? services.filter(service => {
        const selectedStaff = staff.find(s => s.id === formData.staffId);
        return selectedStaff?.services.includes(service.id);
      })
    : [];

  // Auto-calculate duration when services change (only if not manually edited)
  useEffect(() => {
    if (formData.serviceIds.length > 0 && !manualDuration) {
      const totalDuration = formData.serviceIds.reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return total + (service?.duration || 0);
      }, 0);
      setFormData(prev => ({ ...prev, duration: totalDuration }));
    }
  }, [formData.serviceIds, services, manualDuration]);

  const handleClientAdded = (newClient: Client) => {
    // Add client to store (we'll implement this method)
    useCalendarStore.getState().addClient?.(newClient);
    // Auto-select the new client
    setFormData(prev => ({ ...prev, clientId: newClient.id }));
  };

  const parseTimeToDate = (dateStr: Date, timeStr: string): Date | null => {
    try {
      const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeParts) return null;

      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3].toUpperCase();

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const result = new Date(dateStr);
      result.setHours(hours, minutes, 0, 0);
      return result;
    } catch {
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.clientId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a client',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.staffId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a staff member',
        variant: 'destructive',
      });
      return;
    }

    if (formData.serviceIds.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one service',
        variant: 'destructive',
      });
      return;
    }

    const startTime = parseTimeToDate(formData.date, formData.startTime);
    if (!startTime) {
      toast({
        title: 'Validation Error',
        description: 'Invalid time format',
        variant: 'destructive',
      });
      return;
    }

    const endTime = new Date(startTime.getTime() + formData.duration * 60 * 1000);

    // Check for overlaps
    const excludeId = mode === 'edit' ? appointment?.id : undefined;
    if (!canSchedule(formData.staffId, startTime, endTime, excludeId)) {
      const conflicts = useCalendarStore.getState().findConflicts(
        formData.staffId,
        startTime,
        endTime,
        excludeId
      );
      const conflictClient = clients.find(c => c.id === conflicts[0]?.clientId);
      toast({
        title: 'Schedule Conflict',
        description: `This time conflicts with ${conflictClient?.name || 'another appointment'} (${format(conflicts[0]?.startTime, 'h:mm a')} - ${format(conflicts[0]?.endTime, 'h:mm a')})`,
        variant: 'destructive',
      });
      return;
    }

    // Calculate total price
    const totalPrice = formData.serviceIds.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);

    if (mode === 'edit' && appointment) {
      const result = updateAppointment(appointment.id, {
        clientId: formData.clientId,
        staffId: formData.staffId,
        serviceIds: formData.serviceIds,
        startTime,
        endTime,
        status: formData.status,
        notes: formData.notes,
        totalPrice,
      });

      if (result.ok) {
        toast({
          title: 'Appointment Updated',
          description: 'The appointment has been successfully updated',
        });
        onOpenChange(false);
      }
    } else {
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        clientId: formData.clientId,
        staffId: formData.staffId,
        serviceIds: formData.serviceIds,
        startTime,
        endTime,
        status: formData.status,
        notes: formData.notes,
        hasUnreadMessages: false,
        isRecurring: false,
        depositPaid: false,
        totalPrice,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = addAppointment(newAppointment);

      if (result.ok) {
        toast({
          title: 'Appointment Created',
          description: 'The appointment has been successfully created',
        });
        onOpenChange(false);
      }
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked-in', label: 'Checked In' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'no-show', label: 'No Show' },
  ];

  const clientOptions = clients.map(client => ({
    id: client.id,
    label: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed Client',
    sublabel: client.email,
  }));

  const staffOptions = staff
    .filter(s => s.isActive)
    .map(s => ({
      value: s.id,
      label: `${s.firstName} ${s.lastName}`,
    }));

  const serviceOptions = availableServices.map(service => ({
    id: service.id,
    label: service.name,
    sublabel: `${service.duration} min - $${service.price}`,
  }));

  return (
    <>
      <BaseDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={mode === 'edit' ? 'Edit Appointment' : 'New Appointment'}
        footer={
          <div className="flex gap-3 w-full">
            {mode === 'edit' && appointment && (
              <BaseButton
                type="button"
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this appointment?')) {
                    deleteAppointment(appointment.id);
                    toast({
                      title: 'Appointment Deleted',
                      description: 'The appointment has been removed from the calendar.',
                    });
                    onOpenChange(false);
                  }
                }}
                className="flex-1"
                data-testid="button-delete-appointment"
              >
                Delete
              </BaseButton>
            )}
            <BaseButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-appointment"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              variant="gradient"
              onClick={handleSubmit}
              className="flex-1"
              data-testid="button-save-appointment"
            >
              {mode === 'edit' ? 'Update' : 'Create'} Appointment
            </BaseButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <BaseCombobox
            label="Client"
            options={clientOptions}
            value={formData.clientId}
            onChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
            onAddNew={() => setClientQuickAddOpen(true)}
            addNewLabel="Add New Client"
            placeholder="Select or search client"
            required
            data-testid="select-client"
          />

          <div className="space-y-2">
            <BaseLabel>Staff Member *</BaseLabel>
            <BaseSelect
              value={formData.staffId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, staffId: value, serviceIds: [] }))}
              placeholder="Select staff member"
              required
              data-testid="select-staff"
            >
              {staffOptions.map(option => (
                <BaseSelectItem key={option.value} value={option.value}>
                  {option.label}
                </BaseSelectItem>
              ))}
            </BaseSelect>
          </div>

          <BaseDatePicker
            label="Date"
            value={formData.date}
            onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
            required
            data-testid="select-date"
          />

          <div className="space-y-2">
            <BaseLabel>Start Time *</BaseLabel>
            <BaseTimePicker
              value={formData.startTime}
              onChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
              intervalMinutes={30}
              required
              data-testid="select-time"
            />
          </div>

          <BaseMultiSelect
            label="Services"
            options={serviceOptions}
            selectedIds={formData.serviceIds}
            onChange={(value) => setFormData(prev => ({ ...prev, serviceIds: value }))}
            placeholder={formData.staffId ? 'Select services' : 'Select a staff member first'}
            disabled={!formData.staffId}
            required
            data-testid="select-services"
          />

          <div className="space-y-2">
            <BaseLabel>Duration (minutes) *</BaseLabel>
            <BaseInput
              type="number"
              value={formData.duration}
              onChange={(e) => {
                setManualDuration(true);
                setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }));
              }}
              min={15}
              step={15}
              required
              data-testid="input-duration"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {manualDuration ? 'Manual duration set' : 'Auto-calculated from services'}
              </p>
              {manualDuration && (
                <button
                  type="button"
                  onClick={() => {
                    setManualDuration(false);
                    // Trigger recalculation
                    if (formData.serviceIds.length > 0) {
                      const totalDuration = formData.serviceIds.reduce((total, serviceId) => {
                        const service = services.find(s => s.id === serviceId);
                        return total + (service?.duration || 0);
                      }, 0);
                      setFormData(prev => ({ ...prev, duration: totalDuration }));
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                  data-testid="button-reset-duration"
                >
                  Reset to auto
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <BaseLabel>Status *</BaseLabel>
            <BaseSelect
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as AppointmentStatus }))}
              data-testid="select-status"
            >
              {statusOptions.map(option => (
                <BaseSelectItem key={option.value} value={option.value}>
                  {option.label}
                </BaseSelectItem>
              ))}
            </BaseSelect>
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="notes">Notes</BaseLabel>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
              placeholder="Add any special notes or requirements"
              data-testid="input-notes"
            />
          </div>
        </form>
      </BaseDrawer>

      <ClientQuickAdd
        open={clientQuickAddOpen}
        onOpenChange={setClientQuickAddOpen}
        onClientAdded={handleClientAdded}
        existingClients={clients}
      />
    </>
  );
}
