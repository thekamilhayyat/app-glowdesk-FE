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
import { ServicePackage, BookingType } from '@/types/service';
import { Package, Clock, DollarSign, Percent } from 'lucide-react';

const packageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  bookingType: z.enum(['sequential', 'parallel']),
  pricingType: z.enum(['sum', 'fixed', 'percentage_discount']),
  fixedPrice: z.number().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  validityDays: z.number().min(1).optional(),
  maxRedemptions: z.number().min(1).optional(),
  isActive: z.boolean(),
  bookableOnline: z.boolean(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface ServicePackageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg?: ServicePackage;
  onSave?: (pkg: ServicePackage) => void;
}

export function ServicePackageDrawer({ open, onOpenChange, pkg, onSave }: ServicePackageDrawerProps) {
  const { services, addPackage, updatePackage } = useServicesStore();
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([]);

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      description: '',
      bookingType: 'sequential',
      pricingType: 'sum',
      fixedPrice: undefined,
      discountPercentage: undefined,
      validityDays: 30,
      maxRedemptions: 1,
      isActive: true,
      bookableOnline: true,
    },
  });

  useEffect(() => {
    if (pkg) {
      form.reset({
        name: pkg.name,
        description: pkg.description || '',
        bookingType: pkg.bookingType,
        pricingType: pkg.pricingType,
        fixedPrice: pkg.fixedPrice,
        discountPercentage: pkg.discountPercentage,
        validityDays: pkg.validityDays,
        maxRedemptions: pkg.maxRedemptions,
        isActive: pkg.isActive,
        bookableOnline: pkg.bookableOnline,
      });
      setSelectedServiceIds(pkg.serviceIds || []);
    } else {
      form.reset({
        name: '',
        description: '',
        bookingType: 'sequential',
        pricingType: 'sum',
        fixedPrice: undefined,
        discountPercentage: undefined,
        validityDays: 30,
        maxRedemptions: 1,
        isActive: true,
        bookableOnline: true,
      });
      setSelectedServiceIds([]);
    }
  }, [pkg, open]);

  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const totalBasePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const pricingType = form.watch('pricingType');
  const discountPercentage = form.watch('discountPercentage') || 0;
  const fixedPrice = form.watch('fixedPrice') || 0;

  const calculatedPrice = React.useMemo(() => {
    switch (pricingType) {
      case 'sum':
        return totalBasePrice;
      case 'fixed':
        return fixedPrice;
      case 'percentage_discount':
        return totalBasePrice * (1 - discountPercentage / 100);
      default:
        return totalBasePrice;
    }
  }, [pricingType, totalBasePrice, fixedPrice, discountPercentage]);

  const handleSubmit = (data: PackageFormData) => {
    if (selectedServiceIds.length < 2) {
      toast.error('Please select at least 2 services for the package');
      return;
    }

    const now = new Date().toISOString();
    const newPackage: ServicePackage = {
      id: pkg?.id || `pkg_${Date.now()}`,
      name: data.name,
      description: data.description,
      serviceIds: selectedServiceIds,
      bookingType: data.bookingType,
      pricingType: data.pricingType,
      fixedPrice: data.pricingType === 'fixed' ? data.fixedPrice : undefined,
      discountPercentage: data.pricingType === 'percentage_discount' ? data.discountPercentage : undefined,
      calculatedPrice,
      totalDuration,
      validityDays: data.validityDays,
      maxRedemptions: data.maxRedemptions,
      usageCount: pkg?.usageCount || 0,
      isActive: data.isActive,
      bookableOnline: data.bookableOnline,
      createdAt: pkg?.createdAt || now,
      updatedAt: now,
    };

    if (pkg) {
      updatePackage(pkg.id, newPackage);
      toast.success('Package updated successfully');
    } else {
      addPackage(newPackage);
      toast.success('Package created successfully');
    }

    onSave?.(newPackage);
    onOpenChange(false);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={pkg ? 'Edit Package' : 'Create Package'}
      width={550}
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
            {pkg ? 'Update Package' : 'Create Package'}
          </BaseButton>
        </div>
      }
    >
      <FormProvider {...form}>
        <form className="space-y-6">
          <div className="space-y-2">
            <BaseLabel htmlFor="name">Package Name *</BaseLabel>
            <BaseInput
              id="name"
              {...form.register('name')}
              placeholder="e.g., Bridal Package"
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="description">Description</BaseLabel>
            <BaseInput
              id="description"
              {...form.register('description')}
              placeholder="Brief description of the package"
            />
          </div>

          <div className="space-y-2">
            <BaseLabel>Included Services *</BaseLabel>
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {services.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No services available
                </p>
              ) : (
                services.filter(s => s.isActive).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedServiceIds.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <div className="flex-1">
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
              {selectedServiceIds.length} service(s) selected • Total: ${totalBasePrice} • {totalDuration} min
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel>Booking Type</BaseLabel>
              <BaseSelect
                value={form.watch('bookingType')}
                onValueChange={(value) => form.setValue('bookingType', value as BookingType)}
              >
                <BaseSelectItem value="sequential">Sequential</BaseSelectItem>
                <BaseSelectItem value="parallel">Parallel</BaseSelectItem>
              </BaseSelect>
              <p className="text-xs text-muted-foreground">
                {form.watch('bookingType') === 'sequential' 
                  ? 'Services booked one after another'
                  : 'Services can be booked at the same time'}
              </p>
            </div>

            <div className="space-y-2">
              <BaseLabel>Pricing Type</BaseLabel>
              <BaseSelect
                value={form.watch('pricingType')}
                onValueChange={(value) => form.setValue('pricingType', value as 'sum' | 'fixed' | 'percentage_discount')}
              >
                <BaseSelectItem value="sum">Sum of Services</BaseSelectItem>
                <BaseSelectItem value="fixed">Fixed Price</BaseSelectItem>
                <BaseSelectItem value="percentage_discount">Percentage Discount</BaseSelectItem>
              </BaseSelect>
            </div>
          </div>

          {pricingType === 'fixed' && (
            <div className="space-y-2">
              <BaseLabel htmlFor="fixedPrice">Fixed Price ($)</BaseLabel>
              <BaseInput
                id="fixedPrice"
                type="number"
                step="0.01"
                min="0"
                {...form.register('fixedPrice', { valueAsNumber: true })}
              />
            </div>
          )}

          {pricingType === 'percentage_discount' && (
            <div className="space-y-2">
              <BaseLabel htmlFor="discountPercentage">Discount (%)</BaseLabel>
              <BaseInput
                id="discountPercentage"
                type="number"
                min="0"
                max="100"
                {...form.register('discountPercentage', { valueAsNumber: true })}
              />
            </div>
          )}

          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-medium">Package Price</span>
              </div>
              <span className="text-xl font-bold text-primary">
                ${calculatedPrice.toFixed(2)}
              </span>
            </div>
            {pricingType === 'percentage_discount' && (
              <p className="text-xs text-muted-foreground mt-1">
                {discountPercentage}% off regular price of ${totalBasePrice}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel htmlFor="validityDays">Validity (days)</BaseLabel>
              <BaseInput
                id="validityDays"
                type="number"
                min="1"
                {...form.register('validityDays', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <BaseLabel htmlFor="maxRedemptions">Max Redemptions</BaseLabel>
              <BaseInput
                id="maxRedemptions"
                type="number"
                min="1"
                {...form.register('maxRedemptions', { valueAsNumber: true })}
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
          </div>
        </form>
      </FormProvider>
    </BaseDrawer>
  );
}
