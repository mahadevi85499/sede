import { pgTable, text, integer, boolean, timestamp, decimal, uuid, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Menu Items table
export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  image: text('image'),
  isVegetarian: boolean('is_vegetarian').default(false),
  isSpicy: boolean('is_spicy').default(false),
  preparationTime: integer('preparation_time').default(15), // minutes
  inStock: boolean('in_stock').default(true),
  inventory: integer('inventory').default(100),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableNumber: text('table_number'),
  customerName: text('customer_name'),
  items: jsonb('items').notNull(), // Array of {menuItemId, quantity, price}
  status: text('status').notNull().default('pending'), // pending, preparing, ready, completed
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  orderType: text('order_type').notNull().default('dine-in'), // dine-in, takeout, delivery
  paymentMode: text('payment_mode'), // upi, cash, card
  scheduledTime: timestamp('scheduled_time'), // For order-ahead
  loyaltyPointsEarned: integer('loyalty_points_earned').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Reservations table
export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerName: text('customer_name').notNull(),
  contactNumber: text('contact_number').notNull(),
  partySize: integer('party_size').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD format
  time: text('time').notNull(), // HH:MM format
  status: text('status').notNull().default('pending'), // pending, confirmed, cancelled, completed
  specialRequests: text('special_requests'),
  tableNumber: integer('table_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tables table
export const tables = pgTable('tables', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: integer('number').notNull().unique(),
  seats: integer('seats').notNull(),
  status: text('status').notNull().default('available'), // available, occupied, reserved, maintenance
  currentOrderId: uuid('current_order_id'),
  reservedBy: text('reserved_by'),
  reservedUntil: text('reserved_until'), // HH:MM format
  createdAt: timestamp('created_at').defaultNow(),
});

// Service Requests table
export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableNumber: integer('table_number').notNull(),
  requestType: text('request_type').notNull(), // staff, water, hot-water, cleaning
  status: text('status').notNull().default('pending'), // pending, completed
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Feedback table
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableNumber: integer('table_number').notNull(),
  orderId: uuid('order_id'),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Loyalty Points table
export const loyaltyPoints = pgTable('loyalty_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: text('customer_id').notNull(), // Could be phone number or email
  points: integer('points').notNull().default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Insert schemas for validation
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
});

export const insertTableSchema = createInsertSchema(tables).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPoints).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoints = z.infer<typeof insertLoyaltyPointsSchema>;