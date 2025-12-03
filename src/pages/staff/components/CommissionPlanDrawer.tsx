import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { BaseCard } from '@/components/base/BaseCard';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useStaffStore } from '@/stores/staffStore';
import type { CommissionPlan, CommissionType } from '@/types/staff';

interface CommissionPlanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan?: CommissionPlan;
}

interface FormData {
  name: string;
  type: CommissionType;
  rate: string;
  appliesToServices: boolean;
  appliesToProducts: boolean;
  isDefault: boolean;
  tiers: Array<{
    minAmount: string;
    maxAmount: string;
    rate: string;
  }>;
}

export const CommissionPlanDrawer: React.FC<CommissionPlanDrawerProps> = ({
  open,
  onOpenChange,
  editingPlan,
}) => {
  const { addCommissionPlan, updateCommissionPlan } = useStaffStore();
  const isEditing = !!editingPlan;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      type: 'percentage',
      rate: '10',
      appliesToServices: true,
      appliesToProducts: true,
      isDefault: false,
      tiers: [{ minAmount: '0', maxAmount: '1000', rate: '10' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tiers',
  });

  const commissionType = watch('type');

  useEffect(() => {
    if (open && editingPlan) {
      reset({
        name: editingPlan.name,
        type: editingPlan.type,
        rate: editingPlan.rate?.toString() || '10',
        appliesToServices: editingPlan.appliesToServices,
        appliesToProducts: editingPlan.appliesToProducts,
        isDefault: editingPlan.isDefault,
        tiers: editingPlan.tiers?.map(t => ({
          minAmount: t.minAmount.toString(),
          maxAmount: t.maxAmount?.toString() || '',
          rate: t.rate.toString(),
        })) || [{ minAmount: '0', maxAmount: '1000', rate: '10' }],
      });
    } else if (!open) {
      reset({
        name: '',
        type: 'percentage',
        rate: '10',
        appliesToServices: true,
        appliesToProducts: true,
        isDefault: false,
        tiers: [{ minAmount: '0', maxAmount: '1000', rate: '10' }],
      });
    }
  }, [open, editingPlan, reset]);

  const onSubmit = (data: FormData) => {
    const now = new Date().toISOString();
    const tiers = data.type === 'tiered' 
      ? data.tiers.map((t, idx) => ({
          id: `tier_${Date.now()}_${idx}`,
          minAmount: parseFloat(t.minAmount) || 0,
          maxAmount: t.maxAmount ? parseFloat(t.maxAmount) : null,
          rate: parseFloat(t.rate) || 0,
        }))
      : undefined;

    const planData: CommissionPlan = {
      id: isEditing && editingPlan ? editingPlan.id : `plan_${Date.now()}`,
      name: data.name,
      type: data.type,
      rate: parseFloat(data.rate) || 0,
      appliesToServices: data.appliesToServices,
      appliesToProducts: data.appliesToProducts,
      tiers,
      isDefault: data.isDefault,
      createdAt: isEditing && editingPlan ? editingPlan.createdAt : now,
      updatedAt: now,
    };

    if (isEditing && editingPlan) {
      updateCommissionPlan(editingPlan.id, planData);
      toast.success('Commission plan updated successfully');
    } else {
      addCommissionPlan(planData);
      toast.success('Commission plan created successfully');
    }
    onOpenChange(false);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Commission Plan' : 'Create Commission Plan'}
      width={500}
      footer={
        <div className="flex gap-2 w-full">
          <BaseButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="button"
            variant="gradient"
            onClick={handleSubmit(onSubmit)}
            className="flex-1"
          >
            {isEditing ? 'Update Plan' : 'Create Plan'}
          </BaseButton>
        </div>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="space-y-4">
          <div>
            <BaseLabel htmlFor="name">Plan Name *</BaseLabel>
            <BaseInput
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., Senior Stylist Commission"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <BaseLabel>Commission Type *</BaseLabel>
            <BaseSelect
              value={commissionType}
              onValueChange={(value: CommissionType) => setValue('type', value)}
            >
              <BaseSelectItem value="percentage">Percentage</BaseSelectItem>
              <BaseSelectItem value="fixed">Fixed Amount</BaseSelectItem>
              <BaseSelectItem value="tiered">Tiered</BaseSelectItem>
            </BaseSelect>
          </div>

          {commissionType !== 'tiered' && (
            <div>
              <BaseLabel htmlFor="rate">
                {commissionType === 'percentage' ? 'Commission Rate (%)' : 'Fixed Amount ($)'}
              </BaseLabel>
              <BaseInput
                id="rate"
                type="number"
                step="0.01"
                min="0"
                {...register('rate', { required: 'Rate is required' })}
                className={errors.rate ? 'border-red-500' : ''}
              />
            </div>
          )}

          {commissionType === 'tiered' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <BaseLabel>Commission Tiers</BaseLabel>
                <BaseButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ minAmount: '', maxAmount: '', rate: '' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tier
                </BaseButton>
              </div>
              {fields.map((field, index) => (
                <BaseCard key={field.id} className="p-3">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <BaseLabel className="text-xs">Min ($)</BaseLabel>
                      <BaseInput
                        type="number"
                        step="0.01"
                        {...register(`tiers.${index}.minAmount`)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <BaseLabel className="text-xs">Max ($)</BaseLabel>
                      <BaseInput
                        type="number"
                        step="0.01"
                        {...register(`tiers.${index}.maxAmount`)}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <BaseLabel className="text-xs">Rate (%)</BaseLabel>
                      <BaseInput
                        type="number"
                        step="0.01"
                        {...register(`tiers.${index}.rate`)}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <BaseButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </BaseButton>
                  )}
                </BaseCard>
              ))}
            </div>
          )}

          <div className="space-y-3 border-t pt-4">
            <BaseLabel>Applies To</BaseLabel>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Services</p>
                <p className="text-sm text-muted-foreground">
                  Apply commission to service sales
                </p>
              </div>
              <Switch
                checked={watch('appliesToServices')}
                onCheckedChange={(checked) => setValue('appliesToServices', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Products</p>
                <p className="text-sm text-muted-foreground">
                  Apply commission to product sales
                </p>
              </div>
              <Switch
                checked={watch('appliesToProducts')}
                onCheckedChange={(checked) => setValue('appliesToProducts', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="font-medium">Default Plan</p>
              <p className="text-sm text-muted-foreground">
                Set as the default plan for new staff
              </p>
            </div>
            <Switch
              checked={watch('isDefault')}
              onCheckedChange={(checked) => setValue('isDefault', checked)}
            />
          </div>
        </div>
      </form>
    </BaseDrawer>
  );
};
