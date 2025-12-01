import React, { useState } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useInventoryStore } from '@/stores/inventoryStore';
import { Supplier } from '@/types/inventory';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  Globe,
  Clock
} from 'lucide-react';

interface SuppliersListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
}

export const SuppliersListDrawer: React.FC<SuppliersListDrawerProps> = ({
  open,
  onOpenChange,
  onAddSupplier,
  onEditSupplier,
}) => {
  const { suppliers, deleteSupplier, items } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductCount = (supplierId: string) => {
    return items.filter((item) => item.supplierId === supplierId).length;
  };

  const handleDelete = (supplier: Supplier) => {
    const productCount = getProductCount(supplier.id);
    if (productCount > 0) {
      toast.error(`Cannot delete supplier with ${productCount} associated products`);
      return;
    }
    deleteSupplier(supplier.id);
    toast.success('Supplier deleted successfully');
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Suppliers"
      width={600}
      footer={
        <BaseButton
          variant="gradient"
          onClick={() => {
            onOpenChange(false);
            onAddSupplier();
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Supplier
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No suppliers found</p>
              <p className="text-sm">Add your first supplier to get started</p>
            </div>
          ) : (
            filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{supplier.name}</h4>
                      {supplier.contactName && (
                        <p className="text-sm text-muted-foreground">{supplier.contactName}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {supplier.email && (
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {supplier.email}
                          </span>
                        )}
                        {supplier.phone && (
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {supplier.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {supplier.website && (
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <Globe className="h-3 w-3 mr-1" />
                            {supplier.website}
                          </span>
                        )}
                        {supplier.leadTimeDays && (
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {supplier.leadTimeDays} days lead time
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <BaseBadge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status}
                        </BaseBadge>
                        <BaseBadge variant="outline">
                          {getProductCount(supplier.id)} products
                        </BaseBadge>
                        {supplier.paymentTerms && (
                          <BaseBadge variant="outline">
                            {supplier.paymentTerms}
                          </BaseBadge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onEditSupplier(supplier);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </BaseButton>
                    <BaseButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(supplier)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BaseDrawer>
  );
};
