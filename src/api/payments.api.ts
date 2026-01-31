/**
 * Payments API endpoints
 * Stripe payment integration
 */

import { ApiResponse, createApiError } from './client';
import { apiFetch } from './http';

/**
 * Currency types supported
 */
export type PaymentCurrency = 'usd' | 'eur' | 'gbp';

/**
 * Create Payment Intent Request
 * Frontend sends amount in DECIMAL (e.g., 50.00 for $50.00)
 * Backend converts to cents internally
 */
export interface CreatePaymentIntentRequest {
  appointmentId: string;
  amount: number; // Amount in decimal (e.g., 50.00 = $50.00)
  currency: PaymentCurrency;
}

/**
 * Payment Intent Response
 * Backend returns amount in DECIMAL (e.g., 50.00)
 * Matches backend contract exactly
 */
export interface PaymentIntentResponse {
  paymentId: string;
  clientSecret: string;
  amount: number; // Amount in decimal (e.g., 50.00)
  currency: PaymentCurrency;
  status: 'PENDING';
  // paymentIntentId may be included for confirm endpoint, or extracted from clientSecret
  paymentIntentId?: string;
}

/**
 * Confirm Payment Request
 */
export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  appointmentId: string;
}

/**
 * Payment Response
 * Backend returns amount in DECIMAL (e.g., 50.00)
 */
export interface PaymentResponse {
  id: string;
  paymentIntentId: string;
  appointmentId: string;
  amount: number; // Amount in decimal (e.g., 50.00)
  currency: PaymentCurrency;
  status: 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  createdAt: string;
}


/**
 * POST /api/payments/create-intent
 * Create a payment intent for an appointment
 */
export const createPaymentIntent = async (
  request: CreatePaymentIntentRequest
): Promise<ApiResponse<PaymentIntentResponse>> => {
  try {
    const data = await apiFetch<PaymentIntentResponse>('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return { data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    
    // Handle specific error codes
    if (errorMessage.includes('PAYMENT_ALREADY_EXISTS')) {
      return createApiError(
        'PAYMENT_ALREADY_EXISTS',
        'A payment already exists for this appointment.'
      );
    }
    
    if (errorMessage.includes('UNSUPPORTED_CURRENCY')) {
      return createApiError(
        'UNSUPPORTED_CURRENCY',
        'The specified currency is not supported.'
      );
    }

    return createApiError(
      'FETCH_ERROR',
      errorMessage
    );
  }
};

/**
 * POST /api/payments/confirm
 * Confirm a payment after Stripe confirmation
 */
export const confirmPayment = async (
  request: ConfirmPaymentRequest
): Promise<ApiResponse<PaymentResponse>> => {
  try {
    const data = await apiFetch<PaymentResponse>('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return { data };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to confirm payment'
    );
  }
};
