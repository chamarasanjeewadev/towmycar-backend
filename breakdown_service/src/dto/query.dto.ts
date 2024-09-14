import { z } from "zod";

export const PaginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  pageSize: z.string().regex(/^\d+$/).transform(Number).default("10"),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;