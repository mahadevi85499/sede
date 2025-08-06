import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/drizzle-schema';

// This will be populated when you provide the DATABASE_URL
let db: ReturnType<typeof drizzle> | null = null;

export function initializeDatabase(databaseUrl: string) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  
  const sql = postgres(databaseUrl);
  db = drizzle(sql, { schema });
  return db;
}

export function getDatabase() {
  if (!db) {
    // Try to initialize with environment variable
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      return initializeDatabase(databaseUrl);
    }
    throw new Error('Database not initialized. Please provide DATABASE_URL.');
  }
  return db;
}

// Database service class that replaces the memory storage
export class DatabaseService {
  private db = getDatabase();

  // Menu Management
  async getMenuItems() {
    return await this.db.select().from(schema.menuItems);
  }

  async addMenuItem(item: schema.InsertMenuItem) {
    const [newItem] = await this.db.insert(schema.menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: string, updates: Partial<schema.MenuItem>) {
    const [updatedItem] = await this.db
      .update(schema.menuItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: string) {
    await this.db.delete(schema.menuItems).where(eq(schema.menuItems.id, id));
    return true;
  }

  // Order Management
  async getOrders() {
    return await this.db.select().from(schema.orders);
  }

  async createOrder(order: schema.InsertOrder) {
    const [newOrder] = await this.db.insert(schema.orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<schema.Order>) {
    const [updatedOrder] = await this.db
      .update(schema.orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getOrderById(id: string) {
    const [order] = await this.db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return order;
  }

  // Reservation Management
  async getReservations() {
    return await this.db.select().from(schema.reservations);
  }

  async createReservation(reservation: schema.InsertReservation) {
    const [newReservation] = await this.db.insert(schema.reservations).values(reservation).returning();
    return newReservation;
  }

  async updateReservation(id: string, updates: Partial<schema.Reservation>) {
    const [updatedReservation] = await this.db
      .update(schema.reservations)
      .set(updates)
      .where(eq(schema.reservations.id, id))
      .returning();
    return updatedReservation;
  }

  // Table Management
  async getTables() {
    return await this.db.select().from(schema.tables);
  }

  async createTable(table: schema.InsertTable) {
    const [newTable] = await this.db.insert(schema.tables).values(table).returning();
    return newTable;
  }

  async updateTable(id: string, updates: Partial<schema.Table>) {
    const [updatedTable] = await this.db
      .update(schema.tables)
      .set(updates)
      .where(eq(schema.tables.id, id))
      .returning();
    return updatedTable;
  }

  // Service Request Management
  async getServiceRequests() {
    return await this.db.select().from(schema.serviceRequests);
  }

  async createServiceRequest(request: schema.InsertServiceRequest) {
    const [newRequest] = await this.db.insert(schema.serviceRequests).values(request).returning();
    return newRequest;
  }

  async completeServiceRequest(id: string) {
    const [completedRequest] = await this.db
      .update(schema.serviceRequests)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(schema.serviceRequests.id, id))
      .returning();
    return completedRequest;
  }

  // Feedback Management
  async getFeedback() {
    return await this.db.select().from(schema.feedback);
  }

  async createFeedback(feedback: schema.InsertFeedback) {
    const [newFeedback] = await this.db.insert(schema.feedback).values(feedback).returning();
    return newFeedback;
  }

  // Loyalty Points Management
  async getLoyaltyPoints(customerId: string) {
    const [points] = await this.db
      .select()
      .from(schema.loyaltyPoints)
      .where(eq(schema.loyaltyPoints.customerId, customerId));
    return points;
  }

  async updateLoyaltyPoints(customerId: string, points: number) {
    const existing = await this.getLoyaltyPoints(customerId);
    
    if (existing) {
      const [updated] = await this.db
        .update(schema.loyaltyPoints)
        .set({ points, lastUpdated: new Date() })
        .where(eq(schema.loyaltyPoints.customerId, customerId))
        .returning();
      return updated;
    } else {
      const [newPoints] = await this.db
        .insert(schema.loyaltyPoints)
        .values({ customerId, points })
        .returning();
      return newPoints;
    }
  }
}

// Import eq function for queries
import { eq } from 'drizzle-orm';