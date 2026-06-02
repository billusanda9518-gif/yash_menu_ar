import { z } from 'zod';

// ─── Dish Schemas ─────────────────────────────────────────────────────────────

export const createDishSchema = z.object({
  name: z
    .string()
    .min(1, { error: 'Dish name is required.' })
    .max(150, { error: 'Dish name must be at most 150 characters.' })
    .trim(),
  description: z
    .string()
    .max(1000, { error: 'Description must be at most 1000 characters.' })
    .optional()
    .nullable(),
  price: z
    .number()
    .min(0, { error: 'Price must be zero or positive.' })
    .max(99999.99, { error: 'Price is too high.' }),
  currency: z.string().length(3, { error: 'Currency code must be 3 characters.' }).default('USD'),
  category_id: z.string().uuid({ error: 'A valid category is required.' }),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  allergens: z.array(z.string()).default([]),
  preparation_time: z
    .number()
    .int({ error: 'Preparation time must be a whole number.' })
    .min(0, { error: 'Preparation time cannot be negative.' })
    .optional()
    .nullable(),
  sort_order: z.number().int().default(0),
});

export const updateDishSchema = createDishSchema.partial();

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;

// ─── Category Schemas ─────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { error: 'Category name is required.' })
    .max(100, { error: 'Category name must be at most 100 characters.' })
    .trim(),
  description: z
    .string()
    .max(300, { error: 'Description must be at most 300 characters.' })
    .optional()
    .nullable(),
  sort_order: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
