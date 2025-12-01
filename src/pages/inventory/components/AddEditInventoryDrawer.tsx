import React, { useRef, useEffect } from 'react';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { useFormValidation } from '@/hooks/useFormValidation';
import { inventoryFormInputSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { Textarea } from '@/components/ui/textarea';
import { getFieldError, hasFieldError } from '@/hooks/useFormValidation';
import { Checkbox } from '@/components/ui/checkbox';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem, InventoryType, Manufacturer, Supplier } from '@/types/inventory';

interface AddEditInventoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  editingItem: InventoryItem | null;
  onAddType: () => void;
  onAddManufacturer: () => void;
  onAddSupplier?: () => void;
}

export const AddEditInventoryDrawer: React.FC<AddEditInventoryDrawerProps> = ({
  open,
  onOpenChange,
  isEditing,
  editingItem,
  onAddType,
  onAddManufacturer,
  onAddSupplier
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inventoryForm = useFormValidation(inventoryFormInputSchema);
  const { types, manufacturers, suppliers, addItem, updateItem } = useInventoryStore();

  useEffect(() => {
    if (!open) {
      inventoryForm.reset();
    } else if (editingItem && isEditing) {
      inventoryForm.reset({
        name: editingItem.name,
        type: editingItem.type,
        manufacturer: editingItem.manufacturer,
        manufacturer_id: editingItem.manufacturerId || '',
        sku: editingItem.sku,
        barcode: editingItem.barcode || '',
        cost_price: editingItem.costPrice.toString(),
        retail_price: editingItem.retailPrice?.toString() || '',
        current_stock: editingItem.currentStock.toString(),
        low_stock_threshold: editingItem.lowStockThreshold.toString(),
        reorder_quantity: editingItem.reorderQuantity.toString(),
        reorder_point: editingItem.reorderPoint.toString(),
        unit_of_measure: editingItem.unitOfMeasure || 'unit',
        supplier_id: editingItem.supplierId || '',
        is_retail: editingItem.isRetail,
        is_back_bar: editingItem.isBackBar,
        track_stock: editingItem.trackStock,
        taxable: editingItem.taxable,
        notes: editingItem.notes || ''
      });
    } else {
      inventoryForm.reset({
        name: '',
        type: '',
        manufacturer: '',
        manufacturer_id: '',
        sku: '',
        barcode: '',
        cost_price: '',
        retail_price: '',
        current_stock: '0',
        low_stock_threshold: '5',
        reorder_quantity: '10',
        reorder_point: '5',
        unit_of_measure: 'unit',
        supplier_id: '',
        is_retail: true,
        is_back_bar: false,
        track_stock: true,
        taxable: true,
        notes: ''
      });
    }
  }, [open, editingItem, isEditing, inventoryForm]);

  const handleSubmit = async () => {
    const isValid = await inventoryForm.trigger();
    if (!isValid) return;

    const formData = inventoryForm.getValues();
    const supplier = suppliers.find(s => s.id === formData.supplier_id);
    
    const inventoryData: InventoryItem = {
      id: isEditing && editingItem ? editingItem.id : `inv_${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode || undefined,
      type: formData.type,
      typeId: types.find(t => t.name === formData.type)?.type_id,
      manufacturer: formData.manufacturer,
      manufacturerId: formData.manufacturer_id,
      supplierId: formData.supplier_id || undefined,
      costPrice: parseFloat(formData.cost_price) || 0,
      retailPrice: formData.retail_price ? parseFloat(formData.retail_price) : null,
      currentStock: parseInt(formData.current_stock) || 0,
      lowStockThreshold: parseInt(formData.low_stock_threshold) || 5,
      reorderQuantity: parseInt(formData.reorder_quantity) || 10,
      reorderPoint: parseInt(formData.reorder_point) || 5,
      unitOfMeasure: formData.unit_of_measure || 'unit',
      isRetail: formData.is_retail ?? true,
      isBackBar: formData.is_back_bar ?? false,
      trackStock: formData.track_stock ?? true,
      allowNegativeStock: false,
      taxable: formData.taxable ?? true,
      notes: formData.notes,
      status: 'active',
      createdAt: isEditing && editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing && editingItem) {
      updateItem(editingItem.id, inventoryData);
      toast.success('Inventory item updated successfully');
    } else {
      addItem(inventoryData);
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <BaseLabel htmlFor="sku">SKU *</BaseLabel>
              <BaseInput
                id="sku"
                {...inventoryForm.register('sku')}
                className={hasFieldError(inventoryForm.formState.errors, 'sku') ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <BaseLabel htmlFor="barcode">Barcode</BaseLabel>
              <BaseInput
                id="barcode"
                {...inventoryForm.register('barcode')}
                placeholder="Scan or enter barcode"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <BaseLabel htmlFor="cost_price">Cost Price *</BaseLabel>
              <BaseInput
                id="cost_price"
                type="number"
                step="0.01"
                {...inventoryForm.register('cost_price')}
                className={hasFieldError(inventoryForm.formState.errors, 'cost_price') ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <BaseLabel htmlFor="retail_price">Retail Price</BaseLabel>
              <BaseInput
                id="retail_price"
                type="number"
                step="0.01"
                {...inventoryForm.register('retail_price')}
              />
            </div>
          </div>

          <div>
            <BaseLabel htmlFor="supplier_id">Supplier</BaseLabel>
            <BaseSelect
              value={inventoryForm.watch('supplier_id') || ''}
              onValueChange={(value) => {
                if (value === 'add_new_supplier' && onAddSupplier) {
                  onOpenChange(false);
                  onAddSupplier();
                  return;
                }
                inventoryForm.setValue('supplier_id', value);
              }}
              placeholder="Select supplier (optional)"
            >
              <BaseSelectItem value="">No supplier</BaseSelectItem>
              {suppliers.filter(s => s.status === 'active').map((supplier) => (
                <BaseSelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </BaseSelectItem>
              ))}
              {onAddSupplier && (
                <BaseSelectItem value="add_new_supplier">
                  + Add New Supplier
                </BaseSelectItem>
              )}
            </BaseSelect>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Stock Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <BaseLabel htmlFor="current_stock">Current Stock</BaseLabel>
                <BaseInput
                  id="current_stock"
                  type="number"
                  min="0"
                  {...inventoryForm.register('current_stock')}
                />
              </div>
              <div>
                <BaseLabel htmlFor="unit_of_measure">Unit</BaseLabel>
                <BaseSelect
                  value={inventoryForm.watch('unit_of_measure') || 'unit'}
                  onValueChange={(value) => inventoryForm.setValue('unit_of_measure', value)}
                >
                  <BaseSelectItem value="unit">Unit</BaseSelectItem>
                  <BaseSelectItem value="bottle">Bottle</BaseSelectItem>
                  <BaseSelectItem value="tube">Tube</BaseSelectItem>
                  <BaseSelectItem value="box">Box</BaseSelectItem>
                  <BaseSelectItem value="pack">Pack</BaseSelectItem>
                  <BaseSelectItem value="ml">ml</BaseSelectItem>
                  <BaseSelectItem value="oz">oz</BaseSelectItem>
                </BaseSelect>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <BaseLabel htmlFor="low_stock_threshold">Low Stock Alert</BaseLabel>
                <BaseInput
                  id="low_stock_threshold"
                  type="number"
                  min="0"
                  {...inventoryForm.register('low_stock_threshold')}
                />
              </div>
              <div>
                <BaseLabel htmlFor="reorder_point">Reorder Point</BaseLabel>
                <BaseInput
                  id="reorder_point"
                  type="number"
                  min="0"
                  {...inventoryForm.register('reorder_point')}
                />
              </div>
              <div>
                <BaseLabel htmlFor="reorder_quantity">Reorder Qty</BaseLabel>
                <BaseInput
                  id="reorder_quantity"
                  type="number"
                  min="1"
                  {...inventoryForm.register('reorder_quantity')}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Product Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="track_stock"
                  checked={inventoryForm.watch('track_stock') ?? true}
                  onCheckedChange={(checked) => inventoryForm.setValue('track_stock', !!checked)}
                />
                <label htmlFor="track_stock" className="text-sm">
                  Track stock quantity
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_retail"
                  checked={inventoryForm.watch('is_retail') ?? true}
                  onCheckedChange={(checked) => inventoryForm.setValue('is_retail', !!checked)}
                />
                <label htmlFor="is_retail" className="text-sm">
                  Available for retail sale
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_back_bar"
                  checked={inventoryForm.watch('is_back_bar') ?? false}
                  onCheckedChange={(checked) => inventoryForm.setValue('is_back_bar', !!checked)}
                />
                <label htmlFor="is_back_bar" className="text-sm">
                  Back bar / professional use only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxable"
                  checked={inventoryForm.watch('taxable') ?? true}
                  onCheckedChange={(checked) => inventoryForm.setValue('taxable', !!checked)}
                />
                <label htmlFor="taxable" className="text-sm">
                  Taxable
                </label>
              </div>
            </div>
          </div>

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
