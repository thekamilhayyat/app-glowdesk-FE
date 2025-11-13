import { Router } from 'express';
import type { Response } from 'express';
import { storage } from './storage';
import { authMiddleware, generateToken, hashPassword, comparePassword, type AuthRequest } from './auth';
import { validateBody } from './validation';
import {
  insertClientSchema,
  insertStaffSchema,
  insertServiceSchema,
  insertStaffServiceSchema,
  insertAppointmentSchema,
  insertAppointmentServiceSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertProductSchema,
  insertInventoryTransactionSchema,
} from '../shared/schema';
import { z } from 'zod';

const createClientSchema = insertClientSchema;
const updateClientSchema = insertClientSchema.partial();

const createStaffSchema = insertStaffSchema.extend({
  serviceIds: z.array(z.string()).optional(),
}).passthrough();
const updateStaffSchema = insertStaffSchema.partial().passthrough();

const createServiceSchema = insertServiceSchema.extend({
  staffIds: z.array(z.string()).optional(),
}).passthrough();
const updateServiceSchema = insertServiceSchema.partial().passthrough();

const createAppointmentSchema = insertAppointmentSchema.omit({ createdBy: true }).extend({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  serviceIds: z.array(z.string()).optional(),
}).passthrough();
const updateAppointmentSchema = z.object({
  clientId: z.string().optional(),
  staffId: z.string().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  status: z.string().optional(),
  totalPrice: z.string().optional(),
  depositPaid: z.boolean().optional(),
  notes: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
}).passthrough();

const createSaleSchema = z.object({
  clientId: z.string().optional(),
  appointmentId: z.string().optional(),
  totalAmount: z.string(),
  subtotal: z.string(),
  tax: z.string().optional(),
  tip: z.string().optional(),
  discount: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    type: z.string(),
    itemId: z.string().optional(),
    name: z.string(),
    quantity: z.number(),
    price: z.string(),
    discount: z.string().optional(),
    tax: z.string().optional(),
  })).optional(),
  paymentMethods: z.array(z.object({
    type: z.string(),
    amount: z.string(),
    reference: z.string().optional(),
  })).optional(),
}).passthrough();

const createProductSchema = insertProductSchema;
const updateProductSchema = insertProductSchema.partial();

const router = Router();

router.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await storage.getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get user info' } });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: { code: 'INVALID_REQUEST', message: 'Email and password are required' } });
      return;
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const token = generateToken(user);
    
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Login failed' } });
  }
});

router.post('/auth/logout', authMiddleware, (req, res) => {
  res.status(204).send();
});

router.get('/clients', authMiddleware, async (req, res) => {
  try {
    const { search, isVip, page = '1', limit = '20' } = req.query;
    
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const result = await storage.getClients({
      search: search as string,
      isVip: isVip === 'true' ? true : isVip === 'false' ? false : undefined,
      limit: parseInt(limit as string),
      offset,
    });

    res.json({
      data: result.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get clients' } });
  }
});

router.get('/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await storage.getClientById(req.params.id);
    if (!client) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
      return;
    }
    res.json({ client });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get client' } });
  }
});

router.post('/clients', authMiddleware, validateBody(createClientSchema), async (req, res) => {
  try {
    const client = await storage.createClient(req.body);
    res.status(201).json({ client });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create client' } });
  }
});

router.put('/clients/:id', authMiddleware, validateBody(updateClientSchema), async (req, res) => {
  try {
    const client = await storage.updateClient(req.params.id, req.body);
    res.json({ client });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update client' } });
  }
});

router.delete('/clients/:id', authMiddleware, async (req, res) => {
  try {
    await storage.deleteClient(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete client' } });
  }
});

router.get('/staff', authMiddleware, async (req, res) => {
  try {
    const { isActive, serviceId } = req.query;
    
    const staffList = await storage.getStaff({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      serviceId: serviceId as string,
    });

    res.json({ data: staffList });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get staff' } });
  }
});

router.get('/staff/:id', authMiddleware, async (req, res) => {
  try {
    const staffMember = await storage.getStaffById(req.params.id);
    if (!staffMember) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Staff member not found' } });
      return;
    }
    
    const services = await storage.getStaffServices(req.params.id);
    res.json({ staff: { ...staffMember, services } });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get staff member' } });
  }
});

router.post('/staff', authMiddleware, validateBody(createStaffSchema), async (req, res) => {
  try {
    const { serviceIds, ...staffData } = req.body;
    const staffMember = await storage.createStaff(staffData);
    
    if (serviceIds && Array.isArray(serviceIds)) {
      for (const serviceId of serviceIds) {
        await storage.assignServiceToStaff({ staffId: staffMember.id, serviceId });
      }
    }
    
    res.status(201).json({ staff: staffMember });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create staff member' } });
  }
});

