import { z } from 'zod';

// Name validation
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[A-Za-z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Student ID validation
const studentIdSchema = z
  .string()
  .min(1, 'Student ID is required')
  .regex(/^A\d{8}$/, 'Student ID must start with A followed by 8 digits');

// Phone number validation
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^(\+1)?[\s-]?(\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}$/,
    'Must be a valid US phone number'
  );

// User Profile Schema
export const userProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  studentId: studentIdSchema,
  phoneNumber: phoneSchema,
  paymentMethods: z
    .object({
      cash: z.boolean().optional(),
      cashapp: z.string().max(50).optional(),
      venmo: z.string().max(50).optional(),
      zelle: z.string().max(50).optional(),
    })
    .optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
