import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from '../config';

// Create a Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: COGNITO_CLIENT_ID,
});

export function authenticateJWT(allowedGroups?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    try {
      const payload = await verifier.verify(token);
      console.log("payload",payload);
      // Add the user information to the request object
      (req as any).user = payload;

      // If groups are specified, check if the user's group is allowed
      if (allowedGroups && allowedGroups.length > 0) {
        const userGroups = payload['cognito:groups'] || [];
        if (!userGroups.some(group => allowedGroups.includes(group))) {
          return res.status(403).json({ message: 'Access forbidden' });
        }
      }
      console.log("user authenticated");
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}