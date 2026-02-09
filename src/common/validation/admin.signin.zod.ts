import { z } from 'zod';

/**
 * Schema for admin signin credentials validation
 */
export const adminSigninSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type AdminSigninInput = z.infer<typeof adminSigninSchema>;
