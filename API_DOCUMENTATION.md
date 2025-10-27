# Glowdesk API Documentation

## Overview

This document provides comprehensive API endpoint specifications for the Glowdesk salon management system. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.glowdesk.com/api
```

## Authentication

All API requests (except `/auth` endpoints) require authentication using JWT tokens.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Responses

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

### HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Success with no response body
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., double booking)
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-13T12:00:00Z"
}
```

### POST /auth/logout

Invalidate current session token.

**Response (204):** No content

### GET /auth/me

Get current authenticated user information.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "isActive": true
  }
}
```

### POST /auth/refresh

Refresh JWT token before expiration.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_token",
  "expiresAt": "2025-10-13T12:00:00Z"
}
```

---

## Client Endpoints

### GET /clients

Get list of all clients with optional filtering.

**Query Parameters:**
- `search` (string): Search by name, email, or phone
- `isVip` (boolean): Filter by VIP status
- `tags` (string[]): Filter by tags
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): Sort field (name, createdAt, lastVisit)
- `sortOrder` (string): asc or desc

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "isVip": false,
      "tags": ["New Client"],
      "notes": "Prefers morning appointments",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /clients/:id

Get single client by ID with appointment and purchase history.

**Response (200):**
```json
{
  "client": {
    "id": "uuid",
    "name": "Jane Doe",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "isVip": false,
    "tags": ["Regular"],
    "notes": "Prefers morning appointments",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "stats": {
    "totalAppointments": 15,
    "completedAppointments": 14,
    "noShowCount": 1,
    "lifetimeSpend": 1250.00,
    "averageTicket": 89.29,
    "lastVisit": "2025-10-10T14:00:00Z"
  }
}
```

### POST /clients

Create new client.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "notes": "Prefers morning appointments",
  "tags": ["New Client"],
  "marketingOptIn": true
}
```

**Response (201):**
```json
{
  "client": {
    "id": "uuid",
    "name": "Jane Doe",
    // ... full client object
    "createdAt": "2025-10-12T10:00:00Z"
  }
}
```

### PUT /clients/:id

Update existing client.

**Request Body:** (all fields optional)
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "tags": ["Regular", "VIP"],
  "isVip": true
}
```

**Response (200):**
```json
{
  "client": {
    // ... updated client object
    "updatedAt": "2025-10-12T11:00:00Z"
  }
}
```

### DELETE /clients/:id

Delete client (soft delete recommended).

**Response (204):** No content

### GET /clients/:id/appointments

Get client's appointment history.

**Query Parameters:**
- `status` (string): Filter by status
- `startDate` (ISO date): From date
- `endDate` (ISO date): To date
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "startTime": "2025-10-15T10:00:00Z",
      "endTime": "2025-10-15T11:00:00Z",
      "status": "confirmed",
      "services": ["Haircut", "Color"],
      "staff": {
        "id": "uuid",
        "name": "Sarah Johnson"
      },
      "totalPrice": 125.00
    }
  ],
  "pagination": { /* ... */ }
}
```

### GET /clients/:id/purchases

Get client's purchase history (sales).

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "transactionId": "TXN-123456",
      "completedAt": "2025-10-10T14:30:00Z",
      "total": 89.50,
      "items": [
        {
          "name": "Haircut",
          "quantity": 1,
          "price": 65.00
        }
      ],
      "paymentMethods": ["credit-card"]
    }
  ],
  "pagination": { /* ... */ }
}
```

---

## Staff Endpoints

### GET /staff

Get list of all staff members.

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `role` (string): Filter by role
- `serviceId` (uuid): Filter staff who can perform specific service

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah@glowdesk.com",
      "phone": "+1234567890",
      "role": "Stylist",
      "specialties": ["Hair", "Color"],
      "color": "#3b82f6",
      "commissionRate": 45.00,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /staff/:id

Get single staff member by ID.

**Response (200):**
```json
{
  "staff": {
    "id": "uuid",
    "firstName": "Sarah",
    "lastName": "Johnson",
    // ... full staff details
    "services": [
      {
        "id": "uuid",
        "name": "Haircut",
        "duration": 30,
        "price": 65.00
      }
    ],
    "workingHours": {
      "monday": { "open": "09:00", "close": "17:00" },
      "tuesday": { "open": "09:00", "close": "17:00" }
      // ... other days
    }
  }
}
```

### POST /staff

Create new staff member.

