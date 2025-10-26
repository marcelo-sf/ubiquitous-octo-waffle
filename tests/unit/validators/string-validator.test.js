const StringValidator = require('../../../src/string-validator.js');

/**
 * StringValidator Test Suite
 * Tests for OpenAPI 3.0 string type and format validation
 * ECMAScript 2021 - ServiceNow Compatible
 */

describe('StringValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new StringValidator();
  });

  describe('Basic type validation', () => {
    it('should accept valid string', () => {
      expect(() => validator.validate('hello', { type: 'string' })).not.toThrow();
    });

    it('should accept empty string', () => {
      expect(() => validator.validate('', { type: 'string' })).not.toThrow();
    });

    it('should reject number', () => {
      expect(() => validator.validate(123, { type: 'string' }))
        .toThrow('Expected type string but got number');
    });

    it('should reject boolean', () => {
      expect(() => validator.validate(true, { type: 'string' }))
        .toThrow('Expected type string but got boolean');
    });

    it('should reject null', () => {
      expect(() => validator.validate(null, { type: 'string' }))
        .toThrow('Expected type string but got null');
    });

    it('should reject undefined', () => {
      expect(() => validator.validate(undefined, { type: 'string' }))
        .toThrow('Expected type string but got undefined');
    });

    it('should reject object', () => {
      expect(() => validator.validate({}, { type: 'string' }))
        .toThrow('Expected type string but got object');
    });

    it('should reject array', () => {
      expect(() => validator.validate([], { type: 'string' }))
        .toThrow('Expected type string but got array');
    });
  });

  describe('Length constraints', () => {
    it('should accept string within minLength constraint', () => {
      expect(() => validator.validate('hello', { type: 'string', minLength: 3 }))
        .not.toThrow();
    });

    it('should accept string equal to minLength', () => {
      expect(() => validator.validate('hello', { type: 'string', minLength: 5 }))
        .not.toThrow();
    });

    it('should reject string shorter than minLength', () => {
      expect(() => validator.validate('hi', { type: 'string', minLength: 3 }))
        .toThrow('String length 2 is less than minimum length 3');
    });

    it('should accept string within maxLength constraint', () => {
      expect(() => validator.validate('hello', { type: 'string', maxLength: 10 }))
        .not.toThrow();
    });

    it('should accept string equal to maxLength', () => {
      expect(() => validator.validate('hello', { type: 'string', maxLength: 5 }))
        .not.toThrow();
    });

    it('should reject string longer than maxLength', () => {
      expect(() => validator.validate('hello world', { type: 'string', maxLength: 5 }))
        .toThrow('String length 11 is greater than maximum length 5');
    });

    it('should validate both minLength and maxLength', () => {
      expect(() => validator.validate('hello', { type: 'string', minLength: 3, maxLength: 10 }))
        .not.toThrow();
    });

    it('should handle empty string with minLength', () => {
      expect(() => validator.validate('', { type: 'string', minLength: 1 }))
        .toThrow('String length 0 is less than minimum length 1');
    });
  });

  describe('Pattern validation', () => {
    it('should accept string matching pattern', () => {
      expect(() => validator.validate('abc123', { type: 'string', pattern: '^[a-z0-9]+$' }))
        .not.toThrow();
    });

    it('should reject string not matching pattern', () => {
      expect(() => validator.validate('ABC', { type: 'string', pattern: '^[a-z]+$' }))
        .toThrow('String does not match pattern ^[a-z]+$');
    });

    it('should handle complex regex patterns', () => {
      expect(() => validator.validate('user@example.com', {
        type: 'string',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      })).not.toThrow();
    });

    it('should throw on invalid regex pattern', () => {
      expect(() => validator.validate('test', { type: 'string', pattern: '[invalid(' }))
        .toThrow('Invalid regex pattern');
    });
  });

  describe('Enum validation', () => {
    it('should accept value in enum', () => {
      expect(() => validator.validate('active', {
        type: 'string',
        enum: ['active', 'inactive', 'pending'],
      })).not.toThrow();
    });

    it('should reject value not in enum', () => {
      expect(() => validator.validate('deleted', {
        type: 'string',
        enum: ['active', 'inactive', 'pending'],
      })).toThrow('Value "deleted" is not in enum [active, inactive, pending]');
    });

    it('should handle single value enum', () => {
      expect(() => validator.validate('only', { type: 'string', enum: ['only'] }))
        .not.toThrow();
    });

    it('should be case-sensitive for enum', () => {
      expect(() => validator.validate('Active', { type: 'string', enum: ['active'] }))
        .toThrow('Value "Active" is not in enum [active]');
    });
  });

  describe('Format validation - date', () => {
    it('should accept valid date format YYYY-MM-DD', () => {
      expect(() => validator.validate('2024-01-15', { type: 'string', format: 'date' }))
        .not.toThrow();
    });

    it('should reject invalid date format', () => {
      expect(() => validator.validate('01/15/2024', { type: 'string', format: 'date' }))
        .toThrow('String does not match date format (YYYY-MM-DD)');
    });

    it('should reject invalid date values', () => {
      expect(() => validator.validate('2024-13-01', { type: 'string', format: 'date' }))
        .toThrow('String does not match date format (YYYY-MM-DD)');
    });

    it('should reject invalid day in date', () => {
      expect(() => validator.validate('2024-02-30', { type: 'string', format: 'date' }))
        .toThrow('String does not match date format (YYYY-MM-DD)');
    });
  });

  describe('Format validation - date-time', () => {
    it('should accept valid ISO 8601 date-time', () => {
      expect(() => validator.validate('2024-01-15T10:30:00Z', {
        type: 'string',
        format: 'date-time',
      })).not.toThrow();
    });

    it('should accept date-time with milliseconds', () => {
      expect(() => validator.validate('2024-01-15T10:30:00.123Z', {
        type: 'string',
        format: 'date-time',
      })).not.toThrow();
    });

    it('should accept date-time with timezone offset', () => {
      expect(() => validator.validate('2024-01-15T10:30:00+05:00', {
        type: 'string',
        format: 'date-time',
      })).not.toThrow();
    });

    it('should reject invalid date-time format', () => {
      expect(() => validator.validate('2024-01-15 10:30:00', {
        type: 'string',
        format: 'date-time',
      })).toThrow('String does not match date-time format (ISO 8601)');
    });
  });

  describe('Format validation - email', () => {
    it('should accept valid email', () => {
      expect(() => validator.validate('user@example.com', {
        type: 'string',
        format: 'email',
      })).not.toThrow();
    });

    it('should accept email with subdomain', () => {
      expect(() => validator.validate('user@mail.example.com', {
        type: 'string',
        format: 'email',
      })).not.toThrow();
    });

    it('should accept email with plus sign', () => {
      expect(() => validator.validate('user+tag@example.com', {
        type: 'string',
        format: 'email',
      })).not.toThrow();
    });

    it('should reject email without @', () => {
      expect(() => validator.validate('userexample.com', {
        type: 'string',
        format: 'email',
      })).toThrow('String does not match email format');
    });

    it('should reject email without domain', () => {
      expect(() => validator.validate('user@', {
        type: 'string',
        format: 'email',
      })).toThrow('String does not match email format');
    });
  });

  describe('Format validation - uuid', () => {
    it('should accept valid UUID v4', () => {
      expect(() => validator.validate('550e8400-e29b-41d4-a716-446655440000', {
        type: 'string',
        format: 'uuid',
      })).not.toThrow();
    });

    it('should accept UUID in any case', () => {
      expect(() => validator.validate('550E8400-E29B-41D4-A716-446655440000', {
        type: 'string',
        format: 'uuid',
      })).not.toThrow();
    });

    it('should reject invalid UUID format', () => {
      expect(() => validator.validate('not-a-uuid', {
        type: 'string',
        format: 'uuid',
      })).toThrow('String does not match uuid format');
    });

    it('should reject UUID with wrong segment lengths', () => {
      expect(() => validator.validate('550e8400-e29b-41d4-a716-44665544000', {
        type: 'string',
        format: 'uuid',
      })).toThrow('String does not match uuid format');
    });
  });

  describe('Format validation - uri', () => {
    it('should accept valid HTTP URI', () => {
      expect(() => validator.validate('https://example.com', {
        type: 'string',
        format: 'uri',
      })).not.toThrow();
    });

    it('should accept URI with path', () => {
      expect(() => validator.validate('https://example.com/path/to/resource', {
        type: 'string',
        format: 'uri',
      })).not.toThrow();
    });

    it('should accept URI with query string', () => {
      expect(() => validator.validate('https://example.com?key=value', {
        type: 'string',
        format: 'uri',
      })).not.toThrow();
    });

    it('should reject invalid URI', () => {
      expect(() => validator.validate('not a uri', {
        type: 'string',
        format: 'uri',
      })).toThrow('String does not match uri format');
    });
  });

  describe('Format validation - hostname', () => {
    it('should accept valid hostname', () => {
      expect(() => validator.validate('example.com', {
        type: 'string',
        format: 'hostname',
      })).not.toThrow();
    });

    it('should accept hostname with subdomain', () => {
      expect(() => validator.validate('mail.example.com', {
        type: 'string',
        format: 'hostname',
      })).not.toThrow();
    });

    it('should reject hostname with spaces', () => {
      expect(() => validator.validate('not a hostname', {
        type: 'string',
        format: 'hostname',
      })).toThrow('String does not match hostname format');
    });
  });

  describe('Format validation - ipv4', () => {
    it('should accept valid IPv4 address', () => {
      expect(() => validator.validate('192.168.1.1', {
        type: 'string',
        format: 'ipv4',
      })).not.toThrow();
    });

    it('should reject invalid IPv4 address', () => {
      expect(() => validator.validate('999.999.999.999', {
        type: 'string',
        format: 'ipv4',
      })).toThrow('String does not match ipv4 format');
    });
  });

  describe('Format validation - ipv6', () => {
    it('should accept valid IPv6 address', () => {
      expect(() => validator.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334', {
        type: 'string',
        format: 'ipv6',
      })).not.toThrow();
    });

    it('should accept compressed IPv6', () => {
      expect(() => validator.validate('2001:db8::1', {
        type: 'string',
        format: 'ipv6',
      })).not.toThrow();
    });

    it('should reject invalid IPv6 address', () => {
      expect(() => validator.validate('not-ipv6', {
        type: 'string',
        format: 'ipv6',
      })).toThrow('String does not match ipv6 format');
    });
  });

  describe('Unknown format handling', () => {
    it('should skip validation for unknown format', () => {
      expect(() => validator.validate('anything', {
        type: 'string',
        format: 'custom-format',
      })).not.toThrow();
    });
  });

  describe('Combined validations', () => {
    it('should validate type, format, and length', () => {
      expect(() => validator.validate('user@example.com', {
        type: 'string',
        format: 'email',
        minLength: 5,
        maxLength: 50,
      })).not.toThrow();
    });

    it('should validate type, enum, and length', () => {
      expect(() => validator.validate('active', {
        type: 'string',
        enum: ['active', 'inactive'],
        minLength: 3,
        maxLength: 10,
      })).not.toThrow();
    });
  });
});
