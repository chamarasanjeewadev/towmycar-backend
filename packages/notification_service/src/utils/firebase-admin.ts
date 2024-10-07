import admin from "firebase-admin";
import dotenv from "dotenv";
import { ServiceAccount } from "firebase-admin";

dotenv.config();

const serviceAccountPath = "./service-account.json";

// Load the service account key JSON file
const serviceAccount = require(serviceAccountPath) as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
