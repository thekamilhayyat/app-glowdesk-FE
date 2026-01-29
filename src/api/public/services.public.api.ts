/**
 * Public Services API endpoints
 * Mock implementation for public booking widget
 */

import { apiRequest, ApiResponse } from '../client';
import servicesData from '@/data/services.json';

export interface PublicService {
  id: string;
  name: string;
  description?: string;
  category: string;
  duration: number; // minutes
  price: number;
  isActive: boolean;
  imageUrl?: string;
}

/**
 * GET /public/salons/:salonId/services
 * Get active services for a salon
 */
export const getSalonServices = async (
  salonId: string
): Promise<ApiResponse<{ services: PublicService[] }>> => {
  return apiRequest(async () => {
    // In real app, would filter by salonId
    // For mock, return all active services
    const services: PublicService[] = servicesData.services
      .filter((s) => s.id) // Filter active services
      .map((s) => ({
        id: s.id,
        name: s.name,
        description: `${s.name} service`,
        category: s.category,
        duration: s.baseDuration,
        price: s.basePrice,
        isActive: true,
      }));

    return { services };
  });
};

/**
 * GET /public/services/:serviceId
 * Get single service details
 */
export const getPublicService = async (
  serviceId: string
): Promise<ApiResponse<{ service: PublicService }>> => {
  return apiRequest(async () => {
    const serviceData = servicesData.services.find((s) => s.id === serviceId);

    if (!serviceData) {
      throw new Error('Service not found');
    }

    const service: PublicService = {
      id: serviceData.id,
      name: serviceData.name,
      description: `${serviceData.name} service`,
      category: serviceData.category,
      duration: serviceData.baseDuration,
      price: serviceData.basePrice,
      isActive: true,
    };

    return { service };
  });
};
