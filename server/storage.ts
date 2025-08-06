// Restaurant Management System Storage Interface
import { DatabaseService } from './database';
import type { 
  MenuItem, InsertMenuItem,
  Order, InsertOrder,
  Reservation, InsertReservation,
  Table, InsertTable,
  ServiceRequest, InsertServiceRequest,
  Feedback, InsertFeedback
} from '../shared/drizzle-schema';

export interface IStorage {
  // Menu Management
  getMenuItems(): Promise<MenuItem[]>;
  addMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<boolean>;
  
  // Order Management
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
  
  // Reservation Management
  getReservations(): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation>;
  
  // Table Management
  getTables(): Promise<Table[]>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: string, updates: Partial<Table>): Promise<Table>;
  
  // Service Request Management
  getServiceRequests(): Promise<ServiceRequest[]>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  completeServiceRequest(id: string): Promise<ServiceRequest>;
  
  // Feedback Management
  getFeedback(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Loyalty Points Management
  getLoyaltyPoints(customerId: string): Promise<any>;
  updateLoyaltyPoints(customerId: string, points: number): Promise<any>;
}

// Clean storage implementation ready for Supabase connection
export class MemStorage implements IStorage {
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private reservations: Map<string, Reservation> = new Map();
  private tables: Map<string, Table> = new Map();
  private serviceRequests: Map<string, ServiceRequest> = new Map();
  private feedback: Map<string, Feedback> = new Map();
  private loyaltyPoints: Map<string, any> = new Map();
  private currentId = 1;

  constructor() {
    // Clean environment - no dummy data
  }

  // Menu Management
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async addMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = (this.currentId++).toString();
    const menuItem: MenuItem = { 
      ...item, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as MenuItem;
    this.menuItems.set(id, menuItem);
    return menuItem;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const existing = this.menuItems.get(id);
    if (!existing) throw new Error('Menu item not found');
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.menuItems.set(id, updated);
    return updated;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // Order Management
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = (this.currentId++).toString();
    const now = new Date();
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: now, 
      updatedAt: now 
    } as Order;
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const existing = this.orders.get(id);
    if (!existing) throw new Error('Order not found');
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  // Reservation Management
  async getReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values());
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const id = (this.currentId++).toString();
    const newReservation: Reservation = { 
      ...reservation, 
      id, 
      createdAt: new Date() 
    } as Reservation;
    this.reservations.set(id, newReservation);
    return newReservation;
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const existing = this.reservations.get(id);
    if (!existing) throw new Error('Reservation not found');
    
    const updated = { ...existing, ...updates };
    this.reservations.set(id, updated);
    return updated;
  }

  // Table Management
  async getTables(): Promise<Table[]> {
    return Array.from(this.tables.values());
  }

  async createTable(table: InsertTable): Promise<Table> {
    const id = (this.currentId++).toString();
    const newTable: Table = { 
      ...table, 
      id, 
      createdAt: new Date() 
    } as Table;
    this.tables.set(id, newTable);
    return newTable;
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table> {
    const existing = this.tables.get(id);
    if (!existing) throw new Error('Table not found');
    
    const updated = { ...existing, ...updates };
    this.tables.set(id, updated);
    return updated;
  }

  // Service Request Management
  async getServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values());
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const id = (this.currentId++).toString();
    const newRequest: ServiceRequest = { 
      ...request, 
      id, 
      createdAt: new Date() 
    } as ServiceRequest;
    this.serviceRequests.set(id, newRequest);
    return newRequest;
  }

  async completeServiceRequest(id: string): Promise<ServiceRequest> {
    const existing = this.serviceRequests.get(id);
    if (!existing) throw new Error('Service request not found');
    
    const updated = { ...existing, status: 'completed', completedAt: new Date() };
    this.serviceRequests.set(id, updated);
    return updated;
  }

  // Feedback Management
  async getFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values());
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const id = (this.currentId++).toString();
    const newFeedback: Feedback = { 
      ...feedbackData, 
      id, 
      createdAt: new Date() 
    } as Feedback;
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }

  // Loyalty Points Management
  async getLoyaltyPoints(customerId: string): Promise<any> {
    return this.loyaltyPoints.get(customerId) || { customerId, points: 0 };
  }

  async updateLoyaltyPoints(customerId: string, points: number): Promise<any> {
    const loyaltyData = { customerId, points, lastUpdated: new Date() };
    this.loyaltyPoints.set(customerId, loyaltyData);
    return loyaltyData;
  }
}

// Initialize storage based on DATABASE_URL
function initializeStorage(): IStorage {
  // Log all environment variables for debugging
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    SUPABASE_DB_PASSWORD_EXISTS: !!process.env.SUPABASE_DB_PASSWORD
  });
  
  if (process.env.DATABASE_URL) {
    try {
      console.log('🔄 Attempting to connect to database with URL:', process.env.DATABASE_URL);
      // Using the already imported DatabaseService from the top of the file
      const dbService = new DatabaseService();
      console.log('📦 Storage initialized: Supabase Database');
      return dbService;
    } catch (error) {
      console.error('⚠️ Database connection failed, falling back to in-memory storage:');
      console.error(error);
      return new MemStorage();
    }
  } else {
    console.log('📦 Storage initialized: In-Memory Storage (DATABASE_URL not found)');
    return new MemStorage();
  }
}

export const storage = initializeStorage();
