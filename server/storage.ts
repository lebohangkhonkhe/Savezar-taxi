import { type User, type InsertUser, type Driver, type InsertDriver, type Taxi, type InsertTaxi, type TaxiStats, type InsertTaxiStats, type Recording, type InsertRecording } from "@shared/schema";
import { users, drivers, taxis, taxiStats, recordings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Driver methods
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverByTaxiId(taxiId: string): Promise<Driver | undefined>;
  getAllDrivers(): Promise<Driver[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, updates: Partial<InsertDriver>): Promise<Driver | undefined>;

  // Taxi methods
  getTaxi(id: string): Promise<Taxi | undefined>;
  getAllTaxis(): Promise<Taxi[]>;
  getTaxiWithDriver(id: string): Promise<(Taxi & { driver?: Driver }) | undefined>;
  createTaxi(taxi: InsertTaxi): Promise<Taxi>;
  updateTaxi(id: string, updates: Partial<InsertTaxi>): Promise<Taxi | undefined>;

  // Taxi Stats methods
  getTaxiStats(taxiId: string): Promise<TaxiStats | undefined>;
  getAllTaxiStats(): Promise<TaxiStats[]>;
  createTaxiStats(stats: InsertTaxiStats): Promise<TaxiStats>;
  updateTaxiStats(taxiId: string, updates: Partial<InsertTaxiStats>): Promise<TaxiStats | undefined>;

  // Recording methods
  getRecording(id: string): Promise<Recording | undefined>;
  getRecordingsByTaxiId(taxiId: string): Promise<Recording[]>;
  getAllRecordings(): Promise<Recording[]>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  updateRecording(id: string, updates: Partial<InsertRecording>): Promise<Recording | undefined>;
  deleteRecording(id: string): Promise<boolean>;

  // File storage methods
  storeFile(filename: string, fileData: Buffer, mimeType: string): Promise<string>; // Returns file URL
  getFile(filename: string): Promise<{ data: Buffer; mimeType: string } | undefined>;
  deleteFile(filename: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Initialize sample data on first run
  private initialized = false;
  
  // In-memory file storage for development
  private fileStorage = new Map<string, { data: Buffer; mimeType: string }>();

  private async ensureInitialized() {
    if (this.initialized) return;

    try {
      // Check if data already exists
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        this.initialized = true;
        return;
      }

      // Create sample data if none exists
      console.log("Initializing sample data...");
      
      // Create sample user
      const [user] = await db.insert(users).values({
        email: "admin@savezar.com",
        password: "password",
        name: "SaveZar Admin"
      }).returning();

      // Create sample taxis
      const [taxi1] = await db.insert(taxis).values({
        name: "Taxi 1",
        licensePlate: "LAG-001-XX",
        currentLatitude: 6.5244,
        currentLongitude: 3.3792,
        currentLocation: "Akina Jola St, Victoria Island",
        isOnline: true
      }).returning();

      const [taxi2] = await db.insert(taxis).values({
        name: "Taxi 2",
        licensePlate: "LST-055-GP",
        currentLatitude: -29.3621,
        currentLongitude: 27.3977,
        currentLocation: "Tsheseng Shopping Centre",
        isOnline: true
      }).returning();

      // Create sample drivers
      const [driver1] = await db.insert(drivers).values({
        name: "Noosi Thabang Seoe",
        age: 36,
        phone: "+27 81 712 8154",
        rating: 4.2,
        avgPassengersPerDay: 235,
        photoUrl: "/noosi-profile.jpg",
        taxiId: taxi1.id,
        isActive: true
      }).returning();

      const [driver2] = await db.insert(drivers).values({
        name: "Lebohang Khonkhe",
        age: 29,
        phone: "+2763 387 7706",
        rating: 4.5,
        avgPassengersPerDay: 185,
        photoUrl: "/lebohang-profile.jpg",
        taxiId: taxi2.id,
        isActive: true
      }).returning();

      // Update taxis with drivers
      await db.update(taxis).set({ driverId: driver1.id }).where(eq(taxis.id, taxi1.id));
      await db.update(taxis).set({ driverId: driver2.id }).where(eq(taxis.id, taxi2.id));

      // Create sample stats for both taxis
      await db.insert(taxiStats).values([
        {
          taxiId: taxi1.id,
          passengersToday: 142,
          distanceTraveled: 285.6,
          routeEfficiency: 87.2,
          fuelConsumption: 34.8,
          totalEarnings: 28500
        },
        {
          taxiId: taxi2.id,
          passengersToday: 98,
          distanceTraveled: 198.4,
          routeEfficiency: 92.1,
          fuelConsumption: 25.3,
          totalEarnings: 19750
        }
      ]);

      console.log("Sample data initialized successfully");
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing sample data:", error);
      this.initialized = true; // Don't keep retrying
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureInitialized();
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Driver methods
  async getDriver(id: string): Promise<Driver | undefined> {
    await this.ensureInitialized();
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async getDriverByTaxiId(taxiId: string): Promise<Driver | undefined> {
    await this.ensureInitialized();
    const [driver] = await db.select().from(drivers).where(eq(drivers.taxiId, taxiId));
    return driver || undefined;
  }

  async getAllDrivers(): Promise<Driver[]> {
    await this.ensureInitialized();
    return await db.select().from(drivers);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    await this.ensureInitialized();
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async updateDriver(id: string, updates: Partial<InsertDriver>): Promise<Driver | undefined> {
    await this.ensureInitialized();
    const [driver] = await db.update(drivers).set(updates).where(eq(drivers.id, id)).returning();
    return driver || undefined;
  }

  // Taxi methods
  async getTaxi(id: string): Promise<Taxi | undefined> {
    await this.ensureInitialized();
    const [taxi] = await db.select().from(taxis).where(eq(taxis.id, id));
    return taxi || undefined;
  }

  async getAllTaxis(): Promise<Taxi[]> {
    await this.ensureInitialized();
    return await db.select().from(taxis);
  }

  async getTaxiWithDriver(id: string): Promise<(Taxi & { driver?: Driver }) | undefined> {
    await this.ensureInitialized();
    const [taxi] = await db.select().from(taxis).where(eq(taxis.id, id));
    if (!taxi) return undefined;

    const driver = taxi.driverId ? await this.getDriver(taxi.driverId) : undefined;
    return { ...taxi, driver };
  }

  async createTaxi(insertTaxi: InsertTaxi): Promise<Taxi> {
    await this.ensureInitialized();
    const [taxi] = await db.insert(taxis).values(insertTaxi).returning();
    return taxi;
  }

  async updateTaxi(id: string, updates: Partial<InsertTaxi>): Promise<Taxi | undefined> {
    await this.ensureInitialized();
    const [taxi] = await db.update(taxis).set(updates).where(eq(taxis.id, id)).returning();
    return taxi || undefined;
  }

  // Taxi Stats methods
  async getTaxiStats(taxiId: string): Promise<TaxiStats | undefined> {
    await this.ensureInitialized();
    const [stats] = await db.select().from(taxiStats).where(eq(taxiStats.taxiId, taxiId));
    return stats || undefined;
  }

  async getAllTaxiStats(): Promise<TaxiStats[]> {
    await this.ensureInitialized();
    return await db.select().from(taxiStats);
  }

  async createTaxiStats(insertStats: InsertTaxiStats): Promise<TaxiStats> {
    await this.ensureInitialized();
    const [stats] = await db.insert(taxiStats).values(insertStats).returning();
    return stats;
  }

  async updateTaxiStats(taxiId: string, updates: Partial<InsertTaxiStats>): Promise<TaxiStats | undefined> {
    await this.ensureInitialized();
    const [stats] = await db.update(taxiStats).set(updates).where(eq(taxiStats.taxiId, taxiId)).returning();
    return stats || undefined;
  }

  // Recording methods
  async getRecording(id: string): Promise<Recording | undefined> {
    await this.ensureInitialized();
    const [recording] = await db.select().from(recordings).where(eq(recordings.id, id));
    return recording || undefined;
  }

  async getRecordingsByTaxiId(taxiId: string): Promise<Recording[]> {
    await this.ensureInitialized();
    return await db.select().from(recordings).where(eq(recordings.taxiId, taxiId));
  }

  async getAllRecordings(): Promise<Recording[]> {
    await this.ensureInitialized();
    return await db.select().from(recordings);
  }

  async createRecording(insertRecording: InsertRecording): Promise<Recording> {
    await this.ensureInitialized();
    const [recording] = await db.insert(recordings).values(insertRecording).returning();
    return recording;
  }

  async updateRecording(id: string, updates: Partial<InsertRecording>): Promise<Recording | undefined> {
    await this.ensureInitialized();
    const [recording] = await db.update(recordings).set(updates).where(eq(recordings.id, id)).returning();
    return recording || undefined;
  }

  async deleteRecording(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const [deleted] = await db.delete(recordings).where(eq(recordings.id, id)).returning();
    return !!deleted;
  }

  // File storage methods
  async storeFile(filename: string, fileData: Buffer, mimeType: string): Promise<string> {
    await this.ensureInitialized();
    this.fileStorage.set(filename, { data: fileData, mimeType });
    return `/api/files/${filename}`; // Return URL to access the file
  }

  async getFile(filename: string): Promise<{ data: Buffer; mimeType: string } | undefined> {
    await this.ensureInitialized();
    return this.fileStorage.get(filename);
  }

  async deleteFile(filename: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.fileStorage.delete(filename);
  }
}

export const storage = new DatabaseStorage();