**Request Body:**
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah@glowdesk.com",
  "phone": "+1234567890",
  "role": "Stylist",
  "color": "#3b82f6",
  "commissionRate": 45.00,
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "workingHours": { /* ... */ }
}
```

**Response (201):** Created staff object

### PUT /staff/:id

Update staff member.

**Request Body:** (all fields optional)

**Response (200):** Updated staff object

### DELETE /staff/:id

Delete staff member (soft delete recommended).

**Response (204):** No content

### GET /staff/:id/availability

Get staff member's availability for a date range.

**Query Parameters:**
- `startDate` (ISO date): Required
- `endDate` (ISO date): Required
- `duration` (number): Service duration in minutes

**Response (200):**
```json
{
  "availability": [
    {
      "date": "2025-10-15",
      "slots": [
        {
          "startTime": "2025-10-15T09:00:00Z",
          "endTime": "2025-10-15T09:30:00Z",
          "available": true
        },
        {
          "startTime": "2025-10-15T09:30:00Z",
          "endTime": "2025-10-15T10:00:00Z",
          "available": false
        }
      ]
    }
  ]
}
```

---

## Service Endpoints

### GET /services

Get list of all services.

**Query Parameters:**
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status
- `staffId` (uuid): Filter services a staff member can perform

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Haircut",
      "description": "Professional haircut and styling",
      "category": "Hair",
      "duration": 30,
      "price": 65.00,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /services/:id

Get single service by ID.

**Response (200):**
```json
{
  "service": {
    "id": "uuid",
    "name": "Haircut",
    "description": "Professional haircut and styling",
    "category": "Hair",
    "duration": 30,
    "price": 65.00,
    "cost": 10.00,
    "isActive": true,
    "requiresDeposit": false,
    "staff": [
      {
        "id": "uuid",
        "name": "Sarah Johnson"
      }
    ]
  }
}
```

### POST /services

Create new service.

**Request Body:**
```json
{
  "name": "Haircut",
  "description": "Professional haircut and styling",
  "category": "Hair",
  "duration": 30,
  "price": 65.00,
  "cost": 10.00,
  "isActive": true,
  "staffIds": ["staff-uuid-1", "staff-uuid-2"]
}
```

**Response (201):** Created service object

### PUT /services/:id

Update service.

**Response (200):** Updated service object

### DELETE /services/:id

Delete service.

**Response (204):** No content

---

## Appointment Endpoints

### GET /appointments

Get list of appointments with filtering.

**Query Parameters:**
- `startDate` (ISO date): From date
- `endDate` (ISO date): To date
- `clientId` (uuid): Filter by client
- `staffId` (uuid): Filter by staff
- `status` (string): Filter by status
- `date` (ISO date): Specific date

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "client": {
        "id": "uuid",
        "name": "Jane Doe"
      },
      "staff": {
        "id": "uuid",
        "name": "Sarah Johnson"
      },
      "startTime": "2025-10-15T10:00:00Z",
      "endTime": "2025-10-15T10:30:00Z",
      "status": "confirmed",
      "services": [
        {
          "id": "uuid",
          "name": "Haircut",
          "duration": 30,
          "price": 65.00
        }
      ],
      "totalPrice": 65.00,
      "depositPaid": false,
      "hasUnreadMessages": false,
      "isRecurring": false,
      "notes": "Client prefers scissors over clippers",
      "createdAt": "2025-10-10T09:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

### GET /appointments/:id

Get single appointment by ID.

**Response (200):**
```json
{
  "appointment": {
    "id": "uuid",
    "client": { /* full client object */ },
    "staff": { /* full staff object */ },
    "startTime": "2025-10-15T10:00:00Z",
    "endTime": "2025-10-15T10:30:00Z",
    "status": "confirmed",
    "services": [ /* full service objects */ ],
    "totalPrice": 65.00,
    "depositPaid": false,
    "depositAmount": null,
    "notes": "Client prefers scissors over clippers",
    "internalNotes": "First time client, be patient",
    "createdBy": {
      "id": "uuid",
      "name": "Receptionist Name"
    },
    "createdAt": "2025-10-10T09:00:00Z",
    "updatedAt": "2025-10-10T09:00:00Z"
  }
}
```

### POST /appointments

Create new appointment.

**Request Body:**
```json
{
  "clientId": "uuid",
  "staffId": "uuid",
  "serviceIds": ["uuid1", "uuid2"],
  "startTime": "2025-10-15T10:00:00Z",
  "notes": "Client prefers scissors over clippers",
  "status": "pending"
}
```

**Response (201):**
```json
{
  "appointment": { /* created appointment object */ }
}
```

**Error (409) - Conflict:**
```json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "This time slot conflicts with another appointment",
    "details": {
      "conflictingAppointment": {
        "id": "uuid",
        "startTime": "2025-10-15T09:45:00Z",
        "endTime": "2025-10-15T10:15:00Z",
        "clientName": "John Smith"
      }
    }
  }
}
```

### PUT /appointments/:id

Update existing appointment.

**Request Body:** (all fields optional)
```json
{
  "startTime": "2025-10-15T11:00:00Z",
  "status": "confirmed",
  "notes": "Updated notes"
}
```

**Response (200):** Updated appointment object

### DELETE /appointments/:id

Delete/cancel appointment.

**Request Body:** (optional)
```json
{
  "cancellationReason": "Client requested cancellation"
}
```

**Response (204):** No content

### POST /appointments/:id/check-in

Check-in client for appointment.

**Response (200):**
```json
{
  "appointment": {
    "id": "uuid",
    "status": "checked-in",
    "actualStartTime": "2025-10-15T10:05:00Z"
  }
}
```

### POST /appointments/:id/complete

Mark appointment as completed.

**Response (200):**
```json
{
  "appointment": {
    "id": "uuid",
    "status": "completed",
    "actualEndTime": "2025-10-15T10:35:00Z"
  }
}
```

### POST /appointments/check-availability

Check if a time slot is available.

**Request Body:**
```json
{
  "staffId": "uuid",
  "startTime": "2025-10-15T10:00:00Z",
  "endTime": "2025-10-15T10:30:00Z",
  "excludeAppointmentId": "uuid" // optional, for rescheduling
}
```

**Response (200):**
```json
{
  "available": false,
  "conflicts": [
    {
      "id": "uuid",
      "startTime": "2025-10-15T09:45:00Z",
      "endTime": "2025-10-15T10:15:00Z",
      "clientName": "John Smith"
    }
  ]
}
```

---

## Sales (POS) Endpoints

### GET /sales

Get list of sales/transactions.

**Query Parameters:**
- `startDate` (ISO date): From date
- `endDate` (ISO date): To date
- `clientId` (uuid): Filter by client
- `staffId` (uuid): Filter by staff (items sold by)
- `paymentMethod` (string): Filter by payment method
- `status` (string): Filter by status
- `searchTerm` (string): Search by transaction ID or client name

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "transactionId": "TXN-1697123456-ABC123",
      "appointmentId": "uuid",
      "client": {
        "id": "uuid",
        "name": "Jane Doe"
      },
      "items": [
        {
          "id": "uuid",
          "type": "service",
          "name": "Haircut",
          "quantity": 1,
          "price": 65.00,
          "staff": {
            "id": "uuid",
            "name": "Sarah Johnson"
          }
        }
      ],
      "subtotal": 65.00,
      "totalDiscount": 0.00,
      "tax": 5.36,
      "tip": 10.00,
      "total": 80.36,
      "paymentMethods": [
        {
          "type": "credit-card",
          "amount": 80.36,
          "reference": "4242"
        }
      ],
      "status": "completed",
      "completedBy": {
        "id": "uuid",
        "name": "Receptionist Name"
      },
      "completedAt": "2025-10-12T11:30:00Z",
      "createdAt": "2025-10-12T11:25:00Z"
    }
  ],
  "pagination": { /* ... */ },
  "summary": {
    "totalRevenue": 5280.50,
    "totalTransactions": 45,
    "averageTicket": 117.34
  }
}
```