router.put('/staff/:id', authMiddleware, validateBody(updateStaffSchema), async (req, res) => {
  try {
    const staffMember = await storage.updateStaff(req.params.id, req.body);
    res.json({ staff: staffMember });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update staff member' } });
  }
});

router.delete('/staff/:id', authMiddleware, async (req, res) => {
  try {
    await storage.deleteStaff(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete staff member' } });
  }
});

router.get('/services', authMiddleware, async (req, res) => {
  try {
    const { category, isActive, staffId } = req.query;
    
    const servicesList = await storage.getServices({
      category: category as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      staffId: staffId as string,
    });

    res.json({ data: servicesList });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get services' } });
  }
});

router.get('/services/:id', authMiddleware, async (req, res) => {
  try {
    const service = await storage.getServiceById(req.params.id);
    if (!service) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Service not found' } });
      return;
    }
    res.json({ service });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get service' } });
  }
});

router.post('/services', authMiddleware, validateBody(createServiceSchema), async (req, res) => {
  try {
    const { staffIds, ...serviceData } = req.body;
    const service = await storage.createService(serviceData);
    
    if (staffIds && Array.isArray(staffIds)) {
      for (const staffId of staffIds) {
        await storage.assignServiceToStaff({ staffId, serviceId: service.id });
      }
    }
    
    res.status(201).json({ service });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create service' } });
  }
});

router.put('/services/:id', authMiddleware, validateBody(updateServiceSchema), async (req, res) => {
  try {
    const service = await storage.updateService(req.params.id, req.body);
    res.json({ service });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update service' } });
  }
});

router.delete('/services/:id', authMiddleware, async (req, res) => {
  try {
    await storage.deleteService(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete service' } });
  }
});

router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, clientId, staffId, status, date } = req.query;
    
    const appointments = await storage.getAppointments({
      startDate: startDate as string,
      endDate: endDate as string,
      clientId: clientId as string,
      staffId: staffId as string,
      status: status as string,
      date: date as string,
    });

    const enrichedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        const client = await storage.getClientById(apt.clientId);
        const staffMember = apt.staffId ? await storage.getStaffById(apt.staffId) : null;
        const services = await storage.getAppointmentServices(apt.id);
        
        return {
          ...apt,
          client: client ? { id: client.id, name: client.name } : null,
          staff: staffMember ? { id: staffMember.id, name: `${staffMember.firstName} ${staffMember.lastName}` } : null,
          services,
        };
      })
    );

    res.json({ data: enrichedAppointments });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get appointments' } });
  }
});

router.get('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await storage.getAppointmentById(req.params.id);
    if (!appointment) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
      return;
    }
    
    const client = await storage.getClientById(appointment.clientId);
    const staffMember = appointment.staffId ? await storage.getStaffById(appointment.staffId) : null;
    const services = await storage.getAppointmentServices(appointment.id);
    
    res.json({
      appointment: {
        ...appointment,
        client,
        staff: staffMember,
        services,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get appointment' } });
  }
});

router.post('/appointments', authMiddleware, validateBody(createAppointmentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { serviceIds, ...appointmentData } = req.body;
    
    if (appointmentData.staffId && appointmentData.startTime && appointmentData.endTime) {
      const conflicts = await storage.checkAppointmentConflict(
        appointmentData.staffId,
        new Date(appointmentData.startTime),
        new Date(appointmentData.endTime)
      );
      
      if (conflicts.length > 0) {
        res.status(409).json({
          error: {
            code: 'APPOINTMENT_CONFLICT',
            message: 'This time slot conflicts with another appointment',
            details: { conflictingAppointments: conflicts },
          },
        });
        return;
      }
    }
    
    const appointment = await storage.createAppointment({
      ...appointmentData,
      createdBy: req.user!.userId,
    });
    
    if (serviceIds && Array.isArray(serviceIds)) {
      for (const serviceId of serviceIds) {
        const service = await storage.getServiceById(serviceId);
        if (service) {
          await storage.addAppointmentService({
            appointmentId: appointment.id,
            serviceId: service.id,
            price: service.price,
            duration: service.duration,
          });
        }
      }
    }
    
    res.status(201).json({ appointment });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create appointment' } });
  }
});

