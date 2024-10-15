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
  unique,
} from "drizzle-orm/pg-core";
import { UserStatus } from "./enums";
// Renamed userAuth to user
export const user = pgTable("user", {
  id: serial("id").primaryKey().notNull(),
  authId: varchar("auth_id", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Renamed userProfile to customer
export const customer = pgTable("customer", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  postcode: varchar("postcode", { length: 20 }),
  mobileNumber: varchar("mobileNumber", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Updated driver table
export const driver = pgTable("driver", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  stripeId: varchar("stripe_id", { length: 255 }), // Stripe customer ID
  stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }), // New field for Stripe payment method ID
  phoneNumber: varchar("phone_number", { length: 20 }),
  vehicleType: varchar("vehicle_type", { length: 100 }),
  vehicleRegistration: varchar("vehicle_registration", { length: 20 }),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Updated breakdownRequest table
export const breakdownRequest = pgTable("breakdown_request", {
  id: serial("id").primaryKey().notNull(),
  customerId: integer("customer_id")
    .references(() => customer.id, { onDelete: "cascade" })
    .notNull(),
  regNo: varchar("reg_no", { length: 20 }),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  requestType: varchar("request_type", { length: 50 }),
  address: text("address"),
  userLocation: geometry("user_location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }).notNull(),
  description: varchar("description", { length: 255 }),
  status: varchar("status", { length: 20 })
    .notNull()
    .default(UserStatus.PENDING),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New FCM tokens table
export const fcmTokens = pgTable("fcm_tokens", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull(),
  browserInfo: text("browser_info"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  
},
table => ({
  // Adding the unique constraint
  requestDriverUnique: unique().on(table.userId, table.token),
}));

// Updated breakdownAssignment table
export const breakdownAssignment = pgTable(
  "breakdown_assignment",
  {
    id: serial("id").primaryKey().notNull(),
    requestId: integer("request_id")
      .references(() => breakdownRequest.id, { onDelete: "cascade" })
      .notNull(),
    driverId: integer("driver_id")
      .references(() => driver.id, { onDelete: "cascade" })
      .notNull(),
    driverStatus: varchar("driver_status", { length: 20 }),
    userStatus: varchar("user_status", { length: 20 }),
    estimation: numeric("estimated_cost", { precision: 10, scale: 2 }),
    explanation: text("estimate_explanation"),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    // Adding the unique constraint
    requestDriverUnique: unique().on(table.requestId, table.driverId),
  })
);

// New vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey().notNull(),
  customerId: integer("customer_id")
    .references(() => customer.id, { onDelete: "cascade" })
    .notNull(),
  registrationNumber: varchar("registration_number", { length: 20 }).notNull(),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  year: integer("year"),
  model: varchar("model", { length: 100 }),
  createdBy: integer("created_by")
    .references(() => user.id, { onDelete: "set null" })
    .notNull(),
  updatedBy: integer("updated_by")
    .references(() => user.id, { onDelete: "set null" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey().notNull(),
  requestId: integer("request_id")
    .references(() => breakdownRequest.id, { onDelete: "cascade" })
    .notNull(),
  driverId: integer("driver_id")
    .references(() => driver.id, { onDelete: "cascade" })
    .notNull(),
  sender: varchar("sender_type", { length: 10 }).notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for ratings and feedback
export const serviceRatings = pgTable("service_ratings", {
  id: serial("id").primaryKey().notNull(),
  requestId: integer("request_id")
    .references(() => breakdownRequest.id, { onDelete: "cascade" })
    .notNull(),
  customerId: integer("customer_id")
    .references(() => customer.id, { onDelete: "cascade" })
    .notNull(),
  driverId: integer("driver_id").references(() => driver.id, {
    onDelete: "cascade",
  }),
  customerRating: integer("customer_rating"),
  customerFeedback: text("customer_feedback"),
  driverRating: integer("driver_rating"),
  driverFeedback: text("driver_feedback"),
  serviceProvided: boolean("serviceProvided").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
