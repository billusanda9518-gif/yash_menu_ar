import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, { error: 'Restaurant name must be at least 2 characters.' })
    .max(100, { error: 'Restaurant name must be at most 100 characters.' })
    .trim(),
  slug: z
    .string()
    .min(2, { error: 'Slug must be at least 2 characters.' })
    .max(100, { error: 'Slug must be at most 100 characters.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: 'Slug must be lowercase letters, numbers, and hyphens only.',
    }),
  description: z
    .string()
    .max(500, { error: 'Description must be at most 500 characters.' })
    .optional()
    .nullable(),
  address: z
    .string()
    .max(300, { error: 'Address must be at most 300 characters.' })
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(20, { error: 'Phone must be at most 20 characters.' })
    .optional()
    .nullable(),
  website: z
    .string()
    .url({ error: 'Please enter a valid URL.' })
    .optional()
    .nullable()
    .or(z.literal('')),
  currency: z.string().length(3, { error: 'Currency code must be 3 characters.' }).default('USD'),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
