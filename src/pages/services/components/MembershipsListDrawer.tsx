import React, { useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { toast } from '@/components/ui/sonner';
import { useServicesStore } from '@/stores/servicesStore';
import { Membership } from '@/types/service';
import { Search, Edit2, Trash2, Crown, DollarSign, Users, Plus, Percent } from 'lucide-react';

interface MembershipsListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (membership: Membership) => void;
  onCreate?: () => void;
}

export function MembershipsListDrawer({ open, onOpenChange, onEdit, onCreate }: MembershipsListDrawerProps) {
  const { memberships, deleteMembership, clientMemberships } = useServicesStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMemberships = memberships.filter(membership =>
    membership.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (membership: Membership) => {
    const activeMembers = clientMemberships.filter(
      cm => cm.membershipId === membership.id && cm.status === 'active'
    ).length;

    if (activeMembers > 0) {
      toast.error(`Cannot delete: ${activeMembers} active member(s)`);
      return;
    }

    if (confirm(`Are you sure you want to delete "${membership.name}"?`)) {
      deleteMembership(membership.id);
      toast.success('Membership deleted successfully');
    }
  };

  const getActiveMembers = (membershipId: string) => {
    return clientMemberships.filter(
      cm => cm.membershipId === membershipId && cm.status === 'active'
    ).length;
  };

  const billingIntervalLabels = {
    weekly: '/week',
    monthly: '/month',
    quarterly: '/quarter',
    yearly: '/year',
  };

  const typeLabels = {
    service_based: 'Service Credits',
    credit_based: 'Dollar Credits',
    hybrid: 'Hybrid',
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="All Memberships"
      width={550}
      footer={
        <BaseButton
          variant="gradient"
          className="w-full"
          onClick={() => {
            onOpenChange(false);
            onCreate?.();
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Membership
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search memberships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredMemberships.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No memberships found' : 'No memberships created yet'}
              </p>
            </div>
          ) : (
            filteredMemberships.map((membership) => {
              const activeMembers = getActiveMembers(membership.id);
              return (
                <div
                  key={membership.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <h3 className="font-medium">{membership.name}</h3>
                        {!membership.isActive && (
                          <BaseBadge variant="outline" size="sm">Inactive</BaseBadge>
                        )}
                      </div>
                      {membership.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {membership.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <BaseBadge variant="outline" size="sm">
                          {typeLabels[membership.type]}
                        </BaseBadge>
                        {membership.discountPercentage && membership.discountPercentage > 0 && (
                          <BaseBadge variant="default" size="sm">
                            <Percent className="h-3 w-3 mr-1" />
                            {membership.discountPercentage}% off
                          </BaseBadge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="h-3 w-3" />
                          ${membership.price}{billingIntervalLabels[membership.billingInterval]}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {activeMembers} active
                        </span>
                        {membership.creditAmount && (
                          <span className="text-muted-foreground">
                            ${membership.creditAmount} credits
                          </span>
                        )}
                      </div>
                      {membership.benefits && membership.benefits.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {membership.benefits.slice(0, 2).join(' • ')}
                          {membership.benefits.length > 2 && ` +${membership.benefits.length - 2} more`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onOpenChange(false);
                          onEdit?.(membership);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </BaseButton>
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(membership)}
                        disabled={activeMembers > 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </BaseButton>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {memberships.length} total membership(s)
          </p>
        </div>
      </div>
    </BaseDrawer>
  );
}
