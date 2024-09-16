import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  serial,
  geometry,
  numeric,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

// Existing userProfile table
export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey().notNull(),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  postcode: varchar("postcode", { length: 20 }),
  vehicleRegistration: varchar("vehicleRegistration", {
    length: 20,
  }),
  mobileNumber: varchar("mobileNumber", { length: 20 }),
});

// Existing breakdownRequest table
export const breakdownRequest = pgTable(
  "breakdown_request",
  {
    id: serial("id").primaryKey().notNull(),
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
  id: serial("id").primaryKey().notNull(),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  vehicleType: varchar("vehicle_type", { length: 100 }),
  vehicleRegistration: varchar("vehicle_registration", {
    length: 20,
  }),
  licenseNumber: varchar("license_number", { length: 50 }),
  serviceRadius: integer("service_radius"),
  primaryLocation: geometry("primary_location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }),
  workingHours: varchar("working_hours", { length: 100 }),
  experienceYears: integer("experience_years"),
  insuranceDetails: text("insurance_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Updated breakdownAssignment table
export const breakdownAssignment = pgTable("breakdown_assignment", {
  id: serial("id").primaryKey().notNull(),
  requestId: integer("request_id")
    .references(() => breakdownRequest.id)
    .notNull(),
  driverId: integer("driver_id")
    .references(() => driver.id)
    .notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  userStatus: varchar("user_status", { length: 20 }).notNull().default("waiting"),
  estimation: numeric("estimated_cost", { precision: 10, scale: 2 }),
  explanation: text("estimate_explanation"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New FCM tokens table
export const fcmTokens = pgTable("fcm_tokens", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => userProfile.id)
    .notNull(),
  token: text("token").notNull(),
  browserInfo: text("browser_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export type UserProfile = typeof userProfile.$inferSelect;
export type BreakdownRequest = typeof breakdownRequest.$inferSelect;
export type Driver = typeof driver.$inferSelect;
export type BreakdownAssignment = typeof breakdownAssignment.$inferSelect;
export type FcmToken = typeof fcmTokens.$inferSelect;
