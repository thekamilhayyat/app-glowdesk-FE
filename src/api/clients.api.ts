/**
 * Clients API endpoints
 * Mock implementation matching API_DOCUMENTATION.md
 */

import { apiRequest, ApiResponse, PaginatedResponse, PaginationParams } from './client';
import clientsData from '@/data/clients.json';
import { Client } from '@/types/client';

// Export function to add clients (for public widget integration)
export const addClientToDashboard = (client: Client) => {
  clientsData.clients.push(client);
};

// Export function to find client by email/phone
export const findClientByContact = (email?: string, phone?: string): Client | undefined => {
  return clientsData.clients.find(
    (c) => (email && c.email === email) || (phone && c.phone === phone)
  );
};

export interface ClientFilters extends PaginationParams {
  search?: string;
  isVip?: boolean;
  tags?: string[];
}

export interface CreateClientRequest {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  notes?: string;
  tags?: string[];
  marketingOptIn?: boolean;
}

export interface UpdateClientRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  isVip?: boolean;
  notes?: string;
}

export interface ClientStats {
  totalAppointments: number;
  completedAppointments: number;
  noShowCount: number;
  lifetimeSpend: number;
  averageTicket: number;
  lastVisit: string | null;
}

/**
 * GET /clients
 * Get list of all clients with optional filtering
 */
export const getClients = async (
  filters?: ClientFilters
): Promise<ApiResponse<PaginatedResponse<Client>>> => {
  return apiRequest(async () => {
    let filteredClients = [...clientsData.clients];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredClients = filteredClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.phone?.includes(searchLower)
      );
    }

    // Apply VIP filter
    if (filters?.isVip !== undefined) {
      filteredClients = filteredClients.filter((client) => {
        const isVip = client.tags?.includes('VIP') || false;
        return filters.isVip ? isVip : !isVip;
      });
    }

    // Apply tags filter
    if (filters?.tags && filters.tags.length > 0) {
      filteredClients = filteredClients.filter((client) =>
        filters.tags!.some((tag) => client.tags?.includes(tag))
      );
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'name';
    const sortOrder = filters?.sortOrder || 'asc';
    filteredClients.sort((a, b) => {
      let aVal: string | number | undefined;
      let bVal: string | number | undefined;

      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;
        case 'lastVisit':
          aVal = new Date(a.lastVisit || 0).getTime();
          bVal = new Date(b.lastVisit || 0).getTime();
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    return {
      data: paginatedClients.map((c) => ({
        ...c,
        firstName: c.name.split(' ')[0],
        lastName: c.name.split(' ').slice(1).join(' '),
      })),
      pagination: {
        page,
        limit,
        total: filteredClients.length,
        totalPages: Math.ceil(filteredClients.length / limit),
      },
    };
  });
};

/**
 * GET /clients/:id
 * Get single client by ID with appointment and purchase history
 */
export const getClientById = async (
  id: string
): Promise<ApiResponse<{ client: Client; stats: ClientStats }>> => {
  return apiRequest(async () => {
    const client = clientsData.clients.find((c) => c.id === id);

    if (!client) {
      throw new Error('Client not found');
    }

    // Mock stats (in real app, these would come from database aggregations)
    const stats: ClientStats = {
      totalAppointments: Math.floor(Math.random() * 20) + 5,
      completedAppointments: Math.floor(Math.random() * 15) + 5,
      noShowCount: Math.floor(Math.random() * 3),
      lifetimeSpend: client.lifetimeSpend || 0,
      averageTicket: client.lifetimeSpend ? client.lifetimeSpend / 10 : 0,
      lastVisit: client.lastVisit || null,
    };

    return {
      client: {
        ...client,
        firstName: client.name.split(' ')[0],
        lastName: client.name.split(' ').slice(1).join(' '),
      },
      stats,
    };
  });
};

/**
 * POST /clients
 * Create new client
 */
export const createClient = async (
  request: CreateClientRequest
): Promise<ApiResponse<{ client: Client }>> => {
  return apiRequest(async () => {
    // Generate new ID
    const newId = (clientsData.clients.length + 1).toString();
    const now = new Date().toISOString().split('T')[0];

    const newClient: Client = {
      id: newId,
      name: request.name || `${request.firstName} ${request.lastName}`.trim(),
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      tags: request.tags || [],
      notes: request.notes,
      createdAt: now,
    };

    // Add to mock data (in real app, this would be persisted)
    clientsData.clients.push(newClient);

    return { client: newClient };
  });
};

/**
 * PUT /clients/:id
 * Update existing client
 */
export const updateClient = async (
  id: string,
  request: UpdateClientRequest
): Promise<ApiResponse<{ client: Client }>> => {
  return apiRequest(async () => {
    const clientIndex = clientsData.clients.findIndex((c) => c.id === id);

    if (clientIndex === -1) {
      throw new Error('Client not found');
    }

    const existingClient = clientsData.clients[clientIndex];
    const updatedClient: Client = {
      ...existingClient,
      ...request,
      name: request.name || existingClient.name,
      tags: request.tags || existingClient.tags,
    };

    // Update mock data
    clientsData.clients[clientIndex] = updatedClient;

    return { client: updatedClient };
  });
};

/**
 * DELETE /clients/:id
 * Delete client (soft delete recommended)
 */
export const deleteClient = async (id: string): Promise<ApiResponse<void>> => {
  return apiRequest(async () => {
    const clientIndex = clientsData.clients.findIndex((c) => c.id === id);

    if (clientIndex === -1) {
      throw new Error('Client not found');
    }

    // Remove from mock data (in real app, this would be soft delete)
    clientsData.clients.splice(clientIndex, 1);
    return undefined;
  });
};

/**
 * GET /clients/:id/appointments
 * Get client's appointment history
 */
export const getClientAppointments = async (
  id: string,
  filters?: PaginationParams & { status?: string; startDate?: string; endDate?: string }
): Promise<ApiResponse<PaginatedResponse<any>>> => {
  return apiRequest(async () => {
    // Mock appointments (in real app, these would come from appointments table)
    const mockAppointments: any[] = [];

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    return {
      data: mockAppointments,
      pagination: {
        page,
        limit,
        total: mockAppointments.length,
        totalPages: Math.ceil(mockAppointments.length / limit),
      },
    };
  });
};

/**
 * GET /clients/:id/purchases
 * Get client's purchase history (sales)
 */
export const getClientPurchases = async (
  id: string,
  filters?: PaginationParams
): Promise<ApiResponse<PaginatedResponse<any>>> => {
  return apiRequest(async () => {
    // Mock purchases (in real app, these would come from sales table)
    const mockPurchases: any[] = [];

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    return {
      data: mockPurchases,
      pagination: {
        page,
        limit,
        total: mockPurchases.length,
        totalPages: Math.ceil(mockPurchases.length / limit),
      },
    };
  });
};
