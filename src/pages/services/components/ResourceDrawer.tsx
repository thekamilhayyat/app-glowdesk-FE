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
import { toast } from '@/components/ui/sonner';
import { useServicesStore } from '@/stores/servicesStore';
import { Resource, ResourceType } from '@/types/service';
import { Box } from 'lucide-react';

const resourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['room', 'equipment', 'bed', 'station', 'other']),
  locationId: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  isActive: z.boolean(),
  color: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface ResourceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
  onSave?: (resource: Resource) => void;
}

export function ResourceDrawer({ open, onOpenChange, resource, onSave }: ResourceDrawerProps) {
  const { addResource, updateResource, resources } = useServicesStore();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'room',
      locationId: '',
      capacity: 1,
      isActive: true,
      color: '#6366f1',
    },
  });

  useEffect(() => {
    if (resource) {
      form.reset({
        name: resource.name,
        description: resource.description || '',
        type: resource.type,
        locationId: resource.locationId || '',
        capacity: resource.capacity,
        isActive: resource.isActive,
        color: resource.color || '#6366f1',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        type: 'room',
        locationId: '',
        capacity: 1,
        isActive: true,
        color: '#6366f1',
      });
    }
  }, [resource, open]);

  const handleSubmit = (data: ResourceFormData) => {
    const now = new Date().toISOString();
    const newResource: Resource = {
      id: resource?.id || `res_${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      locationId: data.locationId || undefined,
      capacity: data.capacity,
      isActive: data.isActive,
      color: data.color,
      order: resource?.order || resources.length,
      createdAt: resource?.createdAt || now,
      updatedAt: now,
    };

    if (resource) {
      updateResource(resource.id, newResource);
      toast.success('Resource updated successfully');
    } else {
      addResource(newResource);
      toast.success('Resource created successfully');
    }

    onSave?.(newResource);
    onOpenChange(false);
  };

  const resourceTypeLabels: Record<ResourceType, string> = {
    room: 'Room',
    equipment: 'Equipment',
    bed: 'Bed/Chair',
    station: 'Station',
    other: 'Other',
  };

  const resourceTypeDescriptions: Record<ResourceType, string> = {
    room: 'Meeting room, treatment room',
    equipment: 'Tools, machines, devices',
    bed: 'Massage bed, styling chair',
    station: 'Workstation, styling station',
    other: 'Other resources',
  };

  const colorOptions = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ef4444', label: 'Red' },
    { value: '#06b6d4', label: 'Cyan' },
  ];

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={resource ? 'Edit Resource' : 'Create Resource'}
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
            {resource ? 'Update Resource' : 'Create Resource'}
          </BaseButton>
        </div>
      }
    >
      <FormProvider {...form}>
        <form className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Box className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Resource Management</h3>
              <p className="text-sm text-muted-foreground">
                Track rooms, equipment, and stations for booking
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="name">Resource Name *</BaseLabel>
            <BaseInput
              id="name"
              {...form.register('name')}
              placeholder="e.g., Treatment Room 1"
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="description">Description</BaseLabel>
            <BaseInput
              id="description"
              {...form.register('description')}
              placeholder="Brief description of the resource"
            />
          </div>

          <div className="space-y-2">
            <BaseLabel>Resource Type</BaseLabel>
            <BaseSelect
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value as ResourceType)}
            >
              {Object.entries(resourceTypeLabels).map(([value, label]) => (
                <BaseSelectItem key={value} value={value}>{label}</BaseSelectItem>
              ))}
            </BaseSelect>
            <p className="text-xs text-muted-foreground">
              {resourceTypeDescriptions[form.watch('type')]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel htmlFor="capacity">Capacity</BaseLabel>
              <BaseInput
                id="capacity"
                type="number"
                min="1"
                {...form.register('capacity', { valueAsNumber: true })}
                error={form.formState.errors.capacity?.message}
              />
              <p className="text-xs text-muted-foreground">
                How many concurrent uses
              </p>
            </div>
            <div className="space-y-2">
              <BaseLabel htmlFor="locationId">Location ID</BaseLabel>
              <BaseInput
                id="locationId"
                {...form.register('locationId')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <BaseLabel>Color</BaseLabel>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => form.setValue('color', color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.watch('color') === color.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <BaseLabel>Active</BaseLabel>
              <p className="text-xs text-muted-foreground">Resource is available for use</p>
            </div>
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
          </div>
        </form>
      </FormProvider>
    </BaseDrawer>
  );
}
