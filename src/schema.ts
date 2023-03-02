import { z } from "zod";

export const MdSchema = z.object({
  Title: z.string().min(5),
  Category: z.string().array().min(1),
  Author: z.string().min(3).max(50),
  Quote: z.string().min(10).max(200),
  "Quote non-duplicity confirmation": z.boolean(),
});

export type Quote = typeof MdSchema._type;
