/**
 * Validation Utilities Tests
 * Comprehensive tests for input validation functions
 */
import {
  isValidPaymentMethod,
  validatePaymentMethod,
  isValidOrderStatus,
  validateOrderStatus,
  isValidPrice,
  validatePrice,
  isValidQuantity,
  validateQuantity,
  sanitizeString,
  isValidIITEmail,
  validateIITEmail,
  isValidStudentId,
  validateStudentId,
  isValidName,
  validateName,
  isValidPhoneNumber,
  validatePhoneNumber,
  validateNotes,
  isValidCategory,
  validateCategory,
  VALID_PAYMENT_METHODS,
  VALID_ORDER_STATUSES,
  VALID_CATEGORIES,
} from '../../src/utils/validation';

describe('Payment Method Validation', () => {
  describe('isValidPaymentMethod', () => {
    it('should return true for valid payment methods', () => {
      expect(isValidPaymentMethod('Cash')).toBe(true);
      expect(isValidPaymentMethod('CashApp')).toBe(true);
      expect(isValidPaymentMethod('Venmo')).toBe(true);
      expect(isValidPaymentMethod('Zelle')).toBe(true);
    });

    it('should return false for invalid payment methods', () => {
      expect(isValidPaymentMethod('Bitcoin')).toBe(false);
      expect(isValidPaymentMethod('PayPal')).toBe(false);
      expect(isValidPaymentMethod('')).toBe(false);
      expect(isValidPaymentMethod(null)).toBe(false);
      expect(isValidPaymentMethod(undefined)).toBe(false);
      expect(isValidPaymentMethod(123)).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isValidPaymentMethod('cash')).toBe(false);
      expect(isValidPaymentMethod('CASH')).toBe(false);
    });
  });

  describe('validatePaymentMethod', () => {
    it('should return the value for valid payment methods', () => {
      expect(validatePaymentMethod('Cash')).toBe('Cash');
      expect(validatePaymentMethod('Venmo')).toBe('Venmo');
    });

    it('should throw for invalid payment methods', () => {
      expect(() => validatePaymentMethod('Bitcoin')).toThrow('Invalid payment method');
      expect(() => validatePaymentMethod(null)).toThrow();
    });
  });

  it('should export all valid payment methods', () => {
    expect(VALID_PAYMENT_METHODS).toContain('Cash');
    expect(VALID_PAYMENT_METHODS).toContain('CashApp');
    expect(VALID_PAYMENT_METHODS).toContain('Venmo');
    expect(VALID_PAYMENT_METHODS).toContain('Zelle');
    expect(VALID_PAYMENT_METHODS).toHaveLength(4);
  });
});

describe('Order Status Validation', () => {
  describe('isValidOrderStatus', () => {
    it('should return true for valid order statuses', () => {
      expect(isValidOrderStatus('pending')).toBe(true);
      expect(isValidOrderStatus('confirmed')).toBe(true);
      expect(isValidOrderStatus('ready')).toBe(true);
      expect(isValidOrderStatus('completed')).toBe(true);
      expect(isValidOrderStatus('cancelled')).toBe(true);
    });

    it('should return false for invalid order statuses', () => {
      expect(isValidOrderStatus('processing')).toBe(false);
      expect(isValidOrderStatus('shipped')).toBe(false);
      expect(isValidOrderStatus('')).toBe(false);
      expect(isValidOrderStatus(null)).toBe(false);
      expect(isValidOrderStatus(undefined)).toBe(false);
    });
  });

  describe('validateOrderStatus', () => {
    it('should return the value for valid statuses', () => {
      expect(validateOrderStatus('pending')).toBe('pending');
      expect(validateOrderStatus('completed')).toBe('completed');
    });

    it('should throw for invalid statuses', () => {
      expect(() => validateOrderStatus('invalid')).toThrow('Invalid order status');
    });
  });

  it('should export all valid order statuses', () => {
    expect(VALID_ORDER_STATUSES).toHaveLength(5);
  });
});

