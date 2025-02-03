import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const serviceAccountBase64 = process.env.SERVICE_ACCOUNT;
      
      if (!serviceAccountBase64) {
        throw new Error('SERVICE_ACCOUNT environment variable is not set');
      }

      // Decode the Base64 string
      const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
      
      // Parse the JSON string
      const serviceAccount = JSON.parse(serviceAccountJson);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw error;
    }
  }
}

initializeFirebaseAdmin();

export default admin;
