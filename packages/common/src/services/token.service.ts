import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = process.env.RATING_SECRET_KEY || 'your-secret-key';

export const TokenService = {
  generateToken: (requestId: number): string => {
    return jwt.sign({ requestId }, SECRET_KEY, { expiresIn: '24h' });
  },

  generateUrlSafeToken: (requestId: number): string => {
    const uniqueId = uuidv4();
    return jwt.sign({ requestId, uniqueId }, SECRET_KEY, { expiresIn: '24h' });
  },

  verifyToken: (token: string): { requestId: number } | null => {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { requestId: number, uniqueId?: string };
      return { requestId: decoded.requestId };
    } catch (error) {
      return null;
    }
  },
};
