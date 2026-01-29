/**
 * Stripe Provider Component
 * Wraps the app with Stripe Elements provider
 * 
 * MVP Requirements:
 * - Stripe Elements only
 * - No saved cards
 * - No subscriptions
 * - No retries
 * - Backend is source of truth
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode, useMemo } from 'react';

interface StripeProviderProps {
  children: ReactNode;
}

/**
 * Get Stripe publishable key from environment
 * Fails fast if missing
 */
const getStripePublishableKey = (): string => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      'VITE_STRIPE_PUBLISHABLE_KEY is not set. Please add it to your .env file.'
    );
  }

  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error(
      'VITE_STRIPE_PUBLISHABLE_KEY must be a non-empty string.'
    );
  }

  return key;
};

/**
 * Initialize Stripe instance
 * Memoized to prevent re-initialization on re-renders
 */
let stripePromise: Promise<Stripe | null> | null = null;

const getStripePromise = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = getStripePublishableKey();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

/**
 * StripeProvider Component
 * Provides Stripe Elements context to the application
 */
export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const stripePromise = useMemo(() => getStripePromise(), []);

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
