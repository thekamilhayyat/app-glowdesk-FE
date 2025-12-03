import React, { useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { BaseCard } from '@/components/base/BaseCard';
import { Plus, Edit2, Trash2, Search, Percent, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useStaffStore } from '@/stores/staffStore';
import type { CommissionPlan } from '@/types/staff';

interface CommissionPlansListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlan: () => void;
  onEditPlan: (plan: CommissionPlan) => void;
}

export const CommissionPlansListDrawer: React.FC<CommissionPlansListDrawerProps> = ({
  open,
  onOpenChange,
  onAddPlan,
  onEditPlan,
}) => {
  const { commissionPlans, deleteCommissionPlan, staff } = useStaffStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlans = commissionPlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStaffCount = (planId: string) => {
    return staff.filter((s) => s.commissionPlanId === planId).length;
  };

  const getTypeIcon = (type: CommissionPlan['type']) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      case 'tiered':
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: CommissionPlan['type']) => {
    switch (type) {
      case 'percentage':
        return 'Percentage';
      case 'fixed':
        return 'Fixed';
      case 'tiered':
        return 'Tiered';
    }
  };

  const handleDelete = (plan: CommissionPlan) => {
    const staffCount = getStaffCount(plan.id);
    if (staffCount > 0) {
      toast.error(`Cannot delete plan assigned to ${staffCount} staff member(s)`);
      return;
    }
    deleteCommissionPlan(plan.id);
    toast.success('Commission plan deleted successfully');
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Commission Plans"
      width={550}
      footer={
        <BaseButton
          variant="gradient"
          onClick={() => {
            onOpenChange(false);
            onAddPlan();
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search commission plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No commission plans found</p>
              <p className="text-sm">Create your first plan to get started</p>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <BaseCard
                key={plan.id}
                className="p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{plan.name}</h3>
                      {plan.isDefault && (
                        <BaseBadge variant="default">Default</BaseBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getTypeIcon(plan.type)}
                        <span>{getTypeLabel(plan.type)}</span>
                      </div>
                      <span className="text-primary font-medium">
                        {plan.type === 'percentage' 
                          ? `${plan.rate}%` 
                          : plan.type === 'fixed'
                          ? `$${plan.rate}`
                          : `${plan.tiers?.length || 0} tiers`}
                      </span>
                      <span className="text-muted-foreground">
                        {getStaffCount(plan.id)} staff
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {plan.appliesToServices && plan.appliesToProducts 
                        ? 'Services & Products' 
                        : plan.appliesToServices 
                        ? 'Services only' 
                        : 'Products only'}
                    </div>
                    {plan.type === 'tiered' && plan.tiers && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {plan.tiers.map((tier, idx) => (
                          <span key={idx} className="mr-2">
                            ${tier.minAmount}-{tier.maxAmount ? `$${tier.maxAmount}` : '+'}: {tier.rate}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onEditPlan(plan);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </BaseButton>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plan)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
              </BaseCard>
            ))
          )}
        </div>
      </div>
    </BaseDrawer>
  );
};
