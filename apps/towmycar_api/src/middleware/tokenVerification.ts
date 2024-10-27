import { Request, Response, NextFunction } from 'express';
import { TokenService } from '@towmycar/common';

export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  const requestId = parseInt(req.params.requestId, 10);

  if (!token) {
    return res.status(403).json({ error: "A token is required for authentication" });
  }

  try {
    const decoded = TokenService.verifyToken(token);
    if (!decoded || decoded.requestId !== requestId) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    // req.tokenData = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
