import { z } from 'zod';
import { VALID_CATEGORIES } from '@/utils/validation';

// Category validation
const categorySchema = z.enum([...VALID_CATEGORIES] as [string, ...string[]], {
  message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
});

// Price validation (max $10,000)
const priceSchema = z
  .number({
    message: 'Price must be a valid number',
  })
  .positive('Price must be greater than 0')
  .max(10000, 'Price cannot exceed $10,000')
  .multipleOf(0.01, 'Price can have at most 2 decimal places');

// Quantity validation (max 100)
const quantitySchema = z
  .number({
    message: 'Quantity must be a valid number',
  })
  .int('Quantity must be a whole number')
  .positive('Quantity must be at least 1')
  .max(100, 'Quantity cannot exceed 100');

// Sanitized string helper
const sanitizedString = (field: string, maxLength: number) =>
  z
    .string()
    .min(1, `${field} is required`)
    .max(maxLength, `${field} must be less than ${maxLength} characters`)
    .transform((val) => val.trim().replace(/[<>]/g, '').substring(0, maxLength));

// Create Listing Schema
export const createListingSchema = z.object({
  name: sanitizedString('Name', 100),
  description: sanitizedString('Description', 500),
  category: categorySchema,
  price: priceSchema,
  quantity: quantitySchema,
  dietaryInfo: z
    .string()
    .max(200, 'Dietary info must be less than 200 characters')
    .optional()
    .transform((val) => (val ? val.trim().replace(/[<>]/g, '') : undefined)),
  pickupLocation: sanitizedString('Pickup location', 100),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  image: z
    .instanceof(File, { message: 'Image is required' })
    .refine((file) => file.size > 0, 'Image is required')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Image must be JPEG, PNG, or WebP'
    ),
});

export type CreateListingFormData = z.infer<typeof createListingSchema>;

// Edit Listing Schema (same as create but image is optional)
export const editListingSchema = z.object({
  name: sanitizedString('Name', 100),
  description: sanitizedString('Description', 500),
  category: categorySchema,
  price: priceSchema,
  quantity: quantitySchema,
  dietaryInfo: z
    .string()
    .max(200, 'Dietary info must be less than 200 characters')
    .optional()
    .transform((val) => (val ? val.trim().replace(/[<>]/g, '') : undefined)),
  pickupLocation: sanitizedString('Pickup location', 100),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Image must be JPEG, PNG, or WebP'
    )
    .optional(),
});

export type EditListingFormData = z.infer<typeof editListingSchema>;
