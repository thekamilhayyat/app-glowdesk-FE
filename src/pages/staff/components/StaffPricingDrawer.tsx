import React, { useState, useEffect } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseCard } from '@/components/base/BaseCard';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseBadge } from '@/components/base/BaseBadge';
import { DollarSign, Search, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useStaffStore } from '@/stores/staffStore';
import { useServicesStore } from '@/stores/servicesStore';
import type { StaffMember, StaffPricing } from '@/types/staff';

interface StaffPricingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember;
}

export const StaffPricingDrawer: React.FC<StaffPricingDrawerProps> = ({
  open,
  onOpenChange,
  staffMember,
}) => {
  const { setStaffPricing, staffPricing } = useStaffStore();
  const { services } = useServicesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPrices, setEditingPrices] = useState<Record<string, { price: string; duration: string; isEnabled: boolean }>>({});

  const staffPricingMap = staffPricing.filter(sp => sp.staffId === staffMember.id);

  const getStaffPriceForService = (serviceId: string) => {
    return staffPricingMap.find(sp => sp.serviceId === serviceId);
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.categoryId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      const initialPrices: Record<string, { price: string; duration: string; isEnabled: boolean }> = {};
      staffPricingMap.forEach(sp => {
        initialPrices[sp.serviceId] = {
          price: sp.customPrice?.toString() || '',
          duration: sp.customDuration?.toString() || '',
          isEnabled: sp.isEnabled,
        };
      });
      setEditingPrices(initialPrices);
    }
  }, [open, staffMember.id]);

  const handlePriceChange = (serviceId: string, field: 'price' | 'duration', value: string) => {
    setEditingPrices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
      },
    }));
  };

  const handleSavePrice = (serviceId: string) => {
    const priceData = editingPrices[serviceId];
    if (!priceData || !priceData.price) {
      toast.error('Please enter a valid price');
      return;
    }

    const pricing: StaffPricing = {
      staffId: staffMember.id,
      serviceId,
      customPrice: parseFloat(priceData.price),
      customDuration: priceData.duration ? parseInt(priceData.duration) : undefined,
      isEnabled: true,
    };

    setStaffPricing(pricing);
    toast.success('Custom pricing saved');
  };

  const handleRemovePrice = (serviceId: string) => {
    const pricing: StaffPricing = {
      staffId: staffMember.id,
      serviceId,
      customPrice: undefined,
      customDuration: undefined,
      isEnabled: false,
    };
    setStaffPricing(pricing);
    setEditingPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[serviceId];
      return newPrices;
    });
    toast.success('Custom pricing removed');
  };

  const handleAddCustomPrice = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setEditingPrices(prev => ({
        ...prev,
        [serviceId]: {
          price: service.price.toString(),
          duration: service.duration.toString(),
          isEnabled: true,
        },
      }));
    }
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Custom Pricing - ${staffMember.firstName} ${staffMember.lastName}`}
      width={550}
      footer={
        <BaseButton
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          Close
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Set custom prices and durations for {staffMember.firstName}'s services. 
            These will override the default service prices when booking with this staff member.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No services found</p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const customPricing = getStaffPriceForService(service.id);
              const isEditing = !!editingPrices[service.id];
              const hasCustomPrice = customPricing?.isEnabled && customPricing?.customPrice !== undefined;

              return (
                <BaseCard key={service.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{service.name}</h4>
                        {hasCustomPrice && (
                          <BaseBadge variant="default">Custom</BaseBadge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Default: ${service.price} / {service.duration} min
                      </p>
                    </div>
                    {!isEditing && !hasCustomPrice && (
                      <BaseButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCustomPrice(service.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Customize
                      </BaseButton>
                    )}
                  </div>

                  {isEditing && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <BaseLabel className="text-xs">Custom Price ($)</BaseLabel>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <BaseInput
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingPrices[service.id]?.price || ''}
                              onChange={(e) => handlePriceChange(service.id, 'price', e.target.value)}
                              className="pl-8"
                              placeholder={service.price.toString()}
                            />
                          </div>
                        </div>
                        <div>
                          <BaseLabel className="text-xs">Custom Duration (min)</BaseLabel>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <BaseInput
                              type="number"
                              min="5"
                              step="5"
                              value={editingPrices[service.id]?.duration || ''}
                              onChange={(e) => handlePriceChange(service.id, 'duration', e.target.value)}
                              className="pl-8"
                              placeholder={service.duration.toString()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <BaseButton
                          variant="gradient"
                          size="sm"
                          onClick={() => handleSavePrice(service.id)}
                          className="flex-1"
                        >
                          Save
                        </BaseButton>
                        {hasCustomPrice && (
                          <BaseButton
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePrice(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </BaseButton>
                        )}
                      </div>
                    </div>
                  )}

                  {hasCustomPrice && !isEditing && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-primary font-medium">
                          ${customPricing.customPrice}
                        </span>
                        {customPricing.customDuration && (
                          <span className="text-muted-foreground">
                            {customPricing.customDuration} min
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddCustomPrice(service.id)}
                        >
                          Edit
                        </BaseButton>
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePrice(service.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </BaseButton>
                      </div>
                    </div>
                  )}
                </BaseCard>
              );
            })
          )}
        </div>
      </div>
    </BaseDrawer>
  );
};
