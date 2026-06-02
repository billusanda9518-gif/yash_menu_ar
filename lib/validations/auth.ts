import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'Email is required.' })
    .email({ error: 'Please enter a valid email address.' })
    .trim(),
  password: z
    .string()
    .min(1, { error: 'Password is required.' }),
});

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, { error: 'Email is required.' })
      .email({ error: 'Please enter a valid email address.' })
      .trim(),
    full_name: z
      .string()
      .min(2, { error: 'Name must be at least 2 characters.' })
      .max(100, { error: 'Name must be at most 100 characters.' })
      .trim(),
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters.' })
      .regex(/[a-zA-Z]/, { error: 'Password must contain at least one letter.' })
      .regex(/[0-9]/, { error: 'Password must contain at least one number.' }),
    confirm_password: z.string().min(1, { error: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'Email is required.' })
    .email({ error: 'Please enter a valid email address.' })
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
