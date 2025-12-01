import React, { useEffect } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { Supplier } from '@/types/inventory';
import { Building2, Mail, Phone, Globe, MapPin } from 'lucide-react';

interface SupplierFormData {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  paymentTerms?: string;
  leadTimeDays?: string;
  notes?: string;
}

interface SupplierDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSupplier?: Supplier | null;
}

export const SupplierDrawer: React.FC<SupplierDrawerProps> = ({
  open,
  onOpenChange,
  editingSupplier,
}) => {
  const { addSupplier, updateSupplier } = useInventoryStore();
  const isEditing = !!editingSupplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>();

  useEffect(() => {
    if (open && editingSupplier) {
      reset({
        name: editingSupplier.name,
        contactName: editingSupplier.contactName || '',
        email: editingSupplier.email || '',
        phone: editingSupplier.phone || '',
        address: editingSupplier.address || '',
        city: editingSupplier.city || '',
        state: editingSupplier.state || '',
        zipCode: editingSupplier.zipCode || '',
        country: editingSupplier.country || '',
        website: editingSupplier.website || '',
        paymentTerms: editingSupplier.paymentTerms || '',
        leadTimeDays: editingSupplier.leadTimeDays ? String(editingSupplier.leadTimeDays) : '',
        notes: editingSupplier.notes || '',
      });
    } else if (!open) {
      reset({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        website: '',
        paymentTerms: '',
        leadTimeDays: '',
        notes: '',
      });
    }
  }, [open, editingSupplier, reset]);

  const onSubmit = (data: SupplierFormData) => {
    if (isEditing && editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: data.name,
        contactName: data.contactName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
        country: data.country || undefined,
        website: data.website || undefined,
        paymentTerms: data.paymentTerms || undefined,
        leadTimeDays: data.leadTimeDays ? parseInt(data.leadTimeDays) : undefined,
        notes: data.notes || undefined,
      });
      toast.success('Supplier updated successfully');
    } else {
      const newSupplier: Supplier = {
        id: `sup_${Date.now()}`,
        name: data.name,
        contactName: data.contactName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
        country: data.country || undefined,
        website: data.website || undefined,
        paymentTerms: data.paymentTerms || undefined,
        leadTimeDays: data.leadTimeDays ? parseInt(data.leadTimeDays) : undefined,
        notes: data.notes || undefined,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addSupplier(newSupplier);
      toast.success('Supplier created successfully');
    }
    onOpenChange(false);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Supplier' : 'Add Supplier'}
      width={600}
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
            {isEditing ? 'Update Supplier' : 'Add Supplier'}
          </BaseButton>
        </div>
      }
    >
      <form className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Basic Information
          </div>

          <div>
            <BaseLabel htmlFor="name">Company Name *</BaseLabel>
            <BaseInput
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Enter supplier company name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <BaseLabel htmlFor="contactName">Contact Person</BaseLabel>
            <BaseInput
              id="contactName"
              {...register('contactName')}
              placeholder="Primary contact name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <BaseLabel htmlFor="email">
                <Mail className="h-3 w-3 inline mr-1" />
                Email
              </BaseLabel>
              <BaseInput
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="orders@supplier.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <BaseLabel htmlFor="phone">
                <Phone className="h-3 w-3 inline mr-1" />
                Phone
              </BaseLabel>
              <BaseInput
                id="phone"
                {...register('phone')}
                placeholder="+1-555-0100"
              />
            </div>
          </div>

          <div>
            <BaseLabel htmlFor="website">
              <Globe className="h-3 w-3 inline mr-1" />
              Website
            </BaseLabel>
            <BaseInput
              id="website"
              {...register('website')}
              className={errors.website ? 'border-red-500' : ''}
              placeholder="https://www.supplier.com"
            />
            {errors.website && (
              <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Address
          </div>

          <div>
            <BaseLabel htmlFor="address">Street Address</BaseLabel>
            <BaseInput
              id="address"
              {...register('address')}
              placeholder="123 Business Street"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <BaseLabel htmlFor="city">City</BaseLabel>
              <BaseInput
                id="city"
                {...register('city')}
                placeholder="Los Angeles"
              />
            </div>
            <div>
              <BaseLabel htmlFor="state">State/Province</BaseLabel>
              <BaseInput
                id="state"
                {...register('state')}
                placeholder="CA"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <BaseLabel htmlFor="zipCode">ZIP/Postal Code</BaseLabel>
              <BaseInput
                id="zipCode"
                {...register('zipCode')}
                placeholder="90001"
              />
            </div>
            <div>
              <BaseLabel htmlFor="country">Country</BaseLabel>
              <BaseInput
                id="country"
                {...register('country')}
                placeholder="USA"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">
            Order Settings
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <BaseLabel htmlFor="paymentTerms">Payment Terms</BaseLabel>
              <BaseInput
                id="paymentTerms"
                {...register('paymentTerms')}
                placeholder="Net 30"
              />
            </div>
            <div>
              <BaseLabel htmlFor="leadTimeDays">Lead Time (Days)</BaseLabel>
              <BaseInput
                id="leadTimeDays"
                type="number"
                min="0"
                {...register('leadTimeDays')}
                placeholder="5"
              />
            </div>
          </div>
        </div>

        <div>
          <BaseLabel htmlFor="notes">Notes</BaseLabel>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes about this supplier..."
            rows={3}
          />
        </div>
      </form>
    </BaseDrawer>
  );
};
