import { z } from 'zod';
import { validatePasswordStrength } from '../../utils/passwordStrength';

// Email validation (IIT-specific)
const iitEmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .regex(/^[^\s@]+@hawk\.illinoistech\.edu$/, 'Must be a valid IIT email (@hawk.illinoistech.edu)');

// Password validation with comprehensive strength checking
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .superRefine((password, ctx) => {
    const result = validatePasswordStrength(password);
    if (!result.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.errors[0] || 'Password does not meet security requirements',
      });
    }
  });

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

// Security answer validation
const securityAnswerSchema = z
  .string()
  .min(3, 'Answer must be at least 3 characters')
  .max(100, 'Answer must be less than 100 characters')
  .transform((val) => val.trim());

// Login Schema
export const loginSchema = z.object({
  email: iitEmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup Schema
export const signupSchema = z
  .object({
    email: iitEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: nameSchema,
    lastName: nameSchema,
    studentId: studentIdSchema,
    phoneNumber: phoneSchema,
    securityQuestion1: z.string().min(1, 'Security question 1 is required'),
    securityAnswer1: securityAnswerSchema,
    securityQuestion2: z.string().min(1, 'Security question 2 is required'),
    securityAnswer2: securityAnswerSchema,
    securityQuestion3: z.string().min(1, 'Security question 3 is required'),
    securityAnswer3: securityAnswerSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    const result = validatePasswordStrength(data.password, data.email);
    if (!result.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: result.errors[0] || 'Password does not meet security requirements',
      });
    }
  })
  .refine(
    (data) => {
      const answers = [data.securityAnswer1, data.securityAnswer2, data.securityAnswer3];
      const uniqueAnswers = new Set(answers.map((a) => a.toLowerCase()));
      return uniqueAnswers.size === answers.length;
    },
    {
      message: 'Security answers must be unique',
      path: ['securityAnswer3'],
    }
  );

export type SignupFormData = z.infer<typeof signupSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: iitEmailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Security Questions Verification Schema
export const securityQuestionsSchema = z.object({
  answer1: securityAnswerSchema,
  answer2: securityAnswerSchema,
  answer3: securityAnswerSchema,
});

export type SecurityQuestionsFormData = z.infer<typeof securityQuestionsSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
