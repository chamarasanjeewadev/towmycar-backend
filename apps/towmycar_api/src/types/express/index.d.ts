import { Auth } from "@clerk/backend";

declare global {
  namespace Express {
    interface Request {
      auth?: Auth;
      userId?: string;
    }
  }
}