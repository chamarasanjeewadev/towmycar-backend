import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  index,
  geometry,
} from "drizzle-orm/pg-core";

// Existing userProfile table
export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  postcode: varchar("postcode", { length: 20 }).notNull(),
  vehicleRegistration: varchar("vehicleRegistration", {
    length: 20,
  }).notNull(),
  mobileNumber: varchar("mobileNumber", { length: 20 }).notNull(),
});

// Existing breakdownRequest table
export const breakdownRequest = pgTable(
  "breakdown_request",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => userProfile.id)
      .notNull(),
    requestType: varchar("request_type", { length: 50 }).notNull(),
    locationAddress: text("location_address").notNull(),
    userLocation: geometry("user_location", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    // gist: index('custom_idx').using('gist', table.geo)
  })
);

// New driver table
export const driver = pgTable("driver", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 100 }).notNull(),
  vehicleRegistration: varchar("vehicle_registration", {
    length: 20,
  }).notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull(),
  serviceRadius: integer("service_radius").notNull(),
  primaryLocation: geometry("primary_location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }).notNull(),
  workingHours: varchar("working_hours", { length: 100 }).notNull(),
  experienceYears: integer("experience_years").notNull(),
  insuranceDetails: text("insurance_details").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New driverRequest table
export const driverRequest = pgTable("driver_request", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .references(() => breakdownRequest.id)
    .notNull(),
  driverId: integer("driver_id")
    .references(() => driver.id)
    .notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserProfile = typeof userProfile.$inferSelect;
export type BreakdownRequest = typeof breakdownRequest.$inferSelect;
export type Driver = typeof driver.$inferSelect;
export type DriverRequest = typeof driverRequest.$inferSelect;