describe('Price Validation', () => {
  describe('isValidPrice', () => {
    it('should return true for valid prices', () => {
      expect(isValidPrice(1)).toBe(true);
      expect(isValidPrice(10.99)).toBe(true);
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice(9999.99)).toBe(true);
    });

    it('should return false for zero or negative prices', () => {
      expect(isValidPrice(0)).toBe(false);
      expect(isValidPrice(-10)).toBe(false);
      expect(isValidPrice(-0.01)).toBe(false);
    });

    it('should return false for prices exceeding max limit', () => {
      expect(isValidPrice(10001)).toBe(false);
      expect(isValidPrice(100000)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(isValidPrice('10.99')).toBe(false);
      expect(isValidPrice(NaN)).toBe(false);
      expect(isValidPrice(Infinity)).toBe(false);
      expect(isValidPrice(null)).toBe(false);
      expect(isValidPrice(undefined)).toBe(false);
    });
  });

  describe('validatePrice', () => {
    it('should return the value for valid prices', () => {
      expect(validatePrice(10.99)).toBe(10.99);
    });

    it('should throw for invalid prices', () => {
      expect(() => validatePrice(0)).toThrow('Price must be a positive number');
      expect(() => validatePrice(-5)).toThrow();
      expect(() => validatePrice(10001)).toThrow();
    });
  });
});

describe('Quantity Validation', () => {
  describe('isValidQuantity', () => {
    it('should return true for valid quantities', () => {
      expect(isValidQuantity(1)).toBe(true);
      expect(isValidQuantity(10)).toBe(true);
      expect(isValidQuantity(100)).toBe(true);
    });

    it('should return false for zero or negative quantities', () => {
      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(-1)).toBe(false);
    });

    it('should return false for non-integer quantities', () => {
      expect(isValidQuantity(1.5)).toBe(false);
      expect(isValidQuantity(10.1)).toBe(false);
    });

    it('should return false for quantities exceeding max limit', () => {
      expect(isValidQuantity(101)).toBe(false);
      expect(isValidQuantity(1000)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(isValidQuantity('5')).toBe(false);
      expect(isValidQuantity(null)).toBe(false);
    });
  });

  describe('validateQuantity', () => {
    it('should return the value for valid quantities', () => {
      expect(validateQuantity(5)).toBe(5);
    });

    it('should throw for invalid quantities', () => {
      expect(() => validateQuantity(0)).toThrow('Quantity must be a positive integer');
      expect(() => validateQuantity(1.5)).toThrow();
      expect(() => validateQuantity(101)).toThrow();
    });
  });
});

describe('String Sanitization', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\thello\n')).toBe('hello');
    });

    it('should remove HTML-like brackets', () => {
      expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
      expect(sanitizeString('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    it('should truncate to max length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString, 100).length).toBe(100);
    });

    it('should use default max length of 1000', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString).length).toBe(1000);
    });

    it('should preserve normal text', () => {
      expect(sanitizeString('Hello, World!')).toBe('Hello, World!');
      expect(sanitizeString("It's a test")).toBe("It's a test");
    });
  });
});

describe('IIT Email Validation', () => {
  describe('isValidIITEmail', () => {
    it('should return true for valid IIT emails', () => {
      expect(isValidIITEmail('student@hawk.illinoistech.edu')).toBe(true);
      expect(isValidIITEmail('john.doe@hawk.illinoistech.edu')).toBe(true);
      expect(isValidIITEmail('a12345678@hawk.illinoistech.edu')).toBe(true);
    });

    it('should return false for non-IIT emails', () => {
      expect(isValidIITEmail('test@gmail.com')).toBe(false);
      expect(isValidIITEmail('test@iit.edu')).toBe(false);
      expect(isValidIITEmail('test@illinoistech.edu')).toBe(false);
    });

    it('should return false for invalid email formats', () => {
      expect(isValidIITEmail('noemail')).toBe(false);
      expect(isValidIITEmail('@hawk.illinoistech.edu')).toBe(false);
      expect(isValidIITEmail('test @hawk.illinoistech.edu')).toBe(false);
    });
  });

  describe('validateIITEmail', () => {
    it('should return the email for valid IIT emails', () => {
      expect(validateIITEmail('test@hawk.illinoistech.edu')).toBe('test@hawk.illinoistech.edu');
    });

    it('should throw for invalid IIT emails', () => {
      expect(() => validateIITEmail('test@gmail.com')).toThrow('Email must be a valid IIT email');
    });
  });
});

