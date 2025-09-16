import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertTaxiStatsSchema, insertRecordingSchema } from "@shared/schema";
import session from "express-session";
import twilio from "twilio";

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

  // Taxi routes (temporarily without auth for testing)
  app.get("/api/taxis", async (req, res) => {
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

  // Driver routes (temporarily without auth for testing)
  app.get("/api/drivers", async (req, res) => {
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

  app.get("/api/drivers/taxi/:taxiId", async (req, res) => {
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

  // Recording routes (temporarily without auth for testing)
  app.get("/api/recordings", async (req, res) => {
    try {
      const recordings = await storage.getAllRecordings();
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recordings" });
    }
  });

  app.get("/api/recordings/taxi/:taxiId", async (req, res) => {
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

  // File upload and serve routes
  app.post("/api/files/upload", requireAuth, async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      req.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const mimeType = req.headers['content-type'] || 'application/octet-stream';
          const filename = req.headers['x-filename'] as string || `upload_${Date.now()}`;
          
          const fileUrl = await storage.storeFile(filename, buffer, mimeType);
          res.json({ fileUrl, filename, size: buffer.length });
        } catch (error) {
          console.error('File upload error:', error);
          res.status(500).json({ message: "Failed to store file" });
        }
      });
      
      req.on('error', (error) => {
        console.error('Upload request error:', error);
        res.status(500).json({ message: "Failed to upload file" });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process file upload" });
    }
  });

  app.get("/api/files/:filename", requireAuth, async (req, res) => {
    try {
      const file = await storage.getFile(req.params.filename);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.setHeader('Content-Type', file.mimeType);
      res.send(file.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Twilio Voice API routes
  app.get("/api/voice/token", async (req, res) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

      if (!accountSid || !authToken || !twimlAppSid) {
        return res.status(500).json({ message: "Twilio credentials not configured" });
      }

      // For demo purposes, create a default user identity
      const defaultUser = { id: "demo-user", name: "Demo User", email: "demo@savezar.com" };

      const AccessToken = twilio.jwt.AccessToken;
      const VoiceGrant = AccessToken.VoiceGrant;

      // Use account SID and auth token for simplicity in demo
      // In production, use separate API key and secret
      const accessToken = new AccessToken(accountSid, accountSid, authToken, {
        identity: `user_${defaultUser.id}`,
        ttl: 3600 // 1 hour
      });

      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true
      });

      accessToken.addGrant(voiceGrant);

      res.json({
        token: accessToken.toJwt(),
        identity: `user_${defaultUser.id}`
      });
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({ message: "Failed to generate access token" });
    }
  });

  app.post("/api/voice/call", requireAuth, async (req, res) => {
    try {
      const { to } = req.body;
      
      if (!to) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (!accountSid || !authToken) {
        return res.status(500).json({ message: "Twilio credentials not configured" });
      }

      const client = twilio(accountSid, authToken);
      
      // For demo purposes, we'll create a simple TwiML response
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">Hello from SaveZar Taxi Management System. This is a test call.</Say>
          <Pause length="1"/>
          <Say voice="alice">Thank you for using our service. Goodbye!</Say>
        </Response>`;

      res.json({ 
        message: "Call initiated",
        to: to,
        twiml: twimlResponse
      });
    } catch (error) {
      console.error('Call initiation error:', error);
      res.status(500).json({ message: "Failed to initiate call" });
    }
  });

  app.post("/api/voice/outgoing", async (req, res) => {
    try {
      const { To } = req.body;
      
      if (!To) {
        return res.status(400).send('Bad Request: Missing To parameter');
      }

      // Generate TwiML to dial the requested number
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Dial>
            <Number>${To}</Number>
          </Dial>
        </Response>`;

      res.type('text/xml');
      res.send(twimlResponse);
    } catch (error) {
      console.error('Outgoing call TwiML error:', error);
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">Sorry, we could not connect your call. Please try again later.</Say>
        </Response>`;
      res.type('text/xml');
      res.send(errorTwiml);
    }
  });

  app.post("/api/voice/webhook", async (req, res) => {
    try {
      // Handle incoming call webhook from Twilio
      const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">Welcome to SaveZar Taxi Management System.</Say>
          <Gather input="dtmf" timeout="10" numDigits="1" action="/api/voice/handle-input">
            <Say voice="alice">Press 1 for taxi dispatch, press 2 for customer service, or press 0 to speak to an operator.</Say>
          </Gather>
          <Say voice="alice">We didn't receive your input. Goodbye.</Say>
        </Response>`;

      res.type('text/xml');
      res.send(twimlResponse);
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Internal server error');
    }
  });

  app.post("/api/voice/handle-input", async (req, res) => {
    try {
      const { Digits } = req.body;
      
      let twimlResponse = '';
      
      switch (Digits) {
        case '1':
          twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
              <Say voice="alice">You have selected taxi dispatch. Our operators will connect you shortly.</Say>
              <Pause length="2"/>
              <Say voice="alice">Thank you for calling SaveZar. Goodbye!</Say>
            </Response>`;
          break;
        case '2':
          twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
              <Say voice="alice">You have selected customer service. Please hold while we connect you.</Say>
              <Pause length="2"/>
              <Say voice="alice">Thank you for calling SaveZar. Goodbye!</Say>
            </Response>`;
          break;
        case '0':
          twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
              <Say voice="alice">Connecting you to an operator. Please wait.</Say>
              <Pause length="2"/>
              <Say voice="alice">Thank you for calling SaveZar. Goodbye!</Say>
            </Response>`;
          break;
        default:
          twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
              <Say voice="alice">Invalid selection. Thank you for calling SaveZar. Goodbye!</Say>
            </Response>`;
      }

      res.type('text/xml');
      res.send(twimlResponse);
    } catch (error) {
      console.error('Input handling error:', error);
      res.status(500).send('Internal server error');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
