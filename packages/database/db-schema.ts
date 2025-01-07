import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  serial,
  geometry,
  numeric,
  boolean,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import {
  BreakdownRequestStatus,
  DocumentApprovalStatus,
  DriverApprovalStatus,
  DriverAvailabilityStatus,
} from "@towmycar/common";
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
  organizationName: varchar("organization_name", { length: 255 }),
  address: text("current_address"),
  address1: text("address1"),
  address2: text("address2"),
  postcode: varchar("post_code", { length: 20 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }),
  stripeId: varchar("stripe_id", { length: 255 }), // Stripe customer ID
  stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }), // New field for Stripe payment method ID
  phoneNumber: varchar("phone_number", { length: 20 }),
  vehicleType: varchar("vehicle_type", { length: 100 }),
  vehicleRegistration: varchar("vehicle_registration", { length: 20 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  serviceRadius: integer("service_radius"),
  agreedTerms: boolean("agreed_to_terms").default(false).notNull(),
  profileDescription: text("profile_description"),
  primaryLocation: geometry("primary_location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }),
  workingHours: varchar("working_hours", { length: 100 }),
  maxWeight: integer("max_weight"),
  experienceYears: integer("experience_years"),
  insuranceDetails: text("insurance_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  approvalStatus: varchar("approval_status").default(
    DriverApprovalStatus.INITIAL,
  ), // New field
  availabilityStatus: varchar("availability_status").default(
    DriverAvailabilityStatus.UNAVAILABLE,
  ), // New field
  approvedBy: integer("approved_by"), // ID of the admin who approved (references an admins table)
  approvedAt: timestamp("approved_at"),
});

// Updated breakdownRequest table
export const breakdownRequest = pgTable("breakdown_request", {
  id: serial("id").primaryKey().notNull(),
  customerId: integer("customer_id")
    .references(() => customer.id, { onDelete: "cascade" })
    .notNull(),
  deliveryTimeframe: varchar("delivery_timeframe", { length: 20 }),
  regNo: varchar("reg_no", { length: 20 }),
  mobileNumber: varchar("mobile_number", { length: 20 }),
  make: varchar("make", { length: 200 }),
  model: varchar("model", { length: 200 }),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  postCode: varchar("post_code", { length: 20 }),
  toPostCode: varchar("to_post_code", { length: 20 }),
  requestType: varchar("request_type", { length: 50 }),
  address: text("address"),
  toAddress: text("to_address"),

  userLocation: geometry("user_location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }).notNull(),
  userToLocation: geometry("user_to_location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }).notNull(),
  description: varchar("description", { length: 255 }),
  status: varchar("status", { length: 20 })
    .notNull()
    .default(BreakdownRequestStatus.WAITING),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New FCM tokens table
export const fcmTokens = pgTable(
  "fcm_tokens",
  {
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
  }),
);

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
    reasonToClose: text("reason_to_close"),
    isCompleted: boolean("is_completed").default(false).notNull(),
    userStatus: varchar("user_status", { length: 20 }),
    estimation: numeric("estimated_cost", { precision: 10, scale: 2 }),
    explanation: text("estimate_explanation"),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    paymentId: integer("payment_id").references(() => payments.id, {
      onDelete: "set null",
    }),
  },
  table => ({
    // Adding the unique constraint
    requestDriverUnique: unique().on(table.requestId, table.driverId),
  }),
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
  siteRating: integer("site_rating"),
  siteFeedback: text("site_feedback"),
  serviceProvided: boolean("serviceProvided").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Add this new table for payment tracking
export const payments = pgTable("payments", {
  id: serial("id").primaryKey().notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", {
    length: 255,
  }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  driverId: integer("driver_id")
    .references(() => driver.id, { onDelete: "cascade" })
    .notNull(),
  requestId: integer("request_id")
    .references(() => breakdownRequest.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),

  deliveryType: varchar("delivery_type", {
    length: 100,
  }),
  notificationType: varchar("notification_type", { length: 100 }).notNull(),
  breakdownRequestId: integer("breakdown_request_id").references(
    () => breakdownRequest.id,
    {
      onDelete: "cascade",
    },
  ),

  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  url: text("url"),
  payload: jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  isSeen: boolean("is_seen").default(false).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING, SENT, FAILED
});

// New admin table
export const admin = pgTable("admin", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  role: varchar("role", { length: 50 }).notNull(), // Role of the admin (e.g., super admin, moderator)
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// New documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  approvalStatus: varchar("approval_status").default(
    DocumentApprovalStatus.PENDING,
  ),
  documentType: varchar("document_type", { length: 50 }).notNull(), // Type of document (e.g., car breakdown photo, driving license)
  filePath: text("file_path").notNull(), // Path to the uploaded document
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof user.$inferSelect;
export type Customer = typeof customer.$inferSelect;
export type Driver = typeof driver.$inferSelect;
export type BreakdownRequest = typeof breakdownRequest.$inferSelect;
export type BreakdownAssignment = typeof breakdownAssignment.$inferSelect;
export type FcmToken = typeof fcmTokens.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type ServiceRating = typeof serviceRatings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Notifications = typeof notifications.$inferSelect;
export type Admin = typeof admin.$inferSelect;
export type Documents = typeof documents.$inferSelect;
