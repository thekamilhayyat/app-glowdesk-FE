/**
 * Booking Flow Page
 * Multi-step booking process
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicApp } from '../contexts/PublicAppContext';
import { ServiceSelection } from '../components/booking/ServiceSelection';
import { DateTimeSelection } from '../components/booking/DateTimeSelection';
import { CustomerDetails } from '../components/booking/CustomerDetails';
import { BookingConfirmation } from '../components/booking/BookingConfirmation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BookingStep = 'service' | 'datetime' | 'details' | 'confirmation';

export const BookingFlow = () => {
  const { salonSlug } = useParams<{ salonSlug: string }>();
  const navigate = useNavigate();
  const { bookingState, updateBookingState } = usePublicApp();
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');

  const handleBack = () => {
    if (currentStep === 'service') {
      navigate(`/salon/${salonSlug}`);
    } else if (currentStep === 'datetime') {
      setCurrentStep('service');
    } else if (currentStep === 'details') {
      setCurrentStep('datetime');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('details');
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    updateBookingState({ serviceId });
    setCurrentStep('datetime');
  };

  const handleDateTimeSelect = (date: string, timeSlot: { startTime: string; endTime: string }) => {
    updateBookingState({
      selectedDate: date,
      selectedTimeSlot: timeSlot,
    });
    setCurrentStep('details');
  };

  const handleDetailsSubmit = () => {
    setCurrentStep('confirmation');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'service':
        return 'Select a Service';
      case 'datetime':
        return 'Choose Date & Time';
      case 'details':
        return 'Your Details';
      case 'confirmation':
        return 'Confirm Booking';
      default:
        return 'Book Appointment';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
            <p className="text-sm text-muted-foreground">
              Step {['service', 'datetime', 'details', 'confirmation'].indexOf(currentStep) + 1} of 4
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center gap-2">
          {['service', 'datetime', 'details', 'confirmation'].map((step, index) => {
            const stepIndex = ['service', 'datetime', 'details', 'confirmation'].indexOf(currentStep);
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;

            return (
              <div key={step} className="flex flex-1 items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 'service' && (
            <ServiceSelection
              salonId={bookingState.salonId}
              onSelect={handleServiceSelect}
            />
          )}

          {currentStep === 'datetime' && bookingState.serviceId && (
            <DateTimeSelection
              salonId={bookingState.salonId}
              serviceId={bookingState.serviceId}
              onSelect={handleDateTimeSelect}
            />
          )}

          {currentStep === 'details' && bookingState.selectedTimeSlot && (
            <CustomerDetails
              onSubmit={handleDetailsSubmit}
              initialValues={bookingState.customerDetails}
            />
          )}

          {currentStep === 'confirmation' && (
            <BookingConfirmation bookingState={bookingState} />
          )}
        </div>
      </div>
    </div>
  );
};
