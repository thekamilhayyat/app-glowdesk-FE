import React, { useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { toast } from '@/components/ui/sonner';
import { useServicesStore } from '@/stores/servicesStore';
import { ServiceAddOn } from '@/types/service';
import { Search, Edit2, Trash2, Clock, DollarSign, Plus } from 'lucide-react';

interface AddOnsListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (addOn: ServiceAddOn) => void;
  onCreate?: () => void;
}

export function AddOnsListDrawer({ open, onOpenChange, onEdit, onCreate }: AddOnsListDrawerProps) {
  const { addOns, deleteAddOn, services } = useServicesStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAddOns = addOns.filter(addOn =>
    addOn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (addOn: ServiceAddOn) => {
    if (confirm(`Are you sure you want to delete "${addOn.name}"?`)) {
      deleteAddOn(addOn.id);
      toast.success('Add-on deleted successfully');
    }
  };

  const getApplicableCount = (addOn: ServiceAddOn) => {
    if (addOn.applicableToAll) return services.length;
    return addOn.applicableServiceIds.length;
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="All Add-Ons"
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
          Create New Add-On
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search add-ons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredAddOns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No add-ons found' : 'No add-ons created yet'}
              </p>
            </div>
          ) : (
            filteredAddOns.map((addOn) => (
              <div
                key={addOn.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{addOn.name}</h3>
                      {!addOn.isActive && (
                        <BaseBadge variant="outline" size="sm">Inactive</BaseBadge>
                      )}
                    </div>
                    {addOn.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {addOn.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-3 w-3" />
                        ${addOn.price}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {addOn.duration} min
                      </span>
                      <span className="text-muted-foreground">
                        {addOn.applicableToAll 
                          ? 'All services' 
                          : `${getApplicableCount(addOn)} service(s)`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onEdit?.(addOn);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </BaseButton>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(addOn)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </BaseButton>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {addOns.length} total add-on(s)
          </p>
        </div>
      </div>
    </BaseDrawer>
  );
}
