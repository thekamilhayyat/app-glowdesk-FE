import React, { useRef, useEffect } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseInput } from '../../../components/base/BaseInput';
import { BaseLabel } from '../../../components/base/BaseLabel';
import { BaseDrawer } from '../../../components/base/BaseDrawer';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { inventoryFormInputSchema } from '../../../lib/validations';
import { toast } from 'sonner';
import { BaseSelect, BaseSelectItem } from '../../../components/base/BaseSelect';
import { Textarea } from '../../../components/ui/textarea';
import { getFieldError, hasFieldError } from '../../../hooks/useFormValidation';

interface InventoryType {
  type_id: string;
  name: string;
  order: number;
}

interface Manufacturer {
  manufacturer_id: string;
  name: string;
  order: number;
}

interface InventoryItem {
  item_id: string;
  name: string;
  type: string;
  manufacturer: string;
  manufacturer_id: string;
  sku: string;
  cost_price: number;
  retail_price: number | null;
  serial_number: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface AddEditInventoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  editingItem: InventoryItem | null;
  types: InventoryType[];
  manufacturers: Manufacturer[];
  onInventoryCreated: (inventory: InventoryItem) => void;
  onInventoryUpdated: (inventory: InventoryItem) => void;
  onAddType: () => void;
  onAddManufacturer: () => void;
}

