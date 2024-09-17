import dotenv from "dotenv";
dotenv.config();

export const DB_URL = process.env.DB_URL;

// You can add a console.log here for debugging
console.log("DB_URL:", DB_URL);
