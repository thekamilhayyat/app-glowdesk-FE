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
import { DynamicPricingRule, PricingCondition } from '@/types/service';
import { TrendingUp, Calendar, Clock } from 'lucide-react';

const pricingRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['surge', 'discount', 'time_based', 'demand_based']),
  adjustmentType: z.enum(['percentage', 'fixed']),
  adjustmentValue: z.number(),
  priority: z.number().min(1),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface DynamicPricingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: DynamicPricingRule;
  onSave?: (rule: DynamicPricingRule) => void;
}

export function DynamicPricingDrawer({ open, onOpenChange, rule, onSave }: DynamicPricingDrawerProps) {
  const { services, addPricingRule, updatePricingRule } = useServicesStore();
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([]);
  const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
  const [appliesToAll, setAppliesToAll] = React.useState(true);
  const [timeStart, setTimeStart] = React.useState('');
  const [timeEnd, setTimeEnd] = React.useState('');

  const form = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      name: '',
      type: 'time_based',
      adjustmentType: 'percentage',
      adjustmentValue: 10,
      priority: 1,
      isActive: true,
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    if (rule) {
      form.reset({
        name: rule.name,
        type: rule.type,
        adjustmentType: rule.adjustmentType,
        adjustmentValue: rule.adjustmentValue,
        priority: rule.priority,
        isActive: rule.isActive,
        startDate: rule.startDate || '',
        endDate: rule.endDate || '',
      });
      setSelectedServiceIds(rule.applicableServiceIds || []);
      setAppliesToAll(rule.applicableToAll);
      
      const dayCondition = rule.conditions.find(c => c.type === 'day_of_week');
      if (dayCondition && Array.isArray(dayCondition.value)) {
        setSelectedDays(dayCondition.value.map(v => Number(v)));
      } else {
        setSelectedDays([]);
      }
      
      const timeCondition = rule.conditions.find(c => c.type === 'time_range');
      if (timeCondition && typeof timeCondition.value === 'string') {
        const [start, end] = timeCondition.value.split('-');
        setTimeStart(start || '');
        setTimeEnd(end || '');
      } else {
        setTimeStart('');
        setTimeEnd('');
      }
    } else {
      form.reset({
        name: '',
        type: 'time_based',
        adjustmentType: 'percentage',
        adjustmentValue: 10,
        priority: 1,
        isActive: true,
        startDate: '',
        endDate: '',
      });
      setSelectedServiceIds([]);
      setSelectedDays([]);
      setAppliesToAll(true);
      setTimeStart('');
      setTimeEnd('');
    }
  }, [rule, open]);

  const handleSubmit = (data: PricingRuleFormData) => {
    const now = new Date().toISOString();
    
    const conditions: PricingCondition[] = [];
    
    if (selectedDays.length > 0) {
      conditions.push({
        type: 'day_of_week',
        value: selectedDays.map(String),
        operator: 'in',
      });
    }
    
    if (timeStart && timeEnd) {
      conditions.push({
        type: 'time_range',
        value: `${timeStart}-${timeEnd}`,
        operator: 'between',
      });
    }
    
    if (data.startDate && data.endDate) {
      conditions.push({
        type: 'date_range',
        value: `${data.startDate}-${data.endDate}`,
        operator: 'between',
      });
    }

    const newRule: DynamicPricingRule = {
      id: rule?.id || `pr_${Date.now()}`,
      name: data.name,
      type: data.type,
      applicableServiceIds: appliesToAll ? [] : selectedServiceIds,
      applicableToAll: appliesToAll,
      adjustmentType: data.adjustmentType,
      adjustmentValue: data.adjustmentValue,
      conditions,
      priority: data.priority,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      isActive: data.isActive,
      createdAt: rule?.createdAt || now,
      updatedAt: now,
    };

    if (rule) {
      updatePricingRule(rule.id, newRule);
      toast.success('Pricing rule updated successfully');
    } else {
      addPricingRule(newRule);
      toast.success('Pricing rule created successfully');
    }

    onSave?.(newRule);
    onOpenChange(false);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const adjustmentType = form.watch('adjustmentType');
  const adjustmentValue = form.watch('adjustmentValue');

  const ruleTypeLabels = {
    surge: 'Surge Pricing',
    discount: 'Discount',
    time_based: 'Time-Based',
    demand_based: 'Demand-Based',
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={rule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
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
            {rule ? 'Update Rule' : 'Create Rule'}
          </BaseButton>
        </div>
      }
    >
      <FormProvider {...form}>
        <form className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-semibold">Dynamic Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Adjust prices based on time, day, or date range
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <BaseLabel htmlFor="name">Rule Name *</BaseLabel>
            <BaseInput
              id="name"
              {...form.register('name')}
              placeholder="e.g., Weekend Premium"
              error={form.formState.errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <BaseLabel>Rule Type</BaseLabel>
            <BaseSelect
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value as 'surge' | 'discount' | 'time_based' | 'demand_based')}
            >
              {Object.entries(ruleTypeLabels).map(([value, label]) => (
                <BaseSelectItem key={value} value={value}>{label}</BaseSelectItem>
              ))}
            </BaseSelect>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel>Adjustment Type</BaseLabel>
              <BaseSelect
                value={form.watch('adjustmentType')}
                onValueChange={(value) => form.setValue('adjustmentType', value as 'percentage' | 'fixed')}
              >
                <BaseSelectItem value="percentage">Percentage</BaseSelectItem>
                <BaseSelectItem value="fixed">Fixed Amount</BaseSelectItem>
              </BaseSelect>
            </div>

            <div className="space-y-2">
              <BaseLabel htmlFor="adjustmentValue">
                {adjustmentType === 'percentage' ? 'Adjustment (%)' : 'Adjustment ($)'}
              </BaseLabel>
              <BaseInput
                id="adjustmentValue"
                type="number"
                step={adjustmentType === 'percentage' ? '1' : '0.01'}
                {...form.register('adjustmentValue', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className={`p-3 rounded-lg ${adjustmentValue >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <p className="text-sm font-medium">
              {adjustmentValue >= 0 ? 'Price Increase' : 'Price Decrease'}:
              {adjustmentType === 'percentage'
                ? ` ${Math.abs(adjustmentValue)}%`
                : ` $${Math.abs(adjustmentValue).toFixed(2)}`
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Use negative values for discounts
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <BaseLabel>Days of Week (Optional)</BaseLabel>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedDays.includes(day.value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 border-border hover:border-primary'
                  }`}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Applies on: {selectedDays.map(d => DAYS_OF_WEEK[d].label).join(', ')}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <BaseLabel>Time Range (Optional)</BaseLabel>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <BaseLabel className="text-xs">Start Time</BaseLabel>
                <BaseInput
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <BaseLabel className="text-xs">End Time</BaseLabel>
                <BaseInput
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <BaseLabel>Date Range (Optional)</BaseLabel>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <BaseLabel className="text-xs">Start Date</BaseLabel>
                <BaseInput
                  type="date"
                  {...form.register('startDate')}
                />
              </div>
              <div className="space-y-1">
                <BaseLabel className="text-xs">End Date</BaseLabel>
                <BaseInput
                  type="date"
                  {...form.register('endDate')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BaseLabel>Applies to All Services</BaseLabel>
              <Switch
                checked={appliesToAll}
                onCheckedChange={setAppliesToAll}
              />
            </div>
          </div>

          {!appliesToAll && (
            <div className="space-y-2">
              <BaseLabel>Applicable Services</BaseLabel>
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {services.map((service) => (
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
                      <p className="text-xs text-muted-foreground">${service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <BaseLabel htmlFor="priority">Priority</BaseLabel>
              <BaseInput
                id="priority"
                type="number"
                min="1"
                {...form.register('priority', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Higher priority rules apply first
              </p>
            </div>
            <div className="flex items-end pb-6">
              <div className="flex items-center justify-between w-full">
                <BaseLabel>Active</BaseLabel>
                <Switch
                  checked={form.watch('isActive')}
                  onCheckedChange={(checked) => form.setValue('isActive', checked)}
                />
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </BaseDrawer>
  );
}