### GET /sales/:id

Get single sale/transaction by ID.

**Response (200):**
```json
{
  "sale": {
    "id": "uuid",
    "transactionId": "TXN-1697123456-ABC123",
    "appointmentId": "uuid",
    "client": { /* full client object */ },
    "items": [ /* full item details */ ],
    "subtotal": 65.00,
    "totalDiscount": 0.00,
    "tax": 5.36,
    "tip": 10.00,
    "total": 80.36,
    "paymentMethods": [ /* full payment details */ ],
    "status": "completed",
    "notes": "Customer was very satisfied",
    "completedBy": { /* user object */ },
    "completedAt": "2025-10-12T11:30:00Z",
    "createdAt": "2025-10-12T11:25:00Z",
    "updatedAt": "2025-10-12T11:30:00Z"
  }
}
```

### POST /sales

Create new sale/transaction.

**Request Body:**
```json
{
  "clientId": "uuid",
  "appointmentId": "uuid", // optional
  "items": [
    {
      "type": "service",
      "serviceId": "uuid",
      "name": "Haircut",
      "price": 65.00,
      "quantity": 1,
      "staffId": "uuid",
      "discount": {
        "type": "percentage",
        "value": 10
      }
    },
    {
      "type": "product",
      "productId": "uuid",
      "name": "Shampoo",
      "price": 25.00,
      "quantity": 2
    }
  ],
  "tip": 10.00,
  "paymentMethods": [
    {
      "type": "credit-card",
      "amount": 80.36,
      "reference": "4242",
      "cardBrand": "Visa"
    }
  ],
  "notes": "Customer was very satisfied"
}
```