describe('Student ID Validation', () => {
  describe('isValidStudentId', () => {
    it('should return true for valid student IDs', () => {
      expect(isValidStudentId('A12345678')).toBe(true);
      expect(isValidStudentId('A00000000')).toBe(true);
      expect(isValidStudentId('A99999999')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidStudentId('12345678')).toBe(false);
      expect(isValidStudentId('B12345678')).toBe(false);
      expect(isValidStudentId('A1234567')).toBe(false);
      expect(isValidStudentId('A123456789')).toBe(false);
      expect(isValidStudentId('a12345678')).toBe(false);
    });
  });

  describe('validateStudentId', () => {
    it('should return the ID for valid student IDs', () => {
      expect(validateStudentId('A12345678')).toBe('A12345678');
    });

    it('should throw for invalid student IDs', () => {
      expect(() => validateStudentId('12345678')).toThrow('Student ID must start with A');
    });
  });
});

describe('Name Validation', () => {
  describe('isValidName', () => {
    it('should return true for valid names', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName('Mary Jane')).toBe(true);
      expect(isValidName("O'Brien")).toBe(true);
      expect(isValidName('Smith-Jones')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('John123')).toBe(false);
      expect(isValidName('John@Doe')).toBe(false);
      expect(isValidName('a'.repeat(51))).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should return the name for valid names', () => {
      expect(validateName('John')).toBe('John');
      expect(validateName('Jane', 'First name')).toBe('Jane');
    });

    it('should throw with custom field name', () => {
      expect(() => validateName('123', 'First name')).toThrow('First name must contain only');
    });
  });
});

describe('Phone Number Validation', () => {
  describe('isValidPhoneNumber', () => {
    it('should return true for valid US phone numbers', () => {
      expect(isValidPhoneNumber('(123) 456-7890')).toBe(true);
      expect(isValidPhoneNumber('123-456-7890')).toBe(true);
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('+1 123-456-7890')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhoneNumber('123-456')).toBe(false);
      expect(isValidPhoneNumber('abc-def-ghij')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should return the phone for valid numbers', () => {
      expect(validatePhoneNumber('123-456-7890')).toBe('123-456-7890');
    });

    it('should throw for invalid phone numbers', () => {
      expect(() => validatePhoneNumber('invalid')).toThrow(
        'Phone number must be a valid US phone number'
      );
    });
  });
});

describe('Notes Validation', () => {
  describe('validateNotes', () => {
    it('should return sanitized notes for valid input', () => {
      expect(validateNotes('Please deliver to room 101')).toBe('Please deliver to room 101');
    });

    it('should trim whitespace', () => {
      expect(validateNotes('  note  ')).toBe('note');
    });

    it('should remove HTML brackets', () => {
      expect(validateNotes('note <script>')).toBe('note script');
    });

    it('should throw for notes exceeding max length', () => {
      const longNote = 'a'.repeat(501);
      expect(() => validateNotes(longNote)).toThrow('Notes must be less than 500 characters');
    });
  });
});

describe('Category Validation', () => {
  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('Meals')).toBe(true);
      expect(isValidCategory('Snacks')).toBe(true);
      expect(isValidCategory('Desserts')).toBe(true);
      expect(isValidCategory('Drinks')).toBe(true);
      expect(isValidCategory('Other')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('Food')).toBe(false);
      expect(isValidCategory('meals')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory(null)).toBe(false);
    });
  });

  describe('validateCategory', () => {
    it('should return the category for valid input', () => {
      expect(validateCategory('Meals')).toBe('Meals');
    });

    it('should throw for invalid categories', () => {
      expect(() => validateCategory('Invalid')).toThrow('Invalid category');
    });
  });

  it('should export all valid categories', () => {
    expect(VALID_CATEGORIES).toContain('Meals');
    expect(VALID_CATEGORIES).toContain('Snacks');
    expect(VALID_CATEGORIES).toContain('Desserts');
    expect(VALID_CATEGORIES).toContain('Drinks');
    expect(VALID_CATEGORIES).toContain('Other');
    expect(VALID_CATEGORIES).toHaveLength(5);
  });
});
