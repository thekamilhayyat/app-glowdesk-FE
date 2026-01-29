/**
 * Public Salons API endpoints
 * Mock implementation for public booking widget
 */

import { apiRequest, ApiResponse } from '../client';

export interface Salon {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  timezone: string;
  isActive: boolean;
}

// Mock salon data
const mockSalons: Salon[] = [
  {
    id: 'salon-1',
    slug: 'glow-salon',
    name: 'Glow Salon',
    logo: '/logo.svg',
    description: 'Premium beauty salon offering hair, nails, and skincare services',
    phone: '+1 (555) 123-4567',
    email: 'info@glowsalon.com',
    address: '123 Beauty Street, New York, NY 10001',
    businessHours: {
      monday: { open: '09:00', close: '18:00', isClosed: false },
      tuesday: { open: '09:00', close: '18:00', isClosed: false },
      wednesday: { open: '09:00', close: '18:00', isClosed: false },
      thursday: { open: '09:00', close: '18:00', isClosed: false },
      friday: { open: '09:00', close: '18:00', isClosed: false },
      saturday: { open: '10:00', close: '16:00', isClosed: false },
      sunday: { open: '10:00', close: '16:00', isClosed: false },
    },
    timezone: 'America/New_York',
    isActive: true,
  },
  {
    id: 'salon-2',
    slug: 'elite-spa',
    name: 'Elite Spa & Salon',
    logo: '/logo.svg',
    description: 'Luxury spa experience with expert stylists',
    phone: '+1 (555) 987-6543',
    email: 'hello@elitespa.com',
    address: '456 Luxury Avenue, Los Angeles, CA 90001',
    businessHours: {
      monday: { open: '10:00', close: '19:00', isClosed: false },
      tuesday: { open: '10:00', close: '19:00', isClosed: false },
      wednesday: { open: '10:00', close: '19:00', isClosed: false },
      thursday: { open: '10:00', close: '19:00', isClosed: false },
      friday: { open: '10:00', close: '19:00', isClosed: false },
      saturday: { open: '09:00', close: '17:00', isClosed: false },
      sunday: { open: '11:00', close: '17:00', isClosed: false },
    },
    timezone: 'America/Los_Angeles',
    isActive: true,
  },
];

/**
 * GET /public/salons/:slug
 * Get salon by slug
 */
export const getSalonBySlug = async (slug: string): Promise<ApiResponse<{ salon: Salon }>> => {
  return apiRequest(async () => {
    const salon = mockSalons.find((s) => s.slug === slug && s.isActive);

    if (!salon) {
      throw new Error('Salon not found');
    }

    return { salon };
  });
};
