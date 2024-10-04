"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chats = exports.vehicles = exports.breakdownAssignment = exports.fcmTokens = exports.breakdownRequest = exports.driver = exports.customer = exports.user = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
// Renamed userAuth to user
exports.user = (0, pg_core_1.pgTable)("user", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    authId: (0, pg_core_1.varchar)("auth_id", { length: 255 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }),
    imageUrl: (0, pg_core_1.varchar)("image_url", { length: 255 }),
    role: (0, pg_core_1.varchar)("role", { length: 50 }).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// Renamed userProfile to customer
exports.customer = (0, pg_core_1.pgTable)("customer", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.user.id, { onDelete: "cascade" })
        .notNull()
        .unique(),
    postcode: (0, pg_core_1.varchar)("postcode", { length: 20 }),
    mobileNumber: (0, pg_core_1.varchar)("mobileNumber", { length: 20 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// Updated driver table
exports.driver = (0, pg_core_1.pgTable)("driver", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.user.id, { onDelete: "cascade" })
        .notNull()
        .unique(),
    stripeId: (0, pg_core_1.varchar)("stripe_id", { length: 255 }), // Stripe customer ID
    stripePaymentMethodId: (0, pg_core_1.varchar)("stripe_payment_method_id", { length: 255 }), // New field for Stripe payment method ID
    phoneNumber: (0, pg_core_1.varchar)("phone_number", { length: 20 }),
    vehicleType: (0, pg_core_1.varchar)("vehicle_type", { length: 100 }),
    vehicleRegistration: (0, pg_core_1.varchar)("vehicle_registration", { length: 20 }),
    licenseNumber: (0, pg_core_1.varchar)("license_number", { length: 50 }),
    serviceRadius: (0, pg_core_1.integer)("service_radius"),
    primaryLocation: (0, pg_core_1.geometry)("primary_location", {
        type: "point",
        mode: "xy",
        srid: 4326,
    }),
    workingHours: (0, pg_core_1.varchar)("working_hours", { length: 100 }),
    experienceYears: (0, pg_core_1.integer)("experience_years"),
    insuranceDetails: (0, pg_core_1.text)("insurance_details"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// Updated breakdownRequest table
exports.breakdownRequest = (0, pg_core_1.pgTable)("breakdown_request", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    customerId: (0, pg_core_1.integer)("customer_id")
        .references(() => exports.customer.id, { onDelete: "cascade" })
        .notNull(),
    regNo: (0, pg_core_1.varchar)("reg_no", { length: 20 }),
    weight: (0, pg_core_1.numeric)("weight", { precision: 10, scale: 2 }),
    requestType: (0, pg_core_1.varchar)("request_type", { length: 50 }),
    address: (0, pg_core_1.text)("address"),
    userLocation: (0, pg_core_1.geometry)("user_location", {
        type: "point",
        mode: "xy",
        srid: 4326,
    }).notNull(),
    description: (0, pg_core_1.varchar)("description", { length: 255 }),
    status: (0, pg_core_1.varchar)("status", { length: 20 })
        .notNull()
        .default(enums_1.UserStatus.PENDING),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// New FCM tokens table
exports.fcmTokens = (0, pg_core_1.pgTable)("fcm_tokens", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.user.id, { onDelete: "cascade" })
        .notNull(),
    token: (0, pg_core_1.text)("token").notNull(),
    browserInfo: (0, pg_core_1.text)("browser_info"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
});
// Updated breakdownAssignment table
exports.breakdownAssignment = (0, pg_core_1.pgTable)("breakdown_assignment", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    requestId: (0, pg_core_1.integer)("request_id")
        .references(() => exports.breakdownRequest.id, { onDelete: "cascade" })
        .notNull(),
    driverId: (0, pg_core_1.integer)("driver_id")
        .references(() => exports.driver.id, { onDelete: "cascade" })
        .notNull(),
    driverStatus: (0, pg_core_1.varchar)("driver_status", { length: 20 }),
    userStatus: (0, pg_core_1.varchar)("user_status", { length: 20 }),
    estimation: (0, pg_core_1.numeric)("estimated_cost", { precision: 10, scale: 2 }),
    explanation: (0, pg_core_1.text)("estimate_explanation"),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// New vehicles table
exports.vehicles = (0, pg_core_1.pgTable)("vehicles", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    customerId: (0, pg_core_1.integer)("customer_id")
        .references(() => exports.customer.id, { onDelete: "cascade" })
        .notNull(),
    registrationNumber: (0, pg_core_1.varchar)("registration_number", { length: 20 }).notNull(),
    weight: (0, pg_core_1.numeric)("weight", { precision: 10, scale: 2 }),
    year: (0, pg_core_1.integer)("year"),
    model: (0, pg_core_1.varchar)("model", { length: 100 }),
    createdBy: (0, pg_core_1.integer)("created_by")
        .references(() => exports.user.id, { onDelete: "set null" })
        .notNull(),
    updatedBy: (0, pg_core_1.integer)("updated_by")
        .references(() => exports.user.id, { onDelete: "set null" })
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.chats = (0, pg_core_1.pgTable)("chats", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    requestId: (0, pg_core_1.integer)("request_id")
        .references(() => exports.breakdownRequest.id, { onDelete: "cascade" })
        .notNull(),
    driverId: (0, pg_core_1.integer)("driver_id")
        .references(() => exports.driver.id, { onDelete: "cascade" })
        .notNull(),
    sender: (0, pg_core_1.varchar)("sender_type", { length: 10 }).notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    sentAt: (0, pg_core_1.timestamp)("sent_at").defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
