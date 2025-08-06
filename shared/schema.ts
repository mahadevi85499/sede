import { z } from "zod";

// Event types for Firestore collection
export const eventTypeSchema = z.enum(["order", "service-request", "billing-request", "reservation", "feedback"]);

// Reservation schema
export const reservationSchema = z.object({
  type: z.literal("reservation"),
  customerName: z.string(),
  customerPhone: z.string(),
  date: z.string(), // ISO date string
  time: z.string(), // HH:MM format
  partySize: z.number().min(1).max(20),
  table: z.number().optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
  timestamp: z.any(), // Firebase serverTimestamp
});

// Feedback schema
export const feedbackSchema = z.object({
  type: z.literal("feedback"),
  table: z.number(),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  timestamp: z.any(), // Firebase serverTimestamp
});

// Loyalty points schema
export const loyaltyPointsSchema = z.object({
  customerId: z.string(),
  points: z.number(),
  lastUpdated: z.any(),
});

// Enhanced menu item schema
export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  pack: z.boolean().default(false),
});

// Full menu item definition for restaurant
export const fullMenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  image: z.string().optional(),
  inStock: z.boolean().default(true),
  inventory: z.number().default(100),
});

// Enhanced order event schema
export const orderEventSchema = z.object({
  type: z.literal("order"),
  table: z.number(),
  items: z.array(menuItemSchema),
  paymentMode: z.enum(["upi", "cash"]),
  orderType: z.enum(["dine-in", "takeout", "order-ahead"]).default("dine-in"),
  scheduledTime: z.string().optional(), // For order-ahead
  status: z.enum(["pending", "preparing", "ready", "served", "paid"]).default("pending"),
  totalAmount: z.number().optional(),
  loyaltyPointsEarned: z.number().default(0),
  timestamp: z.any(), // Firebase serverTimestamp
});

// Service request event schema
export const serviceRequestEventSchema = z.object({
  type: z.literal("service-request"),
  table: z.number(),
  request: z.enum(["staff", "water", "hot-water", "cleaning"]),
  timestamp: z.any(), // Firebase serverTimestamp
});

// Billing request event schema
export const billingRequestEventSchema = z.object({
  type: z.literal("billing-request"),
  table: z.number(),
  timestamp: z.any(), // Firebase serverTimestamp
});

// Union of all event types
export const eventSchema = z.discriminatedUnion("type", [
  orderEventSchema,
  serviceRequestEventSchema,
  billingRequestEventSchema,
  reservationSchema,
  feedbackSchema,
]);

// Insert schemas (without ID)
export const insertOrderEventSchema = orderEventSchema;
export const insertServiceRequestEventSchema = serviceRequestEventSchema;
export const insertBillingRequestEventSchema = billingRequestEventSchema;

// Types
export type EventType = z.infer<typeof eventTypeSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type FullMenuItem = z.infer<typeof fullMenuItemSchema>;
export type OrderEvent = z.infer<typeof orderEventSchema>;
export type ServiceRequestEvent = z.infer<typeof serviceRequestEventSchema>;
export type BillingRequestEvent = z.infer<typeof billingRequestEventSchema>;
export type ReservationEvent = z.infer<typeof reservationSchema>;
export type FeedbackEvent = z.infer<typeof feedbackSchema>;
export type LoyaltyPoints = z.infer<typeof loyaltyPointsSchema>;
export type Event = z.infer<typeof eventSchema>;
export type InsertOrderEvent = z.infer<typeof insertOrderEventSchema>;
export type InsertServiceRequestEvent = z.infer<typeof insertServiceRequestEventSchema>;
export type InsertBillingRequestEvent = z.infer<typeof insertBillingRequestEventSchema>;
export type InsertReservationEvent = z.infer<typeof reservationSchema>;
export type InsertFeedbackEvent = z.infer<typeof feedbackSchema>;

// Initial menu data - items will be loaded from Firebase
// Remove dummy data as requested - real menu items should be managed through admin panel
export const MENU_ITEMS: FullMenuItem[] = [];

export const MENU_CATEGORIES = [
  { id: "starters", name: "Starters" },
  { id: "main-course", name: "Main Course" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
  { id: "beverages", name: "Beverages" },
  { id: "snacks", name: "Snacks" },
];
