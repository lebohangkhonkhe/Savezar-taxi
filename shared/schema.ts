import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  phone: text("phone").notNull(),
  rating: real("rating").notNull().default(0),
  avgPassengersPerDay: integer("avg_passengers_per_day").notNull().default(0),
  photoUrl: text("photo_url"),
  taxiId: varchar("taxi_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const taxis = pgTable("taxis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  licensePlate: text("license_plate").notNull().unique(),
  driverId: varchar("driver_id"),
  currentLatitude: real("current_latitude"),
  currentLongitude: real("current_longitude"),
  currentLocation: text("current_location"),
  isOnline: boolean("is_online").notNull().default(false),
});

export const taxiStats = pgTable("taxi_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taxiId: varchar("taxi_id").notNull(),
  date: timestamp("date").defaultNow(),
  passengersToday: integer("passengers_today").notNull().default(0),
  distanceTraveled: real("distance_traveled").notNull().default(0),
  routeEfficiency: real("route_efficiency").notNull().default(0),
  fuelConsumption: real("fuel_consumption").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
});

export const recordings = pgTable("recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taxiId: varchar("taxi_id").notNull(),
  filename: text("filename").notNull(),
  fileUrl: text("file_url"), // URL to access the stored video file
  duration: integer("duration"), // in seconds
  fileSize: integer("file_size"), // in bytes
  mimeType: text("mime_type").notNull().default("video/webm"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  title: text("title"),
  isProcessed: boolean("is_processed").notNull().default(false),
});

export const availableDrivers = pgTable("available_drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  drivingExperience: integer("driving_experience").notNull(), // in years
  availability: text("availability").notNull(), // e.g., "Full-time", "Part-time", "Weekends only"
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  isAvailable: boolean("is_available").notNull().default(true),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
});

export const insertTaxiSchema = createInsertSchema(taxis).omit({
  id: true,
});

export const insertTaxiStatsSchema = createInsertSchema(taxiStats).omit({
  id: true,
  date: true,
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  recordedAt: true,
});

export const insertAvailableDriverSchema = createInsertSchema(availableDrivers).omit({
  id: true,
  registeredAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const availableDriverSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.number().min(18, "Must be at least 18 years old").max(75, "Must be under 75 years old"),
  drivingExperience: z.number().min(0, "Experience cannot be negative").max(50, "Experience must be realistic"),
  availability: z.string().min(1, "Please specify availability"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type InsertTaxi = z.infer<typeof insertTaxiSchema>;
export type InsertTaxiStats = z.infer<typeof insertTaxiStatsSchema>;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type InsertAvailableDriver = z.infer<typeof insertAvailableDriverSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type AvailableDriverRequest = z.infer<typeof availableDriverSchema>;

export type User = typeof users.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Taxi = typeof taxis.$inferSelect;
export type TaxiStats = typeof taxiStats.$inferSelect;
export type Recording = typeof recordings.$inferSelect;
export type AvailableDriver = typeof availableDrivers.$inferSelect;
