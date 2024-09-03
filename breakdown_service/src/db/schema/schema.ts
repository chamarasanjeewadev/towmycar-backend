import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
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

// Updated breakdownRequest table
export const breakdownRequest = pgTable("breakdown_request", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => userProfile.id)
    .notNull(),
  requestType: varchar("request_type", { length: 50 }).notNull(),
  location: text("location").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserProfile = typeof userProfile.$inferSelect;
export type BreakdownRequest = typeof breakdownRequest.$inferSelect;
