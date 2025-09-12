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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type InsertTaxi = z.infer<typeof insertTaxiSchema>;
export type InsertTaxiStats = z.infer<typeof insertTaxiStatsSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Taxi = typeof taxis.$inferSelect;
export type TaxiStats = typeof taxiStats.$inferSelect;
