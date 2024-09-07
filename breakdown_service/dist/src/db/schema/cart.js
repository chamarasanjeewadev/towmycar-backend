"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineItemsRelations = exports.cartRelations = exports.cartLineItems = exports.carts = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.carts = (0, pg_core_1.pgTable)("carts", {
    id: (0, pg_core_1.serial)("id").primaryKey(), // for db record
    customerId: (0, pg_core_1.integer)("customer_id").notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
});
exports.cartLineItems = (0, pg_core_1.pgTable)("cart_line_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(), // for db record
    productId: (0, pg_core_1.integer)("product_id").notNull(),
    cartId: (0, pg_core_1.integer)("cart_id")
        .references(() => exports.carts.id, { onDelete: "cascade" })
        .notNull(),
    itemName: (0, pg_core_1.varchar)("item_name").notNull(), // human readable
    variant: (0, pg_core_1.varchar)("variant"), // Small // medium // big
    qty: (0, pg_core_1.integer)("qty").notNull(),
    price: (0, pg_core_1.numeric)("amount").notNull(), // amount in cents
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
});
exports.cartRelations = (0, drizzle_orm_1.relations)(exports.carts, ({ many }) => ({
    lineItems: many(exports.cartLineItems),
}));
exports.lineItemsRelations = (0, drizzle_orm_1.relations)(exports.cartLineItems, ({ one }) => ({
    cart: one(exports.carts, {
        fields: [exports.cartLineItems.cartId],
        references: [exports.carts.id],
    }),
}));
