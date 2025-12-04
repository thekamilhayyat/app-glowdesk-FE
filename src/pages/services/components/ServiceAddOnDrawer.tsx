import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { Switch } from '@/components/ui/switch';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { useServicesStore } from '@/stores/servicesStore';
import { ServiceAddOn, Service } from '@/types/service';
import { Plus, Trash2 } from 'lucide-react';

const addOnSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
  applicableToAll: z.boolean(),
  isActive: z.boolean(),
  bookableOnline: z.boolean(),
});

type AddOnFormData = z.infer<typeof addOnSchema>;

interface ServiceAddOnDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addOn?: ServiceAddOn;
  onSave?: (addOn: ServiceAddOn) => void;
}

export function ServiceAddOnDrawer({ open, onOpenChange, addOn, onSave }: ServiceAddOnDrawerProps) {
  const { services, addAddOn, updateAddOn } = useServicesStore();
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([]);

  const form = useForm<AddOnFormData>({
    resolver: zodResolver(addOnSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 15,
      applicableToAll: true,
      isActive: true,
      bookableOnline: true,
    },
  });

  useEffect(() => {
    if (addOn) {
      form.reset({
        name: addOn.name,
        description: addOn.description || '',
        price: addOn.price,
        duration: addOn.duration,
        applicableToAll: addOn.applicableToAll,
        isActive: addOn.isActive,
        bookableOnline: addOn.bookableOnline,
      });
      setSelectedServiceIds(addOn.applicableServiceIds || []);
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        duration: 15,
        applicableToAll: true,
        isActive: true,
        bookableOnline: true,
      });
      setSelectedServiceIds([]);
    }
  }, [addOn, open]);

  const handleSubmit = (data: AddOnFormData) => {
    const now = new Date().toISOString();
    const newAddOn: ServiceAddOn = {
      id: addOn?.id || `addon_${Date.now()}`,
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      applicableServiceIds: data.applicableToAll ? [] : selectedServiceIds,
      applicableToAll: data.applicableToAll,
      isActive: data.isActive,
      bookableOnline: data.bookableOnline,
      order: addOn?.order || 0,
      createdAt: addOn?.createdAt || now,
      updatedAt: now,
    };

    if (addOn) {
      updateAddOn(addOn.id, newAddOn);
      toast.success('Add-on updated successfully');
    } else {
      addAddOn(newAddOn);
      toast.success('Add-on created successfully');
    }

    onSave?.(newAddOn);
    onOpenChange(false);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const applicableToAll = form.watch('applicableToAll');

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={addOn ? 'Edit Add-On' : 'Create Add-On'}
      width={500}
      footer={
        <div className="flex gap-3 w-full">
          <BaseButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="gradient"
            className="flex-1"
            onClick={form.handleSubmit(handleSubmit)}
          >
            {addOn ? 'Update Add-On' : 'Create Add-On'}
          </BaseButton>
        </div>
      }
    >
      <FormProvider {...form}>
        <form className="space-y-6">
          <div className="space-y-2">
            <BaseLabel htmlFor="name">Name *</BaseLabel>
            <BaseInput
              id="name"
              {...form.register('name')}
              placeholder="e.g., Deep Conditioning"
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="description">Description</BaseLabel>
            <BaseInput
              id="description"
              {...form.register('description')}
              placeholder="Brief description of the add-on"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel htmlFor="price">Price ($)</BaseLabel>
              <BaseInput
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...form.register('price', { valueAsNumber: true })}
                error={form.formState.errors.price?.message}
              />
            </div>
            <div className="space-y-2">
              <BaseLabel htmlFor="duration">Duration (min)</BaseLabel>
              <BaseInput
                id="duration"
                type="number"
                min="5"
                step="5"
                {...form.register('duration', { valueAsNumber: true })}
                error={form.formState.errors.duration?.message}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BaseLabel htmlFor="isActive">Active</BaseLabel>
              <Switch
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <BaseLabel htmlFor="bookableOnline">Bookable Online</BaseLabel>
              <Switch
                id="bookableOnline"
                checked={form.watch('bookableOnline')}
                onCheckedChange={(checked) => form.setValue('bookableOnline', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <BaseLabel htmlFor="applicableToAll">Applies to All Services</BaseLabel>
              <Switch
                id="applicableToAll"
                checked={applicableToAll}
                onCheckedChange={(checked) => form.setValue('applicableToAll', checked)}
              />
            </div>
          </div>

          {!applicableToAll && (
            <div className="space-y-2">
              <BaseLabel>Applicable Services</BaseLabel>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {services.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No services available
                  </p>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedServiceIds.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${service.price} • {service.duration} min
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedServiceIds.length} service(s) selected
              </p>
            </div>
          )}
        </form>
      </FormProvider>
    </BaseDrawer>
  );
}