export const AddEditInventoryDrawer: React.FC<AddEditInventoryDrawerProps> = ({
  open,
  onOpenChange,
  isEditing,
  editingItem,
  types,
  manufacturers,
  onInventoryCreated,
  onInventoryUpdated,
  onAddType,
  onAddManufacturer
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inventoryForm = useFormValidation(inventoryFormInputSchema);

  // Reset form when drawer opens/closes or editing item changes
  useEffect(() => {
    if (!open) {
      inventoryForm.reset();
    } else if (editingItem && isEditing) {
      inventoryForm.reset({
        name: editingItem.name,
        type: editingItem.type,
        manufacturer: editingItem.manufacturer,
        manufacturer_id: editingItem.manufacturer_id,
        sku: editingItem.sku,
        cost_price: editingItem.cost_price.toString(),
        retail_price: editingItem.retail_price?.toString() || '',
        serial_number: editingItem.serial_number,
        notes: editingItem.notes || ''
      });
    }
  }, [open, editingItem, isEditing, inventoryForm]);

  const handleSubmit = async () => {
    const isValid = await inventoryForm.trigger();
    if (!isValid) return;

    const formData = inventoryForm.getValues();
    
    const inventoryData: InventoryItem = {
      item_id: isEditing && editingItem ? editingItem.item_id : `INV-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      manufacturer: formData.manufacturer,
      manufacturer_id: formData.manufacturer_id,
      sku: formData.sku,
      cost_price: formData.cost_price && !isNaN(parseFloat(formData.cost_price)) ? parseFloat(formData.cost_price) : 0,
      retail_price: formData.retail_price && !isNaN(parseFloat(formData.retail_price)) ? parseFloat(formData.retail_price) : null,
      serial_number: formData.serial_number,
      notes: formData.notes,
      status: 'active',
      created_at: isEditing && editingItem ? editingItem.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isEditing) {
      onInventoryUpdated(inventoryData);
      toast.success('Inventory item updated successfully');
    } else {
      onInventoryCreated(inventoryData);
      toast.success('Inventory item created successfully');
    }

    onOpenChange(false);
    inventoryForm.reset();
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Inventory' : 'Create New Inventory'}
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
            onClick={handleSubmit}
            className="flex-1"
          >
            {isEditing ? 'Update Inventory' : 'Create Inventory'}
          </BaseButton>
        </div>
      }
    >
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          {/* Type */}
          <div>
            <BaseLabel htmlFor="type">Type *</BaseLabel>
            <BaseSelect
              value={inventoryForm.watch('type')}
              onValueChange={(value) => {
                if (value === 'add_new_type') {
                  onOpenChange(false);
                  onAddType();
                  return;
                }
                inventoryForm.setValue('type', value);
                // Find manufacturer_id for the selected type
                const selectedType = types.find(t => t.name === value);
                if (selectedType) {
                  inventoryForm.setValue('manufacturer_id', selectedType.type_id);
                }
              }}
              className={hasFieldError(inventoryForm.formState.errors, 'type') ? 'border-red-500' : ''}
              placeholder="Select type"
            >
              {types.map((type) => (
                <BaseSelectItem key={type.type_id} value={type.name}>
                  {type.name}
                </BaseSelectItem>
              ))}
              <BaseSelectItem value="add_new_type">
                + Add New Type
              </BaseSelectItem>
            </BaseSelect>
            {getFieldError(inventoryForm.formState.errors, 'type') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(inventoryForm.formState.errors, 'type')}</p>
            )}
          </div>

          {/* Manufacturer */}
          <div>
            <BaseLabel htmlFor="manufacturer">Manufacturer *</BaseLabel>
            <BaseSelect
              value={inventoryForm.watch('manufacturer')}
              onValueChange={(value) => {
                if (value === 'add_new_manufacturer') {
                  onOpenChange(false);
                  onAddManufacturer();
                  return;
                }
                inventoryForm.setValue('manufacturer', value);
                // Find manufacturer_id for the selected manufacturer
                const selectedManufacturer = manufacturers.find(m => m.name === value);
                if (selectedManufacturer) {
                  inventoryForm.setValue('manufacturer_id', selectedManufacturer.manufacturer_id);
                }
              }}
              className={hasFieldError(inventoryForm.formState.errors, 'manufacturer') ? 'border-red-500' : ''}
              placeholder="Select manufacturer"
            >
              {manufacturers.map((manufacturer) => (
                <BaseSelectItem key={manufacturer.manufacturer_id} value={manufacturer.name}>
                  {manufacturer.name}
                </BaseSelectItem>
              ))}
              <BaseSelectItem value="add_new_manufacturer">
                + Add New Manufacturer
              </BaseSelectItem>
            </BaseSelect>
            {getFieldError(inventoryForm.formState.errors, 'manufacturer') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(inventoryForm.formState.errors, 'manufacturer')}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <BaseLabel htmlFor="name">Name *</BaseLabel>
            <BaseInput
              id="name"
              {...inventoryForm.register('name')}
              className={hasFieldError(inventoryForm.formState.errors, 'name') ? 'border-red-500' : ''}
            />
            {getFieldError(inventoryForm.formState.errors, 'name') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(inventoryForm.formState.errors, 'name')}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <BaseLabel htmlFor="sku">SKU *</BaseLabel>
            <BaseInput
              id="sku"
              {...inventoryForm.register('sku')}
              className={hasFieldError(inventoryForm.formState.errors, 'sku') ? 'border-red-500' : ''}
            />
            {getFieldError(inventoryForm.formState.errors, 'sku') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(inventoryForm.formState.errors, 'sku')}</p>
            )}
          </div>

          {/* Cost Price */}
          <div>
            <BaseLabel htmlFor="cost_price">Cost Price *</BaseLabel>
            <BaseInput
              id="cost_price"
              type="number"
              step="0.01"
              {...inventoryForm.register('cost_price')}
              className={hasFieldError(inventoryForm.formState.errors, 'cost_price') ? 'border-red-500' : ''}
            />
            {getFieldError(inventoryForm.formState.errors, 'cost_price') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(inventoryForm.formState.errors, 'cost_price')}</p>
            )}
          </div>

          {/* Retail Price */}
          <div>
            <BaseLabel htmlFor="retail_price">Retail Price</BaseLabel>
            <BaseInput
              id="retail_price"
              type="number"
              step="0.01"
              {...inventoryForm.register('retail_price')}
              className={hasFieldError(inventoryForm.formState.errors, 'retail_price') ? 'border-red-500' : ''}
            />
            {getFieldError(inventoryForm.formState.errors, 'retail_price') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(inventoryForm.formState.errors, 'retail_price')}</p>
            )}
          </div>

          {/* Serial Number */}
          <div>
            <BaseLabel htmlFor="serial_number">Serial Number *</BaseLabel>
            <BaseInput
              id="serial_number"
              {...inventoryForm.register('serial_number')}
              className={hasFieldError(inventoryForm.formState.errors, 'serial_number') ? 'border-red-500' : ''}
            />
            {getFieldError(inventoryForm.formState.errors, 'serial_number') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(inventoryForm.formState.errors, 'serial_number')}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <BaseLabel htmlFor="notes">Notes</BaseLabel>
            <Textarea
              id="notes"
              {...inventoryForm.register('notes')}
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>
        </div>
      </form>
    </BaseDrawer>
  );
}; 