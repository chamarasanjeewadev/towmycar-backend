import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { httpLogger, HandleErrorWithLogger } from "./utils";

const app = express();

// Global error handler interface
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Error handling middleware for parsing errors
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ 
      error: 'Invalid JSON payload' 
    });
  }
  next(err);
});

// Health check route
app.use("/", (req: Request, res: Response, _: NextFunction) => {
  return res.status(200).json({ message: "I am healthy!" });
});

// Global error handling middleware
app.use((err: ErrorWithStatus, _: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use(HandleErrorWithLogger);
console.log("app is configured...");

// Add unhandled rejection handler
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
  // Optionally terminate the process
  // process.exit(1);
});

// Add uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Optionally terminate the process
  // process.exit(1);
});

export default app;
