import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertTaxiStatsSchema, insertRecordingSchema } from "@shared/schema";
import session from "express-session";

// Extend session type to include userId
declare module "express-session" {
  export interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to false for Replit deployment
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(loginData.email);
      
      if (!user || user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  });

  // Taxi routes
  app.get("/api/taxis", requireAuth, async (req, res) => {
    try {
      const taxis = await storage.getAllTaxis();
      res.json(taxis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch taxis" });
    }
  });

  app.get("/api/taxis/:id", requireAuth, async (req, res) => {
    try {
      const taxi = await storage.getTaxiWithDriver(req.params.id);
      if (!taxi) {
        return res.status(404).json({ message: "Taxi not found" });
      }
      res.json(taxi);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch taxi" });
    }
  });

  app.patch("/api/taxis/:id/location", requireAuth, async (req, res) => {
    try {
      const { latitude, longitude, location } = req.body;
      const updatedTaxi = await storage.updateTaxi(req.params.id, {
        currentLatitude: latitude,
        currentLongitude: longitude,
        currentLocation: location
      });
      
      if (!updatedTaxi) {
        return res.status(404).json({ message: "Taxi not found" });
      }
      
      res.json(updatedTaxi);
    } catch (error) {
      res.status(500).json({ message: "Failed to update taxi location" });
    }
  });

  // Driver routes
  app.get("/api/drivers", requireAuth, async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/:id", requireAuth, async (req, res) => {
    try {
      const driver = await storage.getDriver(req.params.id);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch driver" });
    }
  });

  app.get("/api/drivers/taxi/:taxiId", requireAuth, async (req, res) => {
    try {
      const driver = await storage.getDriverByTaxiId(req.params.taxiId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found for this taxi" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch driver" });
    }
  });

  // Statistics routes
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getAllTaxiStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/stats/taxi/:taxiId", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getTaxiStats(req.params.taxiId);
      if (!stats) {
        return res.status(404).json({ message: "Statistics not found for this taxi" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch taxi statistics" });
    }
  });

  app.patch("/api/stats/taxi/:taxiId", requireAuth, async (req, res) => {
    try {
      // Validate request body
      const validation = insertTaxiStatsSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid statistics data", errors: validation.error.errors });
      }
      
      const { passengersToday, distanceTraveled, routeEfficiency, fuelConsumption, totalEarnings } = validation.data;
      const updatedStats = await storage.updateTaxiStats(req.params.taxiId, {
        passengersToday,
        distanceTraveled,
        routeEfficiency,
        fuelConsumption,
        totalEarnings
      });
      
      if (!updatedStats) {
        return res.status(404).json({ message: "Statistics not found for this taxi" });
      }
      
      res.json(updatedStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to update taxi statistics" });
    }
  });

  // Recording routes
  app.get("/api/recordings", requireAuth, async (req, res) => {
    try {
      const recordings = await storage.getAllRecordings();
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recordings" });
    }
  });

  app.get("/api/recordings/taxi/:taxiId", requireAuth, async (req, res) => {
    try {
      const recordings = await storage.getRecordingsByTaxiId(req.params.taxiId);
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recordings for taxi" });
    }
  });

  app.post("/api/recordings", requireAuth, async (req, res) => {
    try {
      const validation = insertRecordingSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid recording data", errors: validation.error.errors });
      }

      const recording = await storage.createRecording(validation.data);
      res.status(201).json(recording);
    } catch (error) {
      res.status(500).json({ message: "Failed to create recording" });
    }
  });

  app.get("/api/recordings/:id", requireAuth, async (req, res) => {
    try {
      const recording = await storage.getRecording(req.params.id);
      if (!recording) {
        return res.status(404).json({ message: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recording" });
    }
  });

  app.delete("/api/recordings/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteRecording(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Recording not found" });
      }
      res.json({ message: "Recording deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recording" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
