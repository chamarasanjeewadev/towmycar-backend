"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
const config_1 = require("./src/config");
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: "./src/db/schema/*",
    out: "./src/db/migrations",
    driver: "pg",
    dbCredentials: {
        connectionString: config_1.DB_URL,
    },
    verbose: true,
    strict: true,
});
