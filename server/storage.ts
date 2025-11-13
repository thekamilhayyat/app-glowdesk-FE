import { db } from './db';
import { eq, ne, and, gte, lte, lt, gt, or, ilike, desc, asc, not, inArray } from 'drizzle-orm';
import * as schema from '../shared/schema';
import type {
  Client, InsertClient,
  Staff, InsertStaff,
  Service, InsertService,
  Appointment, InsertAppointment,
  Sale, InsertSale,
  SaleItem, InsertSaleItem,
  PaymentMethod, InsertPaymentMethod,
  Product, InsertProduct,
  Manufacturer, InsertManufacturer,
  ProductType, InsertProductType,
  User, InsertUser,
  StaffService, InsertStaffService,
  AppointmentService, InsertAppointmentService,
} from '../shared/schema';

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Clients
  getClients(params?: { search?: string; isVip?: boolean; limit?: number; offset?: number }): Promise<{ data: Client[]; total: number }>;
  getClientById(id: string): Promise<Client | undefined>;
  createClient(data: InsertClient): Promise<Client>;
  updateClient(id: string, data: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Staff
  getStaff(params?: { isActive?: boolean; serviceId?: string }): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | undefined>;
  createStaff(data: InsertStaff): Promise<Staff>;
  updateStaff(id: string, data: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;

  // Services
  getServices(params?: { category?: string; isActive?: boolean; staffId?: string }): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;
  createService(data: InsertService): Promise<Service>;
  updateService(id: string, data: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Staff Services
  getStaffServices(staffId: string): Promise<Service[]>;
  assignServiceToStaff(data: InsertStaffService): Promise<void>;
  removeServiceFromStaff(staffId: string, serviceId: string): Promise<void>;

  // Appointments
  getAppointments(params?: { 
    startDate?: string; 
    endDate?: string; 
    clientId?: string; 
    staffId?: string; 
    status?: string;
    date?: string;
  }): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, data: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;
  checkAppointmentConflict(staffId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<Appointment[]>;

  // Appointment Services
  getAppointmentServices(appointmentId: string): Promise<AppointmentService[]>;
  addAppointmentService(data: InsertAppointmentService): Promise<AppointmentService>;
  removeAppointmentService(id: string): Promise<void>;

  // Sales
  getSales(params?: { 
    startDate?: string; 
    endDate?: string; 
    clientId?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Sale[]; total: number }>;
  getSaleById(id: string): Promise<Sale | undefined>;
  createSale(data: InsertSale): Promise<Sale>;
  updateSale(id: string, data: Partial<InsertSale>): Promise<Sale>;

  // Sale Items
  getSaleItems(saleId: string): Promise<SaleItem[]>;
  addSaleItem(data: InsertSaleItem): Promise<SaleItem>;

  // Payment Methods
  getPaymentMethods(saleId: string): Promise<PaymentMethod[]>;
  addPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod>;

  // Products
  getProducts(params?: { 
    search?: string; 
    typeId?: string; 
    manufacturerId?: string; 
    isActive?: boolean;
    lowStock?: boolean;
  }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Manufacturers
  getManufacturers(): Promise<Manufacturer[]>;
  getManufacturerById(id: string): Promise<Manufacturer | undefined>;
  createManufacturer(data: InsertManufacturer): Promise<Manufacturer>;
  updateManufacturer(id: string, data: Partial<InsertManufacturer>): Promise<Manufacturer>;

  // Product Types
  getProductTypes(): Promise<ProductType[]>;
  getProductTypeById(id: string): Promise<ProductType | undefined>;
  createProductType(data: InsertProductType): Promise<ProductType>;
  updateProductType(id: string, data: Partial<InsertProductType>): Promise<ProductType>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(data: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(data).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const result = await db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  // Clients
  async getClients(params?: { search?: string; isVip?: boolean; limit?: number; offset?: number }): Promise<{ data: Client[]; total: number }> {
    const conditions = [];
    
    if (params?.search) {
      conditions.push(
        or(
          ilike(schema.clients.name, `%${params.search}%`),
          ilike(schema.clients.email, `%${params.search}%`),
          ilike(schema.clients.phone, `%${params.search}%`)
        )
      );
    }
    
    if (params?.isVip !== undefined) {
      conditions.push(eq(schema.clients.isVip, params.isVip));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const data = await db.select()
      .from(schema.clients)
      .where(whereClause)
      .limit(params?.limit || 100)
      .offset(params?.offset || 0)
      .orderBy(desc(schema.clients.createdAt));
    
    const totalResult = await db.select().from(schema.clients).where(whereClause);
    
    return { data, total: totalResult.length };
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const result = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);
    return result[0];
  }

  async createClient(data: InsertClient): Promise<Client> {
    const result = await db.insert(schema.clients).values(data).returning();
    return result[0];
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client> {
    const result = await db.update(schema.clients).set(data).where(eq(schema.clients.id, id)).returning();
    return result[0];
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(schema.clients).where(eq(schema.clients.id, id));
  }

  // Staff
  async getStaff(params?: { isActive?: boolean; serviceId?: string }): Promise<Staff[]> {
    if (params?.serviceId) {
      const conditions = [eq(schema.staffServices.serviceId, params.serviceId)];
      
      if (params.isActive !== undefined) {
        conditions.push(eq(schema.staff.isActive, params.isActive));
      }
      
      const result = await db
        .select({ staff: schema.staff })
        .from(schema.staffServices)
        .innerJoin(schema.staff, eq(schema.staffServices.staffId, schema.staff.id))
        .where(and(...conditions))
        .orderBy(asc(schema.staff.firstName));
      
      return result.map(r => r.staff);
    }
    
    const conditions = [];
    
    if (params?.isActive !== undefined) {
      conditions.push(eq(schema.staff.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(schema.staff).where(whereClause).orderBy(asc(schema.staff.firstName));
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    const result = await db.select().from(schema.staff).where(eq(schema.staff.id, id)).limit(1);
    return result[0];
  }

  async createStaff(data: InsertStaff): Promise<Staff> {
    const result = await db.insert(schema.staff).values(data).returning();
    return result[0];
  }

  async updateStaff(id: string, data: Partial<InsertStaff>): Promise<Staff> {
    const result = await db.update(schema.staff).set(data).where(eq(schema.staff.id, id)).returning();
    return result[0];
  }

  async deleteStaff(id: string): Promise<void> {
    await db.delete(schema.staff).where(eq(schema.staff.id, id));
  }

  // Services
  async getServices(params?: { category?: string; isActive?: boolean; staffId?: string }): Promise<Service[]> {
    if (params?.staffId) {
      const conditions = [eq(schema.staffServices.staffId, params.staffId)];
      
      if (params.category) {
        conditions.push(eq(schema.services.category, params.category));
      }
      
      if (params.isActive !== undefined) {
        conditions.push(eq(schema.services.isActive, params.isActive));
      }
      
      const result = await db
        .select({ service: schema.services })
        .from(schema.staffServices)
        .innerJoin(schema.services, eq(schema.staffServices.serviceId, schema.services.id))
        .where(and(...conditions))
        .orderBy(asc(schema.services.displayOrder));
      
      return result.map(r => r.service);
    }
    
    const conditions = [];
    
    if (params?.category) {
      conditions.push(eq(schema.services.category, params.category));
    }
    
    if (params?.isActive !== undefined) {
      conditions.push(eq(schema.services.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(schema.services).where(whereClause).orderBy(asc(schema.services.displayOrder));
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    const result = await db.select().from(schema.services).where(eq(schema.services.id, id)).limit(1);
    return result[0];
  }

  async createService(data: InsertService): Promise<Service> {
    const result = await db.insert(schema.services).values(data).returning();
    return result[0];
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<Service> {
    const result = await db.update(schema.services).set(data).where(eq(schema.services.id, id)).returning();
    return result[0];
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(schema.services).where(eq(schema.services.id, id));
  }

  // Staff Services
  async getStaffServices(staffId: string): Promise<Service[]> {
    const result = await db
      .select({ service: schema.services })
      .from(schema.staffServices)
      .innerJoin(schema.services, eq(schema.staffServices.serviceId, schema.services.id))
      .where(eq(schema.staffServices.staffId, staffId));
    
    return result.map(r => r.service);
  }

  async assignServiceToStaff(data: InsertStaffService): Promise<void> {
    await db.insert(schema.staffServices).values(data);
  }

  async removeServiceFromStaff(staffId: string, serviceId: string): Promise<void> {
    await db.delete(schema.staffServices)
      .where(and(
        eq(schema.staffServices.staffId, staffId),
        eq(schema.staffServices.serviceId, serviceId)
      ));
  }

  // Appointments
  async getAppointments(params?: { 
    startDate?: string; 
    endDate?: string; 
    clientId?: string; 
    staffId?: string; 
    status?: string;
    date?: string;
  }): Promise<Appointment[]> {
    const conditions = [];
    
    if (params?.startDate) {
      conditions.push(gte(schema.appointments.startTime, new Date(params.startDate)));
    }
    
    if (params?.endDate) {
      conditions.push(lte(schema.appointments.endTime, new Date(params.endDate)));
    }
    
    if (params?.clientId) {
      conditions.push(eq(schema.appointments.clientId, params.clientId));
    }
    
    if (params?.staffId) {
      conditions.push(eq(schema.appointments.staffId, params.staffId));
    }
    
    if (params?.status) {
      conditions.push(eq(schema.appointments.status, params.status));
    }
    
    if (params?.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(params.date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(
        and(
          gte(schema.appointments.startTime, startOfDay),
          lte(schema.appointments.startTime, endOfDay)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(schema.appointments).where(whereClause).orderBy(asc(schema.appointments.startTime));
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id)).limit(1);
    return result[0];
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(schema.appointments).values(data).returning();
    return result[0];
  }

  async updateAppointment(id: string, data: Partial<InsertAppointment>): Promise<Appointment> {
    const result = await db.update(schema.appointments).set(data).where(eq(schema.appointments.id, id)).returning();
    return result[0];
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(schema.appointments).where(eq(schema.appointments.id, id));
  }

  async checkAppointmentConflict(staffId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<Appointment[]> {
    let query = db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.staffId, staffId),
          lt(schema.appointments.startTime, endTime),
          gt(schema.appointments.endTime, startTime)
        )
      );
    
    const results = await query;
    
    return results.filter(apt => 
      apt.status !== 'cancelled' && 
      apt.status !== 'completed' && 
      apt.status !== 'no-show' &&
      (!excludeId || apt.id !== excludeId)
    );
  }

  // Appointment Services
  async getAppointmentServices(appointmentId: string): Promise<AppointmentService[]> {
    return await db.select()
      .from(schema.appointmentServices)
      .where(eq(schema.appointmentServices.appointmentId, appointmentId));
  }

  async addAppointmentService(data: InsertAppointmentService): Promise<AppointmentService> {
    const result = await db.insert(schema.appointmentServices).values(data).returning();
    return result[0];
  }

  async removeAppointmentService(id: string): Promise<void> {
    await db.delete(schema.appointmentServices).where(eq(schema.appointmentServices.id, id));
  }

  // Sales
  async getSales(params?: { 
    startDate?: string; 
    endDate?: string; 
    clientId?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Sale[]; total: number }> {
    const conditions = [];
    
    if (params?.startDate) {
      conditions.push(gte(schema.sales.completedAt, new Date(params.startDate)));
    }
    
    if (params?.endDate) {
      conditions.push(lte(schema.sales.completedAt, new Date(params.endDate)));
    }
    
    if (params?.clientId) {
      conditions.push(eq(schema.sales.clientId, params.clientId));
    }
    
    if (params?.status) {
      conditions.push(eq(schema.sales.status, params.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const data = await db.select()
      .from(schema.sales)
      .where(whereClause)
      .limit(params?.limit || 100)
      .offset(params?.offset || 0)
      .orderBy(desc(schema.sales.completedAt));
    
    const totalResult = await db.select().from(schema.sales).where(whereClause);
    
    return { data, total: totalResult.length };
  }

  async getSaleById(id: string): Promise<Sale | undefined> {
    const result = await db.select().from(schema.sales).where(eq(schema.sales.id, id)).limit(1);
    return result[0];
  }

  async createSale(data: InsertSale): Promise<Sale> {
    const result = await db.insert(schema.sales).values(data).returning();
    return result[0];
  }

  async updateSale(id: string, data: Partial<InsertSale>): Promise<Sale> {
    const result = await db.update(schema.sales).set(data).where(eq(schema.sales.id, id)).returning();
    return result[0];
  }

  // Sale Items
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return await db.select().from(schema.saleItems).where(eq(schema.saleItems.saleId, saleId));
  }

  async addSaleItem(data: InsertSaleItem): Promise<SaleItem> {
    const result = await db.insert(schema.saleItems).values(data).returning();
    return result[0];
  }

  // Payment Methods
  async getPaymentMethods(saleId: string): Promise<PaymentMethod[]> {
    return await db.select().from(schema.paymentMethods).where(eq(schema.paymentMethods.saleId, saleId));
  }

  async addPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
    const result = await db.insert(schema.paymentMethods).values(data).returning();
    return result[0];
  }

  // Products
  async getProducts(params?: { 
    search?: string; 
    typeId?: string; 
    manufacturerId?: string; 
    isActive?: boolean;
    lowStock?: boolean;
  }): Promise<Product[]> {
    const conditions = [];
    
    if (params?.search) {
      conditions.push(
        or(
          ilike(schema.products.name, `%${params.search}%`),
          ilike(schema.products.sku, `%${params.search}%`)
        )
      );
    }
    
    if (params?.typeId) {
      conditions.push(eq(schema.products.typeId, params.typeId));
    }
    
    if (params?.manufacturerId) {
      conditions.push(eq(schema.products.manufacturerId, params.manufacturerId));
    }
    
    if (params?.isActive !== undefined) {
      conditions.push(eq(schema.products.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(schema.products).where(whereClause).orderBy(asc(schema.products.name));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values(data).returning();
    return result[0];
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product> {
    const result = await db.update(schema.products).set(data).where(eq(schema.products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  // Manufacturers
  async getManufacturers(): Promise<Manufacturer[]> {
    return await db.select().from(schema.manufacturers).orderBy(asc(schema.manufacturers.name));
  }

  async getManufacturerById(id: string): Promise<Manufacturer | undefined> {
    const result = await db.select().from(schema.manufacturers).where(eq(schema.manufacturers.id, id)).limit(1);
    return result[0];
  }

  async createManufacturer(data: InsertManufacturer): Promise<Manufacturer> {
    const result = await db.insert(schema.manufacturers).values(data).returning();
    return result[0];
  }

  async updateManufacturer(id: string, data: Partial<InsertManufacturer>): Promise<Manufacturer> {
    const result = await db.update(schema.manufacturers).set(data).where(eq(schema.manufacturers.id, id)).returning();
    return result[0];
  }

  // Product Types
  async getProductTypes(): Promise<ProductType[]> {
    return await db.select().from(schema.productTypes).orderBy(asc(schema.productTypes.displayOrder));
  }

  async getProductTypeById(id: string): Promise<ProductType | undefined> {
    const result = await db.select().from(schema.productTypes).where(eq(schema.productTypes.id, id)).limit(1);
    return result[0];
  }

  async createProductType(data: InsertProductType): Promise<ProductType> {
    const result = await db.insert(schema.productTypes).values(data).returning();
    return result[0];
  }

  async updateProductType(id: string, data: Partial<InsertProductType>): Promise<ProductType> {
    const result = await db.update(schema.productTypes).set(data).where(eq(schema.productTypes.id, id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