router.put('/appointments/:id', authMiddleware, validateBody(updateAppointmentSchema), async (req, res) => {
  try {
    const { serviceIds, ...appointmentData} = req.body;
    
    if (appointmentData.staffId && appointmentData.startTime && appointmentData.endTime) {
      const conflicts = await storage.checkAppointmentConflict(
        appointmentData.staffId,
        new Date(appointmentData.startTime),
        new Date(appointmentData.endTime),
        req.params.id
      );
      
      if (conflicts.length > 0) {
        res.status(409).json({
          error: {
            code: 'APPOINTMENT_CONFLICT',
            message: 'This time slot conflicts with another appointment',
            details: { conflictingAppointments: conflicts },
          },
        });
        return;
      }
    }
    
    const appointment = await storage.updateAppointment(req.params.id, appointmentData);
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update appointment' } });
  }
});

router.delete('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    await storage.deleteAppointment(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete appointment' } });
  }
});

router.post('/appointments/check-availability', authMiddleware, async (req, res) => {
  try {
    const { staffId, startTime, endTime, excludeAppointmentId } = req.body;
    
    const conflicts = await storage.checkAppointmentConflict(
      staffId,
      new Date(startTime),
      new Date(endTime),
      excludeAppointmentId
    );
    
    res.json({
      available: conflicts.length === 0,
      conflicts: conflicts.map(apt => ({
        id: apt.id,
        startTime: apt.startTime,
        endTime: apt.endTime,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to check availability' } });
  }
});

router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, clientId, status, page = '1', limit = '20' } = req.query;
    
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const result = await storage.getSales({
      startDate: startDate as string,
      endDate: endDate as string,
      clientId: clientId as string,
      status: status as string,
      limit: parseInt(limit as string),
      offset,
    });

    res.json({
      data: result.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get sales' } });
  }
});

router.get('/sales/:id', authMiddleware, async (req, res) => {
  try {
    const sale = await storage.getSaleById(req.params.id);
    if (!sale) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sale not found' } });
      return;
    }
    
    const items = await storage.getSaleItems(sale.id);
    const paymentMethods = await storage.getPaymentMethods(sale.id);
    const client = sale.clientId ? await storage.getClientById(sale.clientId) : null;
    
    res.json({
      sale: {
        ...sale,
        items,
        paymentMethods,
        client,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get sale' } });
  }
});

router.post('/sales', authMiddleware, validateBody(createSaleSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { items, paymentMethods, ...saleData } = req.body;
    
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const sale = await storage.createSale({
      ...saleData,
      transactionId,
      completedBy: req.user!.userId,
      completedAt: new Date(),
    });
    
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await storage.addSaleItem({
          saleId: sale.id,
          ...item,
        });
      }
    }
    
    if (paymentMethods && Array.isArray(paymentMethods)) {
      for (const payment of paymentMethods) {
        await storage.addPaymentMethod({
          saleId: sale.id,
          ...payment,
        });
      }
    }
    
    res.status(201).json({ sale });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create sale' } });
  }
});

router.get('/products', authMiddleware, async (req, res) => {
  try {
    const { search, typeId, manufacturerId, isActive, lowStock } = req.query;
    
    const products = await storage.getProducts({
      search: search as string,
      typeId: typeId as string,
      manufacturerId: manufacturerId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      lowStock: lowStock === 'true',
    });

    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get products' } });
  }
});

router.get('/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await storage.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
      return;
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get product' } });
  }
});

router.post('/products', authMiddleware, validateBody(createProductSchema), async (req, res) => {
  try {
    const product = await storage.createProduct(req.body);
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create product' } });
  }
});

router.put('/products/:id', authMiddleware, validateBody(updateProductSchema), async (req, res) => {
  try {
    const product = await storage.updateProduct(req.params.id, req.body);
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update product' } });
  }
});

router.delete('/products/:id', authMiddleware, async (req, res) => {
  try {
    await storage.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete product' } });
  }
});

router.get('/manufacturers', authMiddleware, async (req, res) => {
  try {
    const manufacturers = await storage.getManufacturers();
    res.json({ data: manufacturers });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get manufacturers' } });
  }
});

router.post('/manufacturers', authMiddleware, async (req, res) => {
  try {
    const manufacturer = await storage.createManufacturer(req.body);
    res.status(201).json({ manufacturer });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create manufacturer' } });
  }
});

router.get('/product-types', authMiddleware, async (req, res) => {
  try {
    const types = await storage.getProductTypes();
    res.json({ data: types });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get product types' } });
  }
});

router.post('/product-types', authMiddleware, async (req, res) => {
  try {
    const type = await storage.createProductType(req.body);
    res.status(201).json({ type });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create product type' } });
  }
});

export default router;
