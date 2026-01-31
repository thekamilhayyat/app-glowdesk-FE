/**
 * Payment Modal Component
 * Stripe payment integration for appointments
 * 
 * MVP Requirements:
 * - Stripe Elements only
 * - No saved cards
 * - No subscriptions
 * - No retries
 * - Backend is source of truth
 */

import { useState, FormEvent } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { createPaymentIntent, confirmPayment, PaymentCurrency, PaymentResponse } from '@/api/payments.api';
import { hasError, extractData } from '@/api/client';

export interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  amount: number; // Amount in decimal (e.g., 50.00 = $50.00)
  currency: PaymentCurrency;
  onSuccess: (payment: PaymentResponse) => void;
  onFailure: (error: Error) => void;
}

type PaymentState = 'idle' | 'creating_intent' | 'confirming' | 'succeeded' | 'failed';

export function PaymentModal({
  open,
  onOpenChange,
  appointmentId,
  amount,
  currency,
  onSuccess,
  onFailure,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [state, setState] = useState<PaymentState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Format amount for display
   * Amount is already in decimal format (e.g., 50.00)
   */
  const formatAmount = (amount: number, curr: PaymentCurrency): string => {
    const currencySymbols: Record<PaymentCurrency, string> = {
      usd: '$',
      eur: '€',
      gbp: '£',
    };
    return `${currencySymbols[curr]}${amount.toFixed(2)}`;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Prevent double-submit
    if (isSubmitting || state !== 'idle') {
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create payment intent
      setState('creating_intent');
      setError(null);

      const intentResponse = await createPaymentIntent({
        appointmentId,
        amount,
        currency,
      });

      if (hasError(intentResponse)) {
        const errorCode = intentResponse.error?.code;
        const errorMessage = intentResponse.error?.message || 'Failed to create payment intent';

        // Handle specific error codes
        if (errorCode === 'PAYMENT_ALREADY_EXISTS') {
          setError('A payment already exists for this appointment.');
          setState('failed');
          onFailure(new Error(errorMessage));
          return;
        }

        if (errorCode === 'UNSUPPORTED_CURRENCY') {
          setError('The specified currency is not supported.');
          setState('failed');
          onFailure(new Error(errorMessage));
          return;
        }

        setError(errorMessage);
        setState('failed');
        onFailure(new Error(errorMessage));
        return;
      }

      const intentData = extractData(intentResponse);
      setClientSecret(intentData.clientSecret);
      
      // Extract paymentIntentId from clientSecret if not provided
      // Stripe clientSecret format: "pi_xxx_secret_xxx"
      // We need "pi_xxx" for confirm endpoint
      const extractedPaymentIntentId = intentData.paymentIntentId || 
        (intentData.clientSecret?.split('_secret_')[0] || null);
      setPaymentIntentId(extractedPaymentIntentId);

      // Step 2: Confirm payment with Stripe
      setState('confirming');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        // Handle Stripe card errors
        const errorMessage = stripeError.message || 'Payment failed. Please try again.';
        setError(errorMessage);
        setState('failed');
        onFailure(new Error(errorMessage));
        return;
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        const errorMessage = 'Payment was not successful. Please try again.';
        setError(errorMessage);
        setState('failed');
        onFailure(new Error(errorMessage));
        return;
      }

      // Step 3: Confirm payment with backend
      const confirmResponse = await confirmPayment({
        paymentIntentId: intentData.paymentIntentId,
        appointmentId,
      });

      if (hasError(confirmResponse)) {
        const errorMessage = confirmResponse.error?.message || 'Failed to confirm payment';
        setError(errorMessage);
        setState('failed');
        onFailure(new Error(errorMessage));
        return;
      }

      const paymentData = extractData(confirmResponse);
      setPayment(paymentData);
      setState('succeeded');
      setIsSubmitting(false);

      // Step 4: Call success callback
      setTimeout(() => {
        onSuccess(paymentData);
        handleClose();
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setState('failed');
      setIsSubmitting(false);
      onFailure(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (state === 'creating_intent' || state === 'confirming' || isSubmitting) {
      // Don't allow closing during processing
      return;
    }

    // Reset state
    setState('idle');
    setError(null);
    setClientSecret(null);
    setPaymentIntentId(null);
    setPayment(null);
    setIsSubmitting(false);
    
    onOpenChange(false);
  };

  /**
   * Handle retry (manual only)
   */
  const handleRetry = () => {
    setState('idle');
    setError(null);
    setClientSecret(null);
    setPaymentIntentId(null);
    setIsSubmitting(false);
  };

  const isProcessing = state === 'creating_intent' || state === 'confirming' || isSubmitting;
  const isDisabled = isProcessing || !stripe || !elements;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Pay {formatAmount(amount, currency)} for this appointment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success State */}
          {state === 'succeeded' && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Payment successful! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {state === 'failed' && error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Form */}
          {state !== 'succeeded' && (
            <>
              {/* Amount Display (Read-only) */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold">{formatAmount(amount, currency)}</span>
                </div>
              </div>

              {/* Card Element */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Details</label>
                <div className="rounded-lg border bg-background p-4">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: 'var(--foreground)',
                          '::placeholder': {
                            color: 'var(--muted-foreground)',
                          },
                        },
                        invalid: {
                          color: 'var(--destructive)',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Loading State */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {state === 'creating_intent' && 'Creating payment...'}
                {state === 'confirming' && 'Processing payment...'}
              </span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {state === 'failed' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRetry}
                disabled={isProcessing}
              >
                Try Again
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              {state === 'succeeded' ? 'Close' : 'Cancel'}
            </Button>
            {state !== 'succeeded' && state !== 'failed' && (
              <Button
                type="submit"
                disabled={isDisabled}
                className="min-w-[100px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatAmount(amount, currency)}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
