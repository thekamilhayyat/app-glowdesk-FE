/**
 * Customer Details Component
 * Step 3: Collect customer information
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicApp } from '../../contexts/PublicAppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const customerDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  notes: z.string().optional(),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Either email or phone number is required',
    path: ['email'],
  }
);

type CustomerDetailsForm = z.infer<typeof customerDetailsSchema>;

interface CustomerDetailsProps {
  onSubmit: () => void;
  initialValues?: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
}

export const CustomerDetails = ({ onSubmit, initialValues }: CustomerDetailsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateBookingState } = usePublicApp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerDetailsForm>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: initialValues || {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  const onSubmitForm = async (data: CustomerDetailsForm) => {
    setIsSubmitting(true);
    
    // Update context with customer details
    updateBookingState({
      customerDetails: {
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        notes: data.notes || '',
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 300);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Details</CardTitle>
        <CardDescription>
          Please provide your contact information to complete the booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-muted-foreground">(or phone)</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-muted-foreground">(or email)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests or Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any special requests or notes for your appointment..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Confirmation'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
