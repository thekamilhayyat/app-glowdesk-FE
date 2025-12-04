import React, { useEffect } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
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
import { Membership, MembershipType, MembershipBillingInterval, MembershipServiceCredit } from '@/types/service';
import { Crown, Plus, Trash2, CreditCard, Percent } from 'lucide-react';

const membershipSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['service_based', 'credit_based', 'hybrid']),
  billingInterval: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  price: z.number().min(0, 'Price must be positive'),
  creditAmount: z.number().optional(),
  creditRollover: z.boolean(),
  maxRolloverCredits: z.number().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountOnServices: z.boolean(),
  discountOnProducts: z.boolean(),
  applicableToAllServices: z.boolean(),
  minimumCommitmentMonths: z.number().optional(),
  cancellationNoticeDays: z.number().optional(),
  isActive: z.boolean(),
  bookableOnline: z.boolean(),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

interface MembershipDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership?: Membership;
  onSave?: (membership: Membership) => void;
}

export function MembershipDrawer({ open, onOpenChange, membership, onSave }: MembershipDrawerProps) {
  const { services, addMembership, updateMembership } = useServicesStore();
  const [serviceCredits, setServiceCredits] = React.useState<MembershipServiceCredit[]>([]);
  const [benefits, setBenefits] = React.useState<string[]>([]);
  const [newBenefit, setNewBenefit] = React.useState('');

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'credit_based',
      billingInterval: 'monthly',
      price: 0,
      creditAmount: 100,
      creditRollover: false,
      maxRolloverCredits: undefined,
      discountPercentage: 10,
      discountOnServices: true,
      discountOnProducts: false,
      applicableToAllServices: true,
      minimumCommitmentMonths: 3,
      cancellationNoticeDays: 30,
      isActive: true,
      bookableOnline: true,
    },
  });

  useEffect(() => {
    if (membership) {
      form.reset({
        name: membership.name,
        description: membership.description || '',
        type: membership.type,
        billingInterval: membership.billingInterval,
        price: membership.price,
        creditAmount: membership.creditAmount,
        creditRollover: membership.creditRollover,
        maxRolloverCredits: membership.maxRolloverCredits,
        discountPercentage: membership.discountPercentage,
        discountOnServices: membership.discountOnServices,
        discountOnProducts: membership.discountOnProducts,
        applicableToAllServices: membership.applicableToAllServices,
        minimumCommitmentMonths: membership.minimumCommitmentMonths,
        cancellationNoticeDays: membership.cancellationNoticeDays,
        isActive: membership.isActive,
        bookableOnline: membership.bookableOnline,
      });
      setServiceCredits(membership.serviceCredits || []);
      setBenefits(membership.benefits || []);
    } else {
      form.reset({
        name: '',
        description: '',
        type: 'credit_based',
        billingInterval: 'monthly',
        price: 0,
        creditAmount: 100,
        creditRollover: false,
        maxRolloverCredits: undefined,
        discountPercentage: 10,
        discountOnServices: true,
        discountOnProducts: false,
        applicableToAllServices: true,
        minimumCommitmentMonths: 3,
        cancellationNoticeDays: 30,
        isActive: true,
        bookableOnline: true,
      });
      setServiceCredits([]);
      setBenefits([]);
    }
  }, [membership, open]);

  const membershipType = form.watch('type');

  const handleSubmit = (data: MembershipFormData) => {
    const now = new Date().toISOString();
    const newMembership: Membership = {
      id: membership?.id || `mem_${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      billingInterval: data.billingInterval,
      price: data.price,
      serviceCredits: data.type === 'service_based' || data.type === 'hybrid' ? serviceCredits : undefined,
      creditAmount: data.type === 'credit_based' || data.type === 'hybrid' ? data.creditAmount : undefined,
      creditRollover: data.creditRollover,
      maxRolloverCredits: data.creditRollover ? data.maxRolloverCredits : undefined,
      discountPercentage: data.discountPercentage,
      discountOnServices: data.discountOnServices,
      discountOnProducts: data.discountOnProducts,
      applicableServiceIds: [],
      applicableToAllServices: data.applicableToAllServices,
      benefits,
      minimumCommitmentMonths: data.minimumCommitmentMonths,
      cancellationNoticeDays: data.cancellationNoticeDays,
      isActive: data.isActive,
      bookableOnline: data.bookableOnline,
      order: membership?.order || 0,
      createdAt: membership?.createdAt || now,
      updatedAt: now,
    };

    if (membership) {
      updateMembership(membership.id, newMembership);
      toast.success('Membership updated successfully');
    } else {
      addMembership(newMembership);
      toast.success('Membership created successfully');
    }

    onSave?.(newMembership);
    onOpenChange(false);
  };

  const addServiceCredit = () => {
    if (services.length === 0) return;
    const unusedService = services.find(s => !serviceCredits.some(sc => sc.serviceId === s.id));
    if (unusedService) {
      setServiceCredits([...serviceCredits, {
        serviceId: unusedService.id,
        serviceName: unusedService.name,
        quantity: 1,
        rollover: false,
      }]);
    }
  };

  const removeServiceCredit = (index: number) => {
    setServiceCredits(serviceCredits.filter((_, i) => i !== index));
  };

  const updateServiceCredit = (index: number, field: keyof MembershipServiceCredit, value: any) => {
    const updated = [...serviceCredits];
    if (field === 'serviceId') {
      const service = services.find(s => s.id === value);
      updated[index] = {
        ...updated[index],
        serviceId: value,
        serviceName: service?.name || '',
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setServiceCredits(updated);
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const billingIntervalLabel = {
    weekly: 'week',
    monthly: 'month',
    quarterly: 'quarter',
    yearly: 'year',
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={membership ? 'Edit Membership' : 'Create Membership'}
      width={600}
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
            {membership ? 'Update Membership' : 'Create Membership'}
          </BaseButton>
        </div>
      }
    >
      <FormProvider {...form}>
        <form className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <Crown className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Membership Plan</h3>
              <p className="text-sm text-muted-foreground">
                Create recurring membership with credits and discounts
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="name">Membership Name *</BaseLabel>
            <BaseInput
              id="name"
              {...form.register('name')}
              placeholder="e.g., Gold Membership"
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="description">Description</BaseLabel>
            <BaseInput
              id="description"
              {...form.register('description')}
              placeholder="Brief description of membership benefits"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel>Membership Type</BaseLabel>
              <BaseSelect
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value as MembershipType)}
              >
                <BaseSelectItem value="credit_based">Credit-Based</BaseSelectItem>
                <BaseSelectItem value="service_based">Service-Based</BaseSelectItem>
                <BaseSelectItem value="hybrid">Hybrid</BaseSelectItem>
              </BaseSelect>
            </div>

            <div className="space-y-2">
              <BaseLabel>Billing Interval</BaseLabel>
              <BaseSelect
                value={form.watch('billingInterval')}
                onValueChange={(value) => form.setValue('billingInterval', value as MembershipBillingInterval)}
              >
                <BaseSelectItem value="weekly">Weekly</BaseSelectItem>
                <BaseSelectItem value="monthly">Monthly</BaseSelectItem>
                <BaseSelectItem value="quarterly">Quarterly</BaseSelectItem>
                <BaseSelectItem value="yearly">Yearly</BaseSelectItem>
              </BaseSelect>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel htmlFor="price">
                Price (per {billingIntervalLabel[form.watch('billingInterval')]})
              </BaseLabel>
              <BaseInput
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...form.register('price', { valueAsNumber: true })}
                error={form.formState.errors.price?.message}
              />
            </div>

            {(membershipType === 'credit_based' || membershipType === 'hybrid') && (
              <div className="space-y-2">
                <BaseLabel htmlFor="creditAmount">Credits per Cycle</BaseLabel>
                <BaseInput
                  id="creditAmount"
                  type="number"
                  min="0"
                  {...form.register('creditAmount', { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          {(membershipType === 'service_based' || membershipType === 'hybrid') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <BaseLabel>Service Credits</BaseLabel>
                <BaseButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceCredit}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </BaseButton>
              </div>
              <div className="space-y-2">
                {serviceCredits.map((credit, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <BaseSelect
                        value={credit.serviceId}
                        onValueChange={(value) => updateServiceCredit(index, 'serviceId', value)}
                      >
                        {services.map(s => (
                          <BaseSelectItem key={s.id} value={s.id}>{s.name}</BaseSelectItem>
                        ))}
                      </BaseSelect>
                    </div>
                    <BaseInput
                      type="number"
                      min="1"
                      value={credit.quantity}
                      onChange={(e) => updateServiceCredit(index, 'quantity', parseInt(e.target.value))}
                      className="w-20"
                      placeholder="Qty"
                    />
                    <BaseButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeServiceCredit(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </BaseButton>
                  </div>
                ))}
                {serviceCredits.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No service credits added
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BaseLabel>Credit Rollover</BaseLabel>
              <Switch
                checked={form.watch('creditRollover')}
                onCheckedChange={(checked) => form.setValue('creditRollover', checked)}
              />
            </div>

            {form.watch('creditRollover') && (
              <div className="space-y-2">
                <BaseLabel htmlFor="maxRolloverCredits">Max Rollover Credits</BaseLabel>
                <BaseInput
                  id="maxRolloverCredits"
                  type="number"
                  min="0"
                  {...form.register('maxRolloverCredits', { valueAsNumber: true })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Discounts</h4>
            </div>

            <div className="space-y-2">
              <BaseLabel htmlFor="discountPercentage">Discount Percentage</BaseLabel>
              <BaseInput
                id="discountPercentage"
                type="number"
                min="0"
                max="100"
                {...form.register('discountPercentage', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center justify-between">
              <BaseLabel>Discount on Services</BaseLabel>
              <Switch
                checked={form.watch('discountOnServices')}
                onCheckedChange={(checked) => form.setValue('discountOnServices', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <BaseLabel>Discount on Products</BaseLabel>
              <Switch
                checked={form.watch('discountOnProducts')}
                onCheckedChange={(checked) => form.setValue('discountOnProducts', checked)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <BaseLabel>Benefits</BaseLabel>
            <div className="flex gap-2">
              <BaseInput
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a benefit"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <BaseButton type="button" variant="outline" onClick={addBenefit}>
                <Plus className="h-4 w-4" />
              </BaseButton>
            </div>
            <div className="space-y-1">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">{benefit}</span>
                  <BaseButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBenefit(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </BaseButton>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel htmlFor="minimumCommitmentMonths">Min Commitment (months)</BaseLabel>
              <BaseInput
                id="minimumCommitmentMonths"
                type="number"
                min="0"
                {...form.register('minimumCommitmentMonths', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <BaseLabel htmlFor="cancellationNoticeDays">Cancellation Notice (days)</BaseLabel>
              <BaseInput
                id="cancellationNoticeDays"
                type="number"
                min="0"
                {...form.register('cancellationNoticeDays', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BaseLabel>Active</BaseLabel>
              <Switch
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <BaseLabel>Bookable Online</BaseLabel>
              <Switch
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
