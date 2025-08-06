import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Restaurant API Routes
  
  // Menu Management API
  app.get("/api/menu", async (req, res) => {
    try {
      // Get menu items from storage
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu", async (req, res) => {
    try {
      const menuItem = req.body;
      const result = await storage.addMenuItem(menuItem);
      res.json(result);
    } catch (error) {
      console.error("Error adding menu item:", error);
      res.status(500).json({ error: "Failed to add menu item" });
    }
  });

  app.delete("/api/menu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteMenuItem(id);
      res.json({ success: result });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });

  app.put("/api/menu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const result = await storage.updateMenuItem(id, updates);
      res.json(result);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = req.body;
      const result = await storage.createOrder(order);
      res.json(result);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Tables API
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const table = req.body;
      const result = await storage.createTable(table);
      res.json(result);
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(500).json({ error: "Failed to create table" });
    }
  });

  app.get("/api/tables/:number", async (req, res) => {
    try {
      const tables = await storage.getTables();
      const table = tables.find(t => t.number === parseInt(req.params.number));
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      console.error("Error fetching table:", error);
      res.status(500).json({ error: "Failed to fetch table" });
    }
  });

  app.put("/api/tables/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const result = await storage.updateTable(id, updates);
      res.json(result);
    } catch (error) {
      console.error("Error updating table:", error);
      res.status(500).json({ error: "Failed to update table" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const orderId = req.params.id;
      const updates = req.body;
      const result = await storage.updateOrder(orderId, updates);
      res.json(result);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Reservations API
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const reservation = req.body;
      const result = await storage.createReservation(reservation);
      res.json(result);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  // Service Requests API
  app.get("/api/service-requests", async (req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.post("/api/service-requests", async (req, res) => {
    try {
      const request = req.body;
      const result = await storage.createServiceRequest(request);
      res.json(result);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(500).json({ error: "Failed to create service request" });
    }
  });

  // Tables API
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const table = req.body;
      const result = await storage.createTable(table);
      res.json(result);
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(500).json({ error: "Failed to create table" });
    }
  });

  // Feedback API
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedback = req.body;
      const result = await storage.createFeedback(feedback);
      res.json(result);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "Restaurant Management System API"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
