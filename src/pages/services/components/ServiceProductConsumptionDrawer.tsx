import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { useServicesStore } from '@/stores/servicesStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { ServiceProductConsumption, Service } from '@/types/service';
import { Plus, Trash2, Package, AlertCircle } from 'lucide-react';
import { BaseBadge } from '@/components/base/BaseBadge';
import { ScrollArea } from '@/components/ui/scroll-area';

const consumptionSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantityPerService: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitOfMeasure: z.string().min(1, 'Unit is required'),
  isRequired: z.boolean(),
  notes: z.string().optional(),
});

type ConsumptionFormData = z.infer<typeof consumptionSchema>;

interface ServiceProductConsumptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}

const UNITS_OF_MEASURE = [
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'tube', label: 'Tube' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'packet', label: 'Packet' },
  { value: 'unit', label: 'Unit' },
  { value: 'sheet', label: 'Sheet' },
  { value: 'pair', label: 'Pair' },
];

export function ServiceProductConsumptionDrawer({
  open,
  onOpenChange,
  service,
}: ServiceProductConsumptionDrawerProps) {
  const { 
    productConsumptions, 
    addProductConsumption, 
    updateProductConsumption, 
    deleteProductConsumption,
    getProductConsumptionsForService 
  } = useServicesStore();
  const { items: inventoryItems } = useInventoryStore();
  
  const [editingConsumption, setEditingConsumption] = useState<ServiceProductConsumption | null>(null);
  const [showForm, setShowForm] = useState(false);

  const serviceConsumptions = service ? getProductConsumptionsForService(service.id) : [];

  const form = useForm<ConsumptionFormData>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      productId: '',
      quantityPerService: 1,
      unitOfMeasure: 'unit',
      isRequired: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (editingConsumption) {
      form.reset({
        productId: editingConsumption.productId,
        quantityPerService: editingConsumption.quantityPerService,
        unitOfMeasure: editingConsumption.unitOfMeasure,
        isRequired: editingConsumption.isRequired,
        notes: editingConsumption.notes || '',
      });
      setShowForm(true);
    } else {
      form.reset({
        productId: '',
        quantityPerService: 1,
        unitOfMeasure: 'unit',
        isRequired: true,
        notes: '',
      });
    }
  }, [editingConsumption, open]);

  const handleSubmit = (data: ConsumptionFormData) => {
    if (!service) return;

    const selectedProduct = inventoryItems.find(item => item.id === data.productId);
    if (!selectedProduct) {
      toast.error('Selected product not found');
      return;
    }

    const now = new Date().toISOString();
    const consumption: ServiceProductConsumption = {
      id: editingConsumption?.id || `pc_${Date.now()}`,
      serviceId: service.id,
      productId: data.productId,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      quantityPerService: data.quantityPerService,
      unitOfMeasure: data.unitOfMeasure,
      isRequired: data.isRequired,
      notes: data.notes,
      createdAt: editingConsumption?.createdAt || now,
      updatedAt: now,
    };

    if (editingConsumption) {
      updateProductConsumption(editingConsumption.id, consumption);
      toast.success('Product consumption updated');
    } else {
      addProductConsumption(consumption);
      toast.success('Product consumption added');
    }

    setEditingConsumption(null);
    setShowForm(false);
    form.reset();
  };

  const handleDelete = (id: string) => {
    deleteProductConsumption(id);
    toast.success('Product consumption removed');
  };

  const handleEdit = (consumption: ServiceProductConsumption) => {
    setEditingConsumption(consumption);
  };

  const handleCancel = () => {
    setEditingConsumption(null);
    setShowForm(false);
    form.reset();
  };

  const getProductStock = (productId: string): number => {
    const item = inventoryItems.find(i => i.id === productId);
    return item?.currentStock || 0;
  };

  const calculateEstimatedServices = (productId: string, quantityPerService: number): number => {
    const stock = getProductStock(productId);
    return Math.floor(stock / quantityPerService);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={service ? `Product Consumption - ${service.name}` : 'Product Consumption'}
      width={600}
    >
      <div className="flex flex-col h-full">
        <p className="text-sm text-muted-foreground mb-4">
          Configure which products are consumed when this service is performed. 
          Inventory will be automatically deducted when the service is completed.
        </p>
        {!showForm ? (
          <>
            <div className="mb-4">
              <BaseButton
                onClick={() => setShowForm(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </BaseButton>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {serviceConsumptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No products linked to this service</p>
                    <p className="text-sm">Add products that are consumed when this service is performed</p>
                  </div>
                ) : (
                  serviceConsumptions.map((consumption) => {
                    const stock = getProductStock(consumption.productId);
                    const estimatedServices = calculateEstimatedServices(
                      consumption.productId,
                      consumption.quantityPerService
                    );
                    const isLowStock = estimatedServices < 5;

                    return (
                      <div
                        key={consumption.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{consumption.productName}</span>
                              {consumption.isRequired && (
                                <BaseBadge variant="default" size="sm">Required</BaseBadge>
                              )}
                              {isLowStock && (
                                <BaseBadge variant="destructive" size="sm" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Low Stock
                                </BaseBadge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>SKU: {consumption.productSku}</p>
                              <p>
                                Quantity: {consumption.quantityPerService} {consumption.unitOfMeasure} per service
                              </p>
                              <p>
                                Current stock: {stock} | Est. {estimatedServices} services remaining
                              </p>
                              {consumption.notes && (
                                <p className="italic">Note: {consumption.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <BaseButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(consumption)}
                            >
                              Edit
                            </BaseButton>
                            <BaseButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(consumption.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </BaseButton>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {serviceConsumptions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Total products consumed per service:</p>
                  <ul className="list-disc list-inside">
                    {serviceConsumptions.map((c) => (
                      <li key={c.id}>
                        {c.quantityPerService} {c.unitOfMeasure} of {c.productName}
                        {c.isRequired ? ' (required)' : ' (optional)'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <BaseLabel htmlFor="productId">Product *</BaseLabel>
              <BaseSelect
                value={form.watch('productId')}
                onValueChange={(value) => form.setValue('productId', value)}
              >
                <BaseSelectItem value="">Select a product</BaseSelectItem>
                {inventoryItems
                  .filter(item => item.status === 'active')
                  .map((item) => (
                    <BaseSelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Stock: {item.currentStock}
                    </BaseSelectItem>
                  ))}
              </BaseSelect>
              {form.formState.errors.productId && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.productId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <BaseLabel htmlFor="quantityPerService">Quantity per Service *</BaseLabel>
                <BaseInput
                  id="quantityPerService"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...form.register('quantityPerService', { valueAsNumber: true })}
                  error={form.formState.errors.quantityPerService?.message}
                />
              </div>

              <div>
                <BaseLabel htmlFor="unitOfMeasure">Unit of Measure *</BaseLabel>
                <BaseSelect
                  value={form.watch('unitOfMeasure')}
                  onValueChange={(value) => form.setValue('unitOfMeasure', value)}
                >
                  {UNITS_OF_MEASURE.map((unit) => (
                    <BaseSelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </BaseSelectItem>
                  ))}
                </BaseSelect>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <BaseLabel htmlFor="isRequired" className="cursor-pointer">Required Product</BaseLabel>
                <p className="text-sm text-muted-foreground">
                  Required products must be available for the service to be completed
                </p>
              </div>
              <Switch
                id="isRequired"
                checked={form.watch('isRequired')}
                onCheckedChange={(checked) => form.setValue('isRequired', checked)}
              />
            </div>

            <div>
              <BaseLabel htmlFor="notes">Notes</BaseLabel>
              <BaseInput
                id="notes"
                placeholder="Optional notes about this product usage"
                {...form.register('notes')}
              />
            </div>

            {form.watch('productId') && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Stock Information</p>
                <p className="text-sm text-muted-foreground">
                  Current stock: {getProductStock(form.watch('productId'))} units
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimated services: {calculateEstimatedServices(
                    form.watch('productId'),
                    form.watch('quantityPerService') || 1
                  )} with current stock
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <BaseButton type="submit">
                {editingConsumption ? 'Update' : 'Add'} Product
              </BaseButton>
              <BaseButton type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </BaseButton>
            </div>
          </form>
        )}
      </div>
    </BaseDrawer>
  );
}
