import React, { useRef } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseInput } from '../../../components/base/BaseInput';
import { BaseLabel } from '../../../components/base/BaseLabel';
import { BaseDrawer } from '../../../components/base/BaseDrawer';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { manufacturerFormSchema } from '../../../lib/validations';
import { toast } from 'sonner';
import { getFieldError, hasFieldError } from '../../../hooks/useFormValidation';

interface AddManufacturerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManufacturerCreated: (name: string) => void;
}

export const AddManufacturerDrawer: React.FC<AddManufacturerDrawerProps> = ({
  open,
  onOpenChange,
  onManufacturerCreated
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const manufacturerForm = useFormValidation(manufacturerFormSchema);

  const handleSubmit = async () => {
    const isValid = await manufacturerForm.trigger();
    if (!isValid) return;

    const formData = manufacturerForm.getValues();
    onManufacturerCreated(formData.name);
    onOpenChange(false);
    manufacturerForm.reset();
    toast.success('Manufacturer created successfully');
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Manufacturer"
    >
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          <div>
            <BaseLabel htmlFor="manufacturer_name">Manufacturer Name *</BaseLabel>
            <BaseInput
              id="manufacturer_name"
              {...manufacturerForm.register('name')}
              className={hasFieldError(manufacturerForm.formState.errors, 'name') ? 'border-red-500' : ''}
            />
            {getFieldError(manufacturerForm.formState.errors, 'name') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(manufacturerForm.formState.errors, 'name')}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
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
            Create Manufacturer
          </BaseButton>
        </div>
      </form>
    </BaseDrawer>
  );
}; 