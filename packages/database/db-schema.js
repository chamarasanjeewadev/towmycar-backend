"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationHistory = exports.notifications = exports.payments = exports.serviceRatings = exports.chats = exports.vehicles = exports.breakdownAssignment = exports.fcmTokens = exports.breakdownRequest = exports.driver = exports.customer = exports.user = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("@towmycar/common");
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
    address: (0, pg_core_1.text)("address"),
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
    maxWeight: (0, pg_core_1.integer)("max_weight"),
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
    mobileNumber: (0, pg_core_1.varchar)("mobile_number", { length: 20 }),
    make: (0, pg_core_1.varchar)("make", { length: 200 }),
    model: (0, pg_core_1.varchar)("model", { length: 200 }),
    weight: (0, pg_core_1.numeric)("weight", { precision: 10, scale: 2 }),
    requestType: (0, pg_core_1.varchar)("request_type", { length: 50 }),
    address: (0, pg_core_1.text)("address"),
    toAddress: (0, pg_core_1.text)("to_address"),
    userLocation: (0, pg_core_1.geometry)("user_location", {
        type: "point",
        mode: "xy",
        srid: 4326,
    }).notNull(),
    userToLocation: (0, pg_core_1.geometry)("user_to_location", {
        type: "point",
        mode: "xy",
        srid: 4326,
    }).notNull(),
    description: (0, pg_core_1.varchar)("description", { length: 255 }),
    status: (0, pg_core_1.varchar)("status", { length: 20 })
        .notNull()
        .default(common_1.BreakdownRequestStatus.WAITING),
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
}, table => ({
    // Adding the unique constraint
    requestDriverUnique: (0, pg_core_1.unique)().on(table.userId, table.token),
}));
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
    reasonToClose: (0, pg_core_1.text)("reason_to_close"),
    isCompleted: (0, pg_core_1.boolean)("is_completed").default(false).notNull(),
    userStatus: (0, pg_core_1.varchar)("user_status", { length: 20 }),
    estimation: (0, pg_core_1.numeric)("estimated_cost", { precision: 10, scale: 2 }),
    explanation: (0, pg_core_1.text)("estimate_explanation"),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    paymentId: (0, pg_core_1.integer)("payment_id").references(() => exports.payments.id, { onDelete: "set null" }),
}, table => ({
    // Adding the unique constraint
    requestDriverUnique: (0, pg_core_1.unique)().on(table.requestId, table.driverId),
}));
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
// New table for ratings and feedback
exports.serviceRatings = (0, pg_core_1.pgTable)("service_ratings", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    requestId: (0, pg_core_1.integer)("request_id")
        .references(() => exports.breakdownRequest.id, { onDelete: "cascade" })
        .notNull(),
    customerId: (0, pg_core_1.integer)("customer_id")
        .references(() => exports.customer.id, { onDelete: "cascade" })
        .notNull(),
    driverId: (0, pg_core_1.integer)("driver_id").references(() => exports.driver.id, {
        onDelete: "cascade",
    }),
    customerRating: (0, pg_core_1.integer)("customer_rating"),
    customerFeedback: (0, pg_core_1.text)("customer_feedback"),
    siteRating: (0, pg_core_1.integer)("site_rating"),
    siteFeedback: (0, pg_core_1.text)("site_feedback"),
    serviceProvided: (0, pg_core_1.boolean)("serviceProvided").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// Add this new table for payment tracking
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    stripePaymentIntentId: (0, pg_core_1.varchar)("stripe_payment_intent_id", { length: 255 }).notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull(),
    driverId: (0, pg_core_1.integer)("driver_id")
        .references(() => exports.driver.id, { onDelete: "cascade" })
        .notNull(),
    requestId: (0, pg_core_1.integer)("request_id")
        .references(() => exports.breakdownRequest.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.serial)("id").primaryKey().notNull(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.user.id, { onDelete: "cascade" })
        .notNull(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    url: (0, pg_core_1.text)("url"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    isSeen: (0, pg_core_1.boolean)("is_seen").default(false).notNull(),
});
exports.notificationHistory = (0, pg_core_1.pgTable)("notification_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.user.id, { onDelete: "cascade" })
        .notNull(),
    notificationType: (0, pg_core_1.varchar)("notification_type", { length: 100 }).notNull(), // EMAIL, SMS, PUSH
    deliveryType: (0, pg_core_1.varchar)("delivery_type", { length: 20 }).notNull(),
    breakdownRequestId: (0, pg_core_1.integer)("breakdown_request_id")
        .references(() => exports.breakdownRequest.id, { onDelete: "cascade" })
        .notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull().default("PENDING"), // PENDING, SENT, FAILED
    retryCount: (0, pg_core_1.integer)("retry_count").notNull().default(0),
    errorMessage: (0, pg_core_1.text)("error_message"),
    lastAttempt: (0, pg_core_1.timestamp)("last_attempt", { withTimezone: true })
        .notNull()
        .defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
