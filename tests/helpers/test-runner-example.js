// This file is part of MapperExp.
//
// MapperExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// MapperExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with MapperExp. If not, see <https://www.gnu.org/licenses/>.

/**
 * Complete Test Suite Runner
 * Demonstrates the complete test infrastructure with LOCKED CONTRACT
 * ECMAScript 2021 - ServiceNow Compatible
 */

// Simple test framework for ServiceNow (Jasmine-style)
const TestRunner = {
  tests: [],
  currentSuite: null,
  results: {
    passed: 0,
    failed: 0,
    errors: [],
  },

  describe: function(description, fn) {
    this.currentSuite = description;
    fn();
    this.currentSuite = null;
  },

  it: function(description, fn) {
    this.tests.push({
      suite: this.currentSuite,
      description: description,
      fn: fn,
    });
  },

  expect: function(actual) {
    return {
      toBe: function(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
      },
      toEqual: function(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
      },
      toBeNull: function() {
        if (actual !== null) {
          throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
        }
      },
      toBeUndefined: function() {
        if (actual !== undefined) {
          throw new Error(`Expected undefined but got ${JSON.stringify(actual)}`);
        }
      },
      toThrow: function(expectedMessage) {
        let threw = false;
        let errorMessage = '';
        try {
          actual();
        } catch (error) {
          threw = true;
          errorMessage = error.message;
        }

        if (!threw) {
          throw new Error('Expected function to throw but it did not');
        }

        if (expectedMessage && !errorMessage.includes(expectedMessage)) {
          throw new Error(`Expected error containing "${expectedMessage}" but got "${errorMessage}"`);
        }
      },
      not: {
        toThrow: function() {
          try {
            actual();
          } catch (error) {
            throw new Error(`Expected function not to throw but it threw: ${error.message}`);
          }
        },
      },
    };
  },

  beforeEach: function(fn) {
    // Store setup function (simplified)
    this._beforeEach = fn;
  },

  run: function() {
    console.log('Running test suite...\n');

    for (const test of this.tests) {
      try {
        // Run beforeEach if defined
        if (this._beforeEach) {
          this._beforeEach();
        }

        // Run test
        test.fn();

        this.results.passed++;
        console.log(`✓ ${test.suite}: ${test.description}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({
          suite: test.suite,
          test: test.description,
          error: error.message,
        });
        console.log(`✗ ${test.suite}: ${test.description}`);
        console.log(`  Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Tests: ${this.results.passed} passed, ${this.results.failed} failed, ${this.tests.length} total`);
    console.log('='.repeat(60));

    return this.results;
  },
};

// Expose globally
const describe = TestRunner.describe.bind(TestRunner);
const it = TestRunner.it.bind(TestRunner);
const expect = TestRunner.expect.bind(TestRunner);

// ============================================================================
// EXAMPLE: Complete Integration Test Suite with LOCKED CONTRACT
// ============================================================================

describe('DataAdaptor - Complete Integration Tests (Locked Contract)', function() {

  it('should handle complete ServiceNow to API transformation', function() {
    // Mapping configuration using LOCKED CONTRACT
    const mapping = [
      {
        sources: { sys_id: 'sys_id' },
        target: 'id',
        type: 'string',
        format: 'uuid',
        required: true,
      },
      {
        sources: { number: 'number' },
        target: 'ticketNumber',
        type: 'string',
        pattern: '^INC[0-9]{7}$',
        required: true,
      },
      {
        sources: { sys_created_on: 'sys_created_on' },
        target: 'createdAt',
        type: 'string',
        format: 'date-time',
        transform: function(input) {
          return new Date(input.sys_created_on).toISOString();
        },
        required: true,
      },
      {
        sources: { state: 'state' },
        target: 'status',
        type: 'string',
        enum: ['new', 'in_progress', 'resolved'],
        transform: function(input) {
          const map = { '1': 'new', '2': 'in_progress', '3': 'resolved' };
          return map[input.state] || 'new';
        },
        required: true,
      },
      {
        sources: {
          first_name: 'caller_id.first_name',
          last_name: 'caller_id.last_name'
        },
        target: 'requester.name',
        type: 'string',
        transform: function(input) {
          return [input.first_name, input.last_name]
            .filter(function(n) { return n; })
            .join(' ');
        },
        required: true,
      },
      {
        sources: { email: 'caller_id.email' },
        target: 'requester.email',
        type: 'string',
        format: 'email',
        required: true,
      },
      {
        sources: { priority: 'priority' },
        target: 'priority',
        type: 'integer',
        minimum: 1,
        maximum: 5,
        required: true,
      },
      {
        sources: { short_description: 'short_description' },
        target: 'title',
        type: 'string',
        minLength: 1,
        maxLength: 200,
        required: true,
      },
      {
        sources: { description: 'description' },
        target: 'description',
        type: 'string',
        required: false,
        default: null,
      },
    ];

    // Create adaptor
    const adaptor = new DataAdaptor(mapping);

    // Source data (ServiceNow format)
    const source = {
      sys_id: '550e8400-e29b-41d4-a716-446655440000',
      number: 'INC0001234',
      sys_created_on: '2024-01-15 10:30:00',
      state: '2',
      caller_id: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
      },
      priority: 3,
      short_description: 'Unable to access email',
      description: 'User cannot login to Outlook',
    };

    // Transform
    const result = adaptor.transform(source);

    // Verify structure
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.ticketNumber).toBe('INC0001234');
    expect(result.status).toBe('in_progress');
    expect(result.requester.name).toBe('John Doe');
    expect(result.requester.email).toBe('john.doe@company.com');
    expect(result.priority).toBe(3);
    expect(result.title).toBe('Unable to access email');
    expect(result.description).toBe('User cannot login to Outlook');

    // Verify date format
    expect(result.createdAt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)).not.toBeNull();
  });

  it('should apply default values correctly', function() {
    const mapping = [
      {
        sources: { name: 'name' },
        target: 'name',
        type: 'string',
        required: true,
      },
      {
        sources: { optional: 'optional' },
        target: 'optional',
        type: 'string',
        required: false,
        default: 'default value',
      },
    ];

    const adaptor = new DataAdaptor(mapping);
    const result = adaptor.transform({ name: 'Test' });

    expect(result.name).toBe('Test');
    expect(result.optional).toBe('default value');
  });

  it('should validate required fields', function() {
    const mapping = [
      {
        sources: { name: 'name' },
        target: 'name',
        type: 'string',
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);

    expect(function() {
      adaptor.transform({});
    }).toThrow('required');
  });

  it('should validate email format', function() {
    const mapping = [
      {
        sources: { email: 'email' },
        target: 'email',
        type: 'string',
        format: 'email',
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);

    expect(function() {
      adaptor.transform({ email: 'invalid-email' });
    }).toThrow('email format');
  });

  it('should validate number constraints', function() {
    const mapping = [
      {
        sources: { age: 'age' },
        target: 'age',
        type: 'integer',
        minimum: 0,
        maximum: 120,
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);

    // Valid
    expect(function() {
      adaptor.transform({ age: 30 });
    }).not.toThrow();

    // Invalid - too large
    expect(function() {
      adaptor.transform({ age: 150 });
    }).toThrow('maximum');

    // Invalid - not integer
    expect(function() {
      adaptor.transform({ age: 30.5 });
    }).toThrow('integer');
  });

  it('should validate enum values', function() {
    const mapping = [
      {
        sources: { status: 'status' },
        target: 'status',
        type: 'string',
        enum: ['active', 'inactive', 'pending'],
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);

    // Valid
    expect(function() {
      adaptor.transform({ status: 'active' });
    }).not.toThrow();

    // Invalid
    expect(function() {
      adaptor.transform({ status: 'unknown' });
    }).toThrow('not in enum');
  });

  it('should handle array transformations', function() {
    const mapping = [
      {
        sources: { tags: 'tags' },
        target: 'tags',
        type: 'array',
        items: { type: 'string' },
        transform: function(input) {
          return input.tags.map(function(tag) {
            return tag.toLowerCase();
          });
        },
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);
    const result = adaptor.transform({
      tags: ['JavaScript', 'ServiceNow', 'API'],
    });

    expect(result.tags).toEqual(['javascript', 'servicenow', 'api']);
  });

  it('should handle nested object creation', function() {
    const mapping = [
      {
        sources: { street: 'street' },
        target: 'address.street',
        type: 'string',
        required: true,
      },
      {
        sources: { city: 'city' },
        target: 'address.city',
        type: 'string',
        required: true,
      },
      {
        sources: { postal_code: 'postal_code' },
        target: 'address.postalCode',
        type: 'string',
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);
    const result = adaptor.transform({
      street: '123 Main St',
      city: 'New York',
      postal_code: '10001',
    });

    expect(result).toEqual({
      address: {
        street: '123 Main St',
        city: 'New York',
        postalCode: '10001',
      },
    });
  });

  it('should preserve immutability', function() {
    const mapping = [
      {
        sources: { name: 'name' },
        target: 'userName',
        type: 'string',
        required: true,
      },
    ];

    const source = { name: 'John', age: 30 };
    const originalSource = JSON.parse(JSON.stringify(source));

    const adaptor = new DataAdaptor(mapping);
    adaptor.transform(source);

    // Source should not be mutated
    expect(source).toEqual(originalSource);
  });

  it('should handle context-aware transformations', function() {
    const mapping = [
      {
        sources: { amount: 'amount' },
        target: 'formattedAmount',
        type: 'string',
        transform: function(input, context) {
          const currency = context.source.currency || 'USD';
          return currency + ' ' + input.amount.toFixed(2);
        },
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);
    const result = adaptor.transform({
      amount: 99.99,
      currency: 'EUR',
    });

    expect(result.formattedAmount).toBe('EUR 99.99');
  });

  it('should demonstrate locked contract with multiple sources', function() {
    const mapping = [
      {
        sources: {
          urgency: 'urgency',
          impact: 'impact'
        },
        target: 'priority',
        type: 'integer',
        minimum: 1,
        maximum: 5,
        transform: function(input, context) {
          const urg = parseInt(input.urgency) || 3;
          const imp = parseInt(input.impact) || 3;

          // Business logic using context
          if (context.source.vip_customer === true) {
            return 1; // Highest priority for VIP
          }

          return Math.min(urg, imp);
        },
        required: true,
      },
    ];

    const adaptor = new DataAdaptor(mapping);

    // Non-VIP customer
    const result1 = adaptor.transform({
      urgency: '2',
      impact: '3',
      vip_customer: false,
    });
    expect(result1.priority).toBe(2);

    // VIP customer
    const result2 = adaptor.transform({
      urgency: '3',
      impact: '3',
      vip_customer: true,
    });
    expect(result2.priority).toBe(1);
  });
});

// ============================================================================
// Run all tests
// ============================================================================

console.log('DataAdaptor Test Suite - LOCKED CONTRACT DESIGN');
console.log('='.repeat(60));
console.log('Testing SOLID-compliant data transformation system');
console.log('OpenAPI 3.0 validation with LOCKED transform contract');
console.log('Transform signature: (input, { source }) => value\n');

const results = TestRunner.run();

// Summary
if (results.failed === 0) {
  console.log('\n✅ ALL TESTS PASSED!');
  console.log('\n🎯 LOCKED CONTRACT VERIFIED:');
  console.log('   - sources: Always an object');
  console.log('   - transform: Always (input, { source }) => value');
  console.log('   - input: Named object with keys matching sources');
  console.log('   - source: Full source record for context');
  console.log('   - ZERO AMBIGUITY ✓');
} else {
  console.log('\n❌ SOME TESTS FAILED');
  console.log('\nFailed tests:');
  results.errors.forEach(function(error) {
    console.log(`  - ${error.suite}: ${error.test}`);
    console.log(`    ${error.error}`);
  });
}
