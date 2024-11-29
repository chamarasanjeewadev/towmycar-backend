import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = process.env.RATING_SECRET_KEY || 'your-secret-key';

interface TokenPayload {
  requestId: number;
  driverId?: number;
  uniqueId: string;
}

export const TokenService = {
  generateToken: (requestId: number): string => {
    return jwt.sign({ requestId }, SECRET_KEY, { expiresIn: '24h' });
  },

  generateUrlSafeToken: (requestId: number, driverId: number): string => {
    const uniqueId = uuidv4();
    return jwt.sign({ requestId, driverId, uniqueId }, SECRET_KEY, { expiresIn: '24h' });
  },

  verifyToken: (token: string): { requestId: number; driverId?: number } | null => {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
      return { 
        requestId: decoded.requestId,
        driverId: decoded.driverId 
      };
    } catch (error) {
      return null;
    }
  },
};
