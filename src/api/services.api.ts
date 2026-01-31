/**
 * Services API endpoints
 * Mock implementation matching API_DOCUMENTATION.md
 */

import { apiRequest, ApiResponse, PaginationParams } from './client';
import servicesData from '@/data/services.json';
import { Service } from '@/types/service';

export interface ServiceFilters extends PaginationParams {
  category?: string;
  isActive?: boolean;
  staffId?: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category: string;
  duration: number;
  price: number;
  cost?: number;
  isActive?: boolean;
  staffIds?: string[];
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  duration?: number;
  price?: number;
  cost?: number;
  isActive?: boolean;
  staffIds?: string[];
}

/**
 * GET /services
 * Get list of all services
 */
export const getServices = async (
  filters?: ServiceFilters
): Promise<ApiResponse<{ data: Service[] }>> => {
  return apiRequest(async () => {
    let filtered = servicesData.services.map((s) => ({
      id: s.id,
      name: s.name,
      categoryId: s.category.toLowerCase(),
      description: `${s.name} service`,
      duration: s.baseDuration,
      price: s.basePrice,
      pricingType: 'fixed' as const,
      taxable: true,
      isActive: true,
      bookableOnline: true,
      requiresDeposit: false,
      staffAssignments: {
        assignedStaffIds: [],
        allowAnyStaff: true,
      },
      order: parseInt(s.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Apply filters
    if (filters?.category) {
      filtered = filtered.filter(
        (s) => s.categoryId.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters?.isActive !== undefined) {
      filtered = filtered.filter((s) => s.isActive === filters.isActive);
    }

    // Filter by staff (would need staff-service mapping in real app)
    if (filters?.staffId) {
      // For mock, return all services
      // In real app, would filter by staff-service relationships
    }

    return { data: filtered };
  });
};

/**
 * GET /services/:id
 * Get single service by ID
 */
export const getServiceById = async (
  id: string
): Promise<ApiResponse<{ service: Service }>> => {
  return apiRequest(async () => {
    const serviceData = servicesData.services.find((s) => s.id === id);

    if (!serviceData) {
      throw new Error('Service not found');
    }

    const service: Service = {
      id: serviceData.id,
      name: serviceData.name,
      categoryId: serviceData.category.toLowerCase(),
      description: `${serviceData.name} service`,
      duration: serviceData.baseDuration,
      price: serviceData.basePrice,
      pricingType: 'fixed',
      taxable: true,
      isActive: true,
      bookableOnline: true,
      requiresDeposit: false,
      staffAssignments: {
        assignedStaffIds: [],
        allowAnyStaff: true,
      },
      order: parseInt(serviceData.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { service };
  });
};

/**
 * POST /services
 * Create new service
 */
export const createService = async (
  request: CreateServiceRequest
): Promise<ApiResponse<{ service: Service }>> => {
  return apiRequest(async () => {
    const newId = (servicesData.services.length + 1).toString();

    const newService: Service = {
      id: newId,
      name: request.name,
      categoryId: request.category.toLowerCase(),
      description: request.description,
      duration: request.duration,
      price: request.price,
      pricingType: 'fixed',
      taxable: true,
      isActive: request.isActive !== undefined ? request.isActive : true,
      bookableOnline: true,
      requiresDeposit: false,
      staffAssignments: {
        assignedStaffIds: request.staffIds || [],
        allowAnyStaff: !request.staffIds || request.staffIds.length === 0,
      },
      order: parseInt(newId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock data
    servicesData.services.push({
      id: newId,
      name: request.name,
      category: request.category,
      basePrice: request.price,
      baseDuration: request.duration,
    });

    return { service: newService };
  });
};

/**
 * PUT /services/:id
 * Update service
 */
export const updateService = async (
  id: string,
  request: UpdateServiceRequest
): Promise<ApiResponse<{ service: Service }>> => {
  return apiRequest(async () => {
    const index = servicesData.services.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Service not found');
    }

    const existing = servicesData.services[index];
    const updated: Service = {
      id: existing.id,
      name: request.name || existing.name,
      categoryId: request.category ? request.category.toLowerCase() : existing.category.toLowerCase(),
      description: request.description,
      duration: request.duration || existing.baseDuration,
      price: request.price || existing.basePrice,
      pricingType: 'fixed',
      taxable: true,
      isActive: request.isActive !== undefined ? request.isActive : true,
      bookableOnline: true,
      requiresDeposit: false,
      staffAssignments: {
        assignedStaffIds: request.staffIds || [],
        allowAnyStaff: !request.staffIds || request.staffIds.length === 0,
      },
      order: parseInt(existing.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update mock data
    servicesData.services[index] = {
      id: existing.id,
      name: updated.name,
      category: request.category || existing.category,
      basePrice: updated.price,
      baseDuration: updated.duration,
    };

    return { service: updated };
  });
};

/**
 * DELETE /services/:id
 * Delete service
 */
export const deleteService = async (id: string): Promise<ApiResponse<void>> => {
  return apiRequest(async () => {
    const index = servicesData.services.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Service not found');
    }

    // Remove from mock data
    servicesData.services.splice(index, 1);
    return undefined;
  });
};
