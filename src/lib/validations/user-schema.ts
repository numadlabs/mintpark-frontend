import * as z from "zod";

export const userSchema = z.object({
  id: z.string(),
  layerId: z.string(),
  address: z.string(),
  createdAt: z.string(),
  role: z.string(),
});
//Layer type
export type UserSchema = z.infer<typeof userSchema>;
