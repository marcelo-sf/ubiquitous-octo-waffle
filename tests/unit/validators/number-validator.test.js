const { NumberValidator } = require('../../../src/validators.js');

/**
 * NumberValidator Test Suite
 * Tests for OpenAPI 3.0 number and integer type validation
 * ECMAScript 2021 - ServiceNow Compatible
 */

describe('NumberValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new NumberValidator();
  });

  describe('Number type validation', () => {
    it('should accept integer', () => {
      expect(() => validator.validate(42, { type: 'number' })).not.toThrow();
    });

    it('should accept float', () => {
      expect(() => validator.validate(3.14, { type: 'number' })).not.toThrow();
    });

    it('should accept zero', () => {
      expect(() => validator.validate(0, { type: 'number' })).not.toThrow();
    });

    it('should accept negative number', () => {
      expect(() => validator.validate(-42, { type: 'number' })).not.toThrow();
    });

    it('should reject string', () => {
      expect(() => validator.validate('123', { type: 'number' }))
        .toThrow('Expected type number but got string');
    });

    it('should reject boolean', () => {
      expect(() => validator.validate(true, { type: 'number' }))
        .toThrow('Expected type number but got boolean');
    });

    it('should reject null', () => {
      expect(() => validator.validate(null, { type: 'number' }))
        .toThrow('Expected type number but got null');
    });

    it('should reject undefined', () => {
      expect(() => validator.validate(undefined, { type: 'number' }))
        .toThrow('Expected type number but got undefined');
    });

    it('should reject NaN', () => {
      expect(() => validator.validate(NaN, { type: 'number' }))
        .toThrow('Number cannot be NaN');
    });

    it('should reject Infinity', () => {
      expect(() => validator.validate(Infinity, { type: 'number' }))
        .toThrow('Number cannot be Infinity');
    });

    it('should reject negative Infinity', () => {
      expect(() => validator.validate(-Infinity, { type: 'number' }))
        .toThrow('Number cannot be Infinity');
    });
  });

  describe('Integer type validation', () => {
    it('should accept integer', () => {
      expect(() => validator.validate(42, { type: 'integer' })).not.toThrow();
    });

    it('should accept zero', () => {
      expect(() => validator.validate(0, { type: 'integer' })).not.toThrow();
    });

    it('should accept negative integer', () => {
      expect(() => validator.validate(-42, { type: 'integer' })).not.toThrow();
    });

    it('should reject float', () => {
      expect(() => validator.validate(3.14, { type: 'integer' }))
        .toThrow('Expected type integer but got float');
    });

    it('should reject string', () => {
      expect(() => validator.validate('123', { type: 'integer' }))
        .toThrow('Expected type integer but got string');
    });

    it('should reject NaN', () => {
      expect(() => validator.validate(NaN, { type: 'integer' }))
        .toThrow('Number cannot be NaN');
    });
  });

  describe('Minimum constraint', () => {
    it('should accept value greater than minimum', () => {
      expect(() => validator.validate(10, { type: 'number', minimum: 5 }))
        .not.toThrow();
    });

    it('should accept value equal to minimum', () => {
      expect(() => validator.validate(5, { type: 'number', minimum: 5 }))
        .not.toThrow();
    });

    it('should reject value less than minimum', () => {
      expect(() => validator.validate(3, { type: 'number', minimum: 5 }))
        .toThrow('Number 3 is less than minimum 5');
    });

    it('should work with negative minimum', () => {
      expect(() => validator.validate(-5, { type: 'number', minimum: -10 }))
        .not.toThrow();
    });

    it('should work with zero minimum', () => {
      expect(() => validator.validate(-1, { type: 'number', minimum: 0 }))
        .toThrow('Number -1 is less than minimum 0');
    });
  });

  describe('Maximum constraint', () => {
    it('should accept value less than maximum', () => {
      expect(() => validator.validate(5, { type: 'number', maximum: 10 }))
        .not.toThrow();
    });

    it('should accept value equal to maximum', () => {
      expect(() => validator.validate(10, { type: 'number', maximum: 10 }))
        .not.toThrow();
    });

    it('should reject value greater than maximum', () => {
      expect(() => validator.validate(15, { type: 'number', maximum: 10 }))
        .toThrow('Number 15 is greater than maximum 10');
    });

    it('should work with negative maximum', () => {
      expect(() => validator.validate(-5, { type: 'number', maximum: -3 }))
        .toThrow('Number -5 is greater than maximum -3');
    });
  });

  describe('Exclusive minimum constraint', () => {
    it('should accept value greater than exclusive minimum', () => {
      expect(() => validator.validate(6, { type: 'number', exclusiveMinimum: 5 }))
        .not.toThrow();
    });

    it('should reject value equal to exclusive minimum', () => {
      expect(() => validator.validate(5, { type: 'number', exclusiveMinimum: 5 }))
        .toThrow('Number 5 is not greater than exclusive minimum 5');
    });

    it('should reject value less than exclusive minimum', () => {
      expect(() => validator.validate(4, { type: 'number', exclusiveMinimum: 5 }))
        .toThrow('Number 4 is not greater than exclusive minimum 5');
    });
  });

  describe('Exclusive maximum constraint', () => {
    it('should accept value less than exclusive maximum', () => {
      expect(() => validator.validate(9, { type: 'number', exclusiveMaximum: 10 }))
        .not.toThrow();
    });

    it('should reject value equal to exclusive maximum', () => {
      expect(() => validator.validate(10, { type: 'number', exclusiveMaximum: 10 }))
        .toThrow('Number 10 is not less than exclusive maximum 10');
    });

    it('should reject value greater than exclusive maximum', () => {
      expect(() => validator.validate(11, { type: 'number', exclusiveMaximum: 10 }))
        .toThrow('Number 11 is not less than exclusive maximum 10');
    });
  });

  describe('Multiple of constraint', () => {
    it('should accept value that is multiple of constraint', () => {
      expect(() => validator.validate(15, { type: 'number', multipleOf: 5 }))
        .not.toThrow();
    });

    it('should accept zero with multipleOf', () => {
      expect(() => validator.validate(0, { type: 'number', multipleOf: 5 }))
        .not.toThrow();
    });

    it('should reject value that is not multiple of constraint', () => {
      expect(() => validator.validate(17, { type: 'number', multipleOf: 5 }))
        .toThrow('Number 17 is not a multiple of 5');
    });

    it('should work with decimal multipleOf', () => {
      expect(() => validator.validate(1.5, { type: 'number', multipleOf: 0.5 }))
        .not.toThrow();
    });

    it('should handle floating point precision issues', () => {
      expect(() => validator.validate(0.3, { type: 'number', multipleOf: 0.1 }))
        .not.toThrow();
    });
  });

  describe('Enum validation', () => {
    it('should accept value in enum', () => {
      expect(() => validator.validate(1, { type: 'number', enum: [1, 2, 3] }))
        .not.toThrow();
    });

    it('should reject value not in enum', () => {
      expect(() => validator.validate(5, { type: 'number', enum: [1, 2, 3] }))
        .toThrow('Value 5 is not in enum [1, 2, 3]');
    });

    it('should work with negative numbers in enum', () => {
      expect(() => validator.validate(-1, { type: 'number', enum: [-1, 0, 1] }))
        .not.toThrow();
    });

    it('should work with floats in enum', () => {
      expect(() => validator.validate(3.14, { type: 'number', enum: [3.14, 2.71] }))
        .not.toThrow();
    });
  });

  describe('Combined constraints', () => {
    it('should validate multiple constraints together', () => {
      expect(() => validator.validate(10, {
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
      })).not.toThrow();
    });

    it('should fail if any constraint fails', () => {
      expect(() => validator.validate(7, {
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
      })).toThrow('Number 7 is not a multiple of 5');
    });

    it('should validate integer with range', () => {
      expect(() => validator.validate(50, {
        type: 'integer',
        minimum: 1,
        maximum: 100,
      })).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle very large numbers', () => {
      expect(() => validator.validate(Number.MAX_SAFE_INTEGER, { type: 'number' }))
        .not.toThrow();
    });

    it('should handle very small numbers', () => {
      expect(() => validator.validate(Number.MIN_SAFE_INTEGER, { type: 'number' }))
        .not.toThrow();
    });

    it('should handle negative zero', () => {
      expect(() => validator.validate(-0, { type: 'number' })).not.toThrow();
    });

    it('should treat -0 and +0 as equal for minimum', () => {
      expect(() => validator.validate(-0, { type: 'number', minimum: 0 }))
        .not.toThrow();
    });
  });
});
