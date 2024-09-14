import { z } from "zod";
import express, { NextFunction, Request, Response } from "express";

export const validateRequest =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    req.body = result.data; // Assign the validated data to req.body
    next();
  };
