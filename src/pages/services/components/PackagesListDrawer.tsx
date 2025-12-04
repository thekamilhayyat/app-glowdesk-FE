import React, { useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { toast } from '@/components/ui/sonner';
import { useServicesStore } from '@/stores/servicesStore';
import { ServicePackage } from '@/types/service';
import { Search, Edit2, Trash2, Clock, DollarSign, Package, Plus } from 'lucide-react';

interface PackagesListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (pkg: ServicePackage) => void;
  onCreate?: () => void;
}

export function PackagesListDrawer({ open, onOpenChange, onEdit, onCreate }: PackagesListDrawerProps) {
  const { packages, deletePackage, services } = useServicesStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (pkg: ServicePackage) => {
    if (confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      deletePackage(pkg.id);
      toast.success('Package deleted successfully');
    }
  };

  const getServiceNames = (pkg: ServicePackage) => {
    return pkg.serviceIds
      .map(id => services.find(s => s.id === id)?.name || 'Unknown')
      .join(', ');
  };

  const getPriceDisplay = (pkg: ServicePackage) => {
    if (pkg.pricingType === 'fixed' && pkg.fixedPrice) {
      return `$${pkg.fixedPrice}`;
    }
    if (pkg.calculatedPrice !== undefined) {
      return `$${pkg.calculatedPrice}`;
    }
    return 'Varies';
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="All Packages"
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
          Create New Package
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No packages found' : 'No packages created yet'}
              </p>
            </div>
          ) : (
            filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{pkg.name}</h3>
                      {!pkg.isActive && (
                        <BaseBadge variant="outline" size="sm">Inactive</BaseBadge>
                      )}
                      <BaseBadge 
                        variant={pkg.pricingType === 'percentage_discount' ? 'default' : 'outline'} 
                        size="sm"
                      >
                        {pkg.pricingType === 'percentage_discount' 
                          ? `${pkg.discountPercentage}% off` 
                          : pkg.pricingType}
                      </BaseBadge>
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {pkg.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {getServiceNames(pkg)}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="h-3 w-3" />
                        {getPriceDisplay(pkg)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {pkg.totalDuration} min
                      </span>
                      <span className="text-muted-foreground">
                        {pkg.serviceIds.length} service(s)
                      </span>
                      {pkg.usageCount > 0 && (
                        <span className="text-muted-foreground">
                          {pkg.usageCount} sold
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onEdit?.(pkg);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </BaseButton>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pkg)}
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
            {packages.length} total package(s)
          </p>
        </div>
      </div>
    </BaseDrawer>
  );
}
