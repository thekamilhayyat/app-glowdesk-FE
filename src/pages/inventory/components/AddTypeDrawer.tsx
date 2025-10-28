import React, { useRef } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseInput } from '../../../components/base/BaseInput';
import { BaseLabel } from '../../../components/base/BaseLabel';
import { BaseDrawer } from '../../../components/base/BaseDrawer';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { typeFormSchema } from '../../../lib/validations';
import { toast } from 'sonner';
import { getFieldError, hasFieldError } from '../../../hooks/useFormValidation';

interface AddTypeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTypeCreated: (name: string) => void;
}

export const AddTypeDrawer: React.FC<AddTypeDrawerProps> = ({
  open,
  onOpenChange,
  onTypeCreated
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const typeForm = useFormValidation(typeFormSchema);

  const handleSubmit = async () => {
    const isValid = await typeForm.trigger();
    if (!isValid) return;

    const formData = typeForm.getValues();
    onTypeCreated(formData.name);
    onOpenChange(false);
    typeForm.reset();
    toast.success('Type created successfully');
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Type"
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
            Create Type
          </BaseButton>
        </div>
      }
    >
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          <div>
            <BaseLabel htmlFor="type_name">Type Name *</BaseLabel>
            <BaseInput
              id="type_name"
              {...typeForm.register('name')}
              className={hasFieldError(typeForm.formState.errors, 'name') ? 'border-red-500' : ''}
            />
            {getFieldError(typeForm.formState.errors, 'name') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError(typeForm.formState.errors, 'name')}</p>
            )}
          </div>
        </div>
      </form>
    </BaseDrawer>
  );
}; 