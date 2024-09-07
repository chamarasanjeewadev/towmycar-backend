"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = require("./src/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
function runMigration() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("migration start...");
            const pool = new pg_1.Pool({ connectionString: config_1.DB_URL });
            const db = (0, node_postgres_1.drizzle)(pool);
            yield (0, migrator_1.migrate)(db, { migrationsFolder: "./src/db/migrations" });
            console.log("migration was successful!");
            pool.end();
        }
        catch (err) {
            console.log("migration error", err);
        }
    });
}
runMigration();
