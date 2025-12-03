/**
 * Input validation utilities
 * Provides type-safe validation for user inputs and data
 */

import type { PaymentMethod, OrderStatus } from '../types';

// Payment Method Constants and Validation
export const PAYMENT_METHODS = {
  CASH: 'Cash',
  CASHAPP: 'CashApp',
  VENMO: 'Venmo',
  ZELLE: 'Zelle',
} as const;

export const VALID_PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'CashApp', 'Venmo', 'Zelle'];

export function isValidPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && VALID_PAYMENT_METHODS.includes(value as PaymentMethod);
}

export function validatePaymentMethod(value: unknown): PaymentMethod {
  if (!isValidPaymentMethod(value)) {
    throw new Error(
      `Invalid payment method: ${value}. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`
    );
  }
  return value;
}

// Order Status Constants and Validation
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'ready',
  'completed',
  'cancelled',
];

export function isValidOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && VALID_ORDER_STATUSES.includes(value as OrderStatus);
}

export function validateOrderStatus(value: unknown): OrderStatus {
  if (!isValidOrderStatus(value)) {
    throw new Error(
      `Invalid order status: ${value}. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
    );
  }
  return value;
}

// Price Validation
export function isValidPrice(value: unknown): value is number {
  return (
    typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0 && value <= 10000 // Maximum price limit
  );
}

export function validatePrice(value: unknown): number {
  if (!isValidPrice(value)) {
    throw new Error('Price must be a positive number less than $10,000');
  }
  return value;
}

// Quantity Validation
export function isValidQuantity(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 100 // Maximum quantity limit
  );
}

export function validateQuantity(value: unknown): number {
  if (!isValidQuantity(value)) {
    throw new Error('Quantity must be a positive integer less than 100');
  }
  return value;
}

// String Sanitization
export function sanitizeString(value: string, maxLength: number = 1000): string {
  // Remove potentially dangerous characters but keep basic punctuation
  const sanitized = value
    .trim()
    .replace(/[<>]/g, '') // Remove HTML-like brackets
    .substring(0, maxLength);

  return sanitized;
}

// Email Validation (IIT-specific)
export function isValidIITEmail(email: string): boolean {
  return /^[^\s@]+@hawk\.illinoistech\.edu$/.test(email);
}

export function validateIITEmail(email: string): string {
  if (!isValidIITEmail(email)) {
    throw new Error('Email must be a valid IIT email (@hawk.illinoistech.edu)');
  }
  return email;
}

// Student ID Validation
export function isValidStudentId(id: string): boolean {
  return /^A\d{8}$/.test(id); // A followed by 8 digits
}

export function validateStudentId(id: string): string {
  if (!isValidStudentId(id)) {
    throw new Error('Student ID must start with A followed by 8 digits');
  }
  return id;
}

// Name Validation
export function isValidName(name: string): boolean {
  return /^[A-Za-z\s'-]{1,50}$/.test(name);
}

export function validateName(name: string, fieldName: string = 'Name'): string {
  if (!isValidName(name)) {
    throw new Error(
      `${fieldName} must contain only letters, spaces, hyphens, and apostrophes (1-50 characters)`
    );
  }
  return name;
}

// Phone Number Validation (US format)
export function isValidPhoneNumber(phone: string): boolean {
  // Accepts formats: (123) 456-7890, 123-456-7890, 1234567890
  return /^(\+1)?[\s-]?(\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{4}$/.test(phone);
}

export function validatePhoneNumber(phone: string): string {
  if (!isValidPhoneNumber(phone)) {
    throw new Error('Phone number must be a valid US phone number');
  }
  return phone;
}

// Notes/Description Validation
export function validateNotes(notes: string): string {
  const MAX_NOTES_LENGTH = 500;
  if (notes.length > MAX_NOTES_LENGTH) {
    throw new Error(`Notes must be less than ${MAX_NOTES_LENGTH} characters`);
  }
  return sanitizeString(notes, MAX_NOTES_LENGTH);
}

// Listing Category Validation
export const VALID_CATEGORIES = ['Meals', 'Snacks', 'Desserts', 'Drinks', 'Other'] as const;

export type ListingCategory = (typeof VALID_CATEGORIES)[number];

export function isValidCategory(value: unknown): value is ListingCategory {
  return typeof value === 'string' && VALID_CATEGORIES.includes(value as ListingCategory);
}

export function validateCategory(value: unknown): ListingCategory {
  if (!isValidCategory(value)) {
    throw new Error(`Invalid category: ${value}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  return value;
}