**Response (201):**
```json
{
  "sale": { /* created sale object with generated transaction ID */ }
}
```

### POST /sales/:id/refund

Process full or partial refund.

**Request Body:**
```json
{
  "amount": 80.36, // full refund
  "reason": "Customer not satisfied with service",
  "refundItems": [ // optional, for partial refunds
    {
      "saleItemId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Response (200):**
```json
{
  "sale": {
    "id": "uuid",
    "status": "refunded",
    "refundAmount": 80.36,
    "refundedAt": "2025-10-12T14:00:00Z"
  }
}
```

---

## Inventory Endpoints

### GET /products

Get list of products.

**Query Parameters:**
- `search` (string): Search by name, SKU, or barcode
- `typeId` (uuid): Filter by product type
- `manufacturerId` (uuid): Filter by manufacturer
- `isActive` (boolean): Filter by active status
- `lowStock` (boolean): Show only low stock products

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "sku": "SHP-001",
      "name": "Premium Shampoo",
      "description": "Moisturizing shampoo for all hair types",
      "manufacturer": {
        "id": "uuid",
        "name": "Beauty Brand"
      },
      "type": {
        "id": "uuid",
        "name": "Hair Care"
      },
      "price": 25.00,
      "cost": 12.00,
      "quantityInStock": 45,
      "lowStockThreshold": 10,
      "isActive": true
    }
  ],
  "pagination": { /* ... */ }
}
```

### GET /products/:id

Get single product by ID.

**Response (200):** Full product details

### POST /products

Create new product.

**Request Body:**
```json
{
  "sku": "SHP-001",
  "barcode": "1234567890123",
  "name": "Premium Shampoo",
  "description": "Moisturizing shampoo for all hair types",
  "manufacturerId": "uuid",
  "typeId": "uuid",
  "price": 25.00,
  "cost": 12.00,
  "quantityInStock": 50,
  "lowStockThreshold": 10,
  "isActive": true
}
```

**Response (201):** Created product

### PUT /products/:id

Update product.

**Response (200):** Updated product

### DELETE /products/:id

Delete product.

**Response (204):** No content

### POST /products/:id/adjust-stock

Adjust product stock quantity.

**Request Body:**
```json
{
  "quantity": -5, // negative for removal, positive for addition
  "type": "sale", // purchase, sale, adjustment, waste, return
  "notes": "Sold 5 units",
  "referenceId": "sale-uuid" // optional
}
```

**Response (200):**
```json
{
  "product": {
    "id": "uuid",
    "quantityInStock": 40,
    "previousQuantity": 45
  },
  "transaction": {
    "id": "uuid",
    "type": "sale",
    "quantity": -5,
    "createdAt": "2025-10-12T12:00:00Z"
  }
}
```

### GET /manufacturers

Get list of manufacturers.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Beauty Brand",
      "description": "Premium beauty products",
      "website": "https://beautybrand.com",
      "isActive": true
    }
  ]
}
```

### GET /product-types

Get list of product types/categories.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Hair Care",
      "description": "Hair care products",
      "parentType": null,
      "isActive": true
    }
  ]
}
```

---

## Reports Endpoints (Future)

### GET /reports/sales-summary

Get sales summary report.

**Query Parameters:**
- `startDate`, `endDate`: Date range
- `groupBy`: day, week, month
- `staffId`: Filter by staff

**Response (200):**
```json
{
  "summary": {
    "totalRevenue": 15250.00,
    "totalTransactions": 125,
    "averageTicket": 122.00,
    "totalTips": 1850.00
  },
  "breakdown": [
    {
      "date": "2025-10-12",
      "revenue": 1250.00,
      "transactions": 15,
      "averageTicket": 83.33
    }
  ]
}
```

---

## Webhooks (Future)

Webhook events for real-time notifications:

- `appointment.created`
- `appointment.updated`
- `appointment.canceled`
- `sale.completed`
- `client.created`
- `product.low_stock`

---

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per API key
- **Headers**:
  - `X-RateLimit-Limit`: 1000
  - `X-RateLimit-Remaining`: 950
  - `X-RateLimit-Reset`: 1697123456 (Unix timestamp)

---

## Versioning

API versioning is handled through the URL path:

```
/api/v1/clients
/api/v2/clients
```

Current version: **v1**

---

## SDK & Client Libraries (Future)

Official SDKs will be provided for:
- JavaScript/TypeScript
- Python
- PHP
- Ruby

---

## Support

- **API Documentation**: https://docs.glowdesk.com/api
- **Support Email**: support@glowdesk.com
- **Status Page**: https://status.glowdesk.com

---

**API Version**: 1.0.0  
**Last Updated**: October 12, 2025  
**Maintained by**: Glowdesk Development Team

