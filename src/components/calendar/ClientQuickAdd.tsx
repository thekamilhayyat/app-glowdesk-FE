import { useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseButton } from '@/components/base/BaseButton';
import PhoneInput from 'react-phone-number-input';
import { Client } from '@/types/client';
import 'react-phone-number-input/style.css';

interface ClientQuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded: (client: Client) => void;
  existingClients: Client[];
}

export function ClientQuickAdd({
  open,
  onOpenChange,
  onClientAdded,
  existingClients,
}: ClientQuickAddProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      phone: value || ''
    }));
    setErrors(prev => ({
      ...prev,
      phone: ''
    }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      email: '',
      phone: ''
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email address';
        isValid = false;
      } else if (existingClients.some(client => client.email === formData.email)) {
        newErrors.email = 'A client with this email already exists';
        isValid = false;
      }
    }

    // Validate phone
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      isNew: true,
      isMember: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onClientAdded(newClient);
    
    // Reset form
    setFormData({ name: '', email: '', phone: '' });
    setErrors({ name: '', email: '', phone: '' });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '' });
    setErrors({ name: '', email: '', phone: '' });
    onOpenChange(false);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Client"
      footer={
        <div className="flex gap-3 w-full">
          <BaseButton 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1"
            data-testid="button-cancel-client"
          >
            Cancel
          </BaseButton>
          <BaseButton 
            type="submit" 
            variant="gradient" 
            className="flex-1"
            onClick={handleSubmit}
            data-testid="button-save-client"
          >
            Add Client
          </BaseButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <BaseLabel htmlFor="name">Name *</BaseLabel>
          <BaseInput
            id="name"
            name="name"
            placeholder="Enter client name"
            value={formData.name}
            onChange={handleInputChange}
            required
            data-testid="input-client-name"
          />
          {errors.name && (
            <p className="text-sm text-red-600" data-testid="error-client-name">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <BaseLabel htmlFor="email">Email *</BaseLabel>
          <BaseInput
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleInputChange}
            required
            data-testid="input-client-email"
          />
          {errors.email && (
            <p className="text-sm text-red-600" data-testid="error-client-email">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <BaseLabel htmlFor="phone">Phone Number *</BaseLabel>
          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry="US"
            value={formData.phone}
            onChange={handlePhoneChange}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_input]:bg-transparent"
            data-testid="input-client-phone"
          />
          {errors.phone && (
            <p className="text-sm text-red-600" data-testid="error-client-phone">{errors.phone}</p>
          )}
        </div>
      </form>
    </BaseDrawer>
  );
}
