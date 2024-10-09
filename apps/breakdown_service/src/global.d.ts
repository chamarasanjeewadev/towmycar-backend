import { Request } from 'express';
import { StrictAuthProp } from '@clerk/clerk-sdk-node';

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {
      userInfo?: {
        userId: number;
        role: string;
        customerId?: number;
        driverId?: number;
        stripeCustomerId?: string;
      };
     
    }
  }
}

export {};