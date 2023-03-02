import { z } from "zod";

export const MdSchema = z.object({
  Category: z.string().min(3),
  Author: z.string().min(3).max(50),
  Quote: z.string().min(10).max(200),
  "Quote non-duplicity confirmation": z.boolean(),
});
