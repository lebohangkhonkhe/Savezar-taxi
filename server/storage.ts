import { type User, type InsertUser, type Driver, type InsertDriver, type Taxi, type InsertTaxi, type TaxiStats, type InsertTaxiStats } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private drivers: Map<string, Driver>;
  private taxis: Map<string, Taxi>;
  private taxiStats: Map<string, TaxiStats>;

  constructor() {
    this.users = new Map();
    this.drivers = new Map();
    this.taxis = new Map();
    this.taxiStats = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample user
    const user = await this.createUser({
      email: "admin@savezar.com",
      password: "password",
      name: "SaveZar Admin"
    });

    // Create sample taxi
    const taxi1 = await this.createTaxi({
      name: "Taxi 1",
      licensePlate: "LAG-001-XX",
      currentLatitude: 6.5244,
      currentLongitude: 3.3792,
      currentLocation: "Akina Jola St, Victoria Island",
      isOnline: true
    });

    // Create sample driver
    const driver1 = await this.createDriver({
      name: "Tshepo Trust",
      age: 36,
      phone: "+234-801-234-5678",
      rating: 4.2,
      avgPassengersPerDay: 235,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      taxiId: taxi1.id,
      isActive: true
    });

    // Update taxi with driver
    await this.updateTaxi(taxi1.id, { driverId: driver1.id });

    // Create sample stats
    await this.createTaxiStats({
      taxiId: taxi1.id,
      passengersToday: 140,
      kilometersToday: 146.5,
      totalEarnings: 28500
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Driver methods
  async getDriver(id: string): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async getDriverByTaxiId(taxiId: string): Promise<Driver | undefined> {
    return Array.from(this.drivers.values()).find(driver => driver.taxiId === taxiId);
  }

  async getAllDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = randomUUID();
    const driver: Driver = { 
      ...insertDriver, 
      id,
      rating: insertDriver.rating ?? 0,
      avgPassengersPerDay: insertDriver.avgPassengersPerDay ?? 0,
      photoUrl: insertDriver.photoUrl ?? null,
      isActive: insertDriver.isActive ?? true
    };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriver(id: string, updates: Partial<InsertDriver>): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (driver) {
      const updatedDriver = { ...driver, ...updates };
      this.drivers.set(id, updatedDriver);
      return updatedDriver;
    }
    return undefined;
  }

  // Taxi methods
  async getTaxi(id: string): Promise<Taxi | undefined> {
    return this.taxis.get(id);
  }

  async getAllTaxis(): Promise<Taxi[]> {
    return Array.from(this.taxis.values());
  }

  async getTaxiWithDriver(id: string): Promise<(Taxi & { driver?: Driver }) | undefined> {
    const taxi = this.taxis.get(id);
    if (!taxi) return undefined;

    const driver = taxi.driverId ? await this.getDriver(taxi.driverId) : undefined;
    return { ...taxi, driver };
  }

  async createTaxi(insertTaxi: InsertTaxi): Promise<Taxi> {
    const id = randomUUID();
    const taxi: Taxi = { 
      ...insertTaxi, 
      id,
      driverId: insertTaxi.driverId ?? null,
      currentLatitude: insertTaxi.currentLatitude ?? null,
      currentLongitude: insertTaxi.currentLongitude ?? null,
      currentLocation: insertTaxi.currentLocation ?? null,
      isOnline: insertTaxi.isOnline ?? false
    };
    this.taxis.set(id, taxi);
    return taxi;
  }

  async updateTaxi(id: string, updates: Partial<InsertTaxi>): Promise<Taxi | undefined> {
    const taxi = this.taxis.get(id);
    if (taxi) {
      const updatedTaxi = { ...taxi, ...updates };
      this.taxis.set(id, updatedTaxi);
      return updatedTaxi;
    }
    return undefined;
  }

  // Taxi Stats methods
  async getTaxiStats(taxiId: string): Promise<TaxiStats | undefined> {
    return Array.from(this.taxiStats.values()).find(stats => stats.taxiId === taxiId);
  }

  async getAllTaxiStats(): Promise<TaxiStats[]> {
    return Array.from(this.taxiStats.values());
  }

  async createTaxiStats(insertStats: InsertTaxiStats): Promise<TaxiStats> {
    const id = randomUUID();
    const stats: TaxiStats = { 
      ...insertStats, 
      id,
      date: new Date(),
      passengersToday: insertStats.passengersToday ?? 0,
      kilometersToday: insertStats.kilometersToday ?? 0,
      totalEarnings: insertStats.totalEarnings ?? 0
    };
    this.taxiStats.set(id, stats);
    return stats;
  }

  async updateTaxiStats(taxiId: string, updates: Partial<InsertTaxiStats>): Promise<TaxiStats | undefined> {
    const existingStats = await this.getTaxiStats(taxiId);
    if (existingStats) {
      const updatedStats = { ...existingStats, ...updates };
      this.taxiStats.set(existingStats.id, updatedStats);
      return updatedStats;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
