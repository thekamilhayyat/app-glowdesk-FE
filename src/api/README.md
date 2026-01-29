# API Layer Documentation

This directory contains the mock API layer for Glowdesk MVP. All API functions are designed to be easily replaceable with real backend API calls.

## Structure

```
/api
├── client.ts           # Base API client utilities
├── auth.api.ts         # Authentication endpoints
├── clients.api.ts      # Client management endpoints
├── appointments.api.ts # Appointment management endpoints
├── staff.api.ts        # Staff management endpoints
├── services.api.ts     # Service management endpoints
├── sales.api.ts        # Sales/POS endpoints
├── inventory.api.ts    # Inventory management endpoints
├── websocket.ts        # WebSocket handlers (future-ready)
└── index.ts            # Central exports
```

## Design Principles

1. **Promise-based**: All API functions return `Promise<ApiResponse<T>>`
2. **Error normalization**: Consistent error format across all endpoints
3. **Network simulation**: 300-800ms delay to simulate real network conditions
4. **Backend-ready**: Easy to swap mock implementations with real API calls
5. **Type-safe**: Full TypeScript support with proper types

## Usage

### Direct API Calls

```typescript
import { getClients, createClient } from '@/api/clients.api';
import { extractData, hasError } from '@/api/client';

// Fetch clients
const response = await getClients({ page: 1, limit: 20 });
if (hasError(response)) {
  console.error(response.error.message);
} else {
  const clients = extractData(response);
}
```

### React Query Hooks (Recommended)

```typescript
import { useClients, useCreateClient } from '@/hooks/api';

function ClientsPage() {
  const { data, isLoading, error } = useClients({ page: 1 });
  const createClient = useCreateClient();
  
  const handleCreate = async () => {
    await createClient.mutateAsync({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    });
  };
  
  // ...
}
```

## API Response Format

All API functions return `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

## Error Handling

Errors follow the API_DOCUMENTATION.md specification:

```typescript
// Success response
{
  data: { /* response data */ }
}

// Error response
{
  error: {
    code: "ERROR_CODE",
    message: "Human-readable error message",
    details: { /* optional additional details */ }
  }
}
```

## Network Simulation

All API calls include a simulated network delay (300-800ms) to mimic real-world conditions. This helps:

- Test loading states
- Verify optimistic UI updates
- Ensure proper error handling

## Migration to Real Backend

When migrating to a real backend:

1. Replace mock implementations in each `.api.ts` file
2. Update `client.ts` to use `fetch` or `axios` with real base URL
3. Add proper authentication headers
4. Update error handling to match backend error format
5. Remove mock data imports

Example migration:

```typescript
// Before (mock)
export const getClients = async (filters?: ClientFilters) => {
  return apiRequest(async () => {
    // Mock implementation
  });
};

// After (real API)
export const getClients = async (filters?: ClientFilters) => {
  return apiRequest(async () => {
    const token = getAuthToken();
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`/api/clients?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  });
};
```

## WebSocket Support

WebSocket handlers are prepared in `websocket.ts` but commented out. When backend WebSocket support is available:

1. Uncomment the handlers
2. Implement connection logic
3. Add to App.tsx or a dedicated WebSocket provider
4. Use React Query invalidation for real-time updates

## Testing

Mock APIs can be tested by:

1. Unit tests for individual API functions
2. Integration tests with React Query hooks
3. E2E tests with mocked API responses

## Future Enhancements

- [ ] Request/response interceptors
- [ ] Retry logic for failed requests
- [ ] Request cancellation
- [ ] Caching strategies
- [ ] Offline support
- [ ] Request queuing
