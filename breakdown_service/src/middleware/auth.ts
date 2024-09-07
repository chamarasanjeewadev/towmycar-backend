import { Request, Response, NextFunction } from 'express';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  // For now, this function always returns true
  // In a real application, you would implement proper JWT authentication here
  next();
}