// This file is part of AdaptorExp.
//
// AdaptorExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// AdaptorExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with AdaptorExp. If not, see <https://www.gnu.org/licenses/>.

const DataAdaptor = require('../../src/data-adaptor.js');

/**
 * DataAdaptor Integration Test Suite
 * Tests complete transformation pipeline
 * ECMAScript 2021 - ServiceNow Compatible
 */

describe('DataAdaptor - Integration Tests', () => {
    let adaptor;

    describe('Simple transformations', () => {
        it('should transform simple field rename', () => {
            const mapping = [
                {
                    source: 'user_name',
                    target: 'userName',
                    type: 'string',
                    required: true
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({ user_name: 'John' });

            expect(result).toEqual({ userName: 'John' });
        });

        it('should transform multiple fields', () => {
            const mapping = [
                { source: 'first_name', target: 'firstName', type: 'string', required: true },
                { source: 'last_name', target: 'lastName', type: 'string', required: true },
                { source: 'age', target: 'age', type: 'integer', required: true }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({
                first_name: 'John',
                last_name: 'Doe',
                age: 30
            });

            expect(result).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                age: 30
            });
        });

        it('should create nested target structure', () => {
            const mapping = [
                { source: 'street', target: 'address.street', type: 'string', required: true },
                { source: 'city', target: 'address.city', type: 'string', required: true }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({
                street: '123 Main St',
                city: 'NYC'
            });

            expect(result).toEqual({
                address: {
                    street: '123 Main St',
                    city: 'NYC'
                }
            });
        });

        it('should extract from nested source structure', () => {
            const mapping = [
                { source: 'user.profile.email', target: 'email', type: 'string', format: 'email', required: true }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({
                user: {
                    profile: {
                        email: 'john@example.com'
                    }
                }
            });

            expect(result).toEqual({ email: 'john@example.com' });
        });
    });

    describe('Transformations with user functions', () => {
        it('should apply transformation function', () => {
            const mapping = [
                {
                    source: 'created_date',
                    target: 'createdAt',
                    type: 'string',
                    format: 'date-time',
                    transform: (timestamp) => new Date(timestamp * 1000).toISOString(),
                    required: true
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({ created_date: 1609459200 }); // 2021-01-01 00:00:00 UTC

            expect(result.createdAt).toBe('2021-01-01T00:00:00.000Z');
        });

        it('should pass full source object to transform', () => {
            const mapping = [
                {
                    source: 'amount',
                    target: 'formattedAmount',
                    type: 'string',
                    transform: (value, sourceData) => {
                        const currency = sourceData.source.currency || 'USD';
                        return `${currency} ${value.toFixed(2)}`;
                    },
                    required: true
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({
                amount: 99.99,
                currency: 'EUR'
            });

            expect(result.formattedAmount).toBe('EUR 99.99');
        });

        it('should handle multiple source fields (computed)', () => {
            const mapping = [
                {
                    sources: ['first_name', 'last_name'],
                    target: 'fullName',
                    type: 'string',
                    transform: (values) => values.filter(Boolean).join(' '),
                    required: true
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({
                first_name: 'John',
                last_name: 'Doe'
            });

            expect(result.fullName).toBe('John Doe');
        });

        it('should handle enum mapping transformation', () => {
            const STATUS_MAP = { '1': 'active', '2': 'inactive', '3': 'pending' };

            const mapping = [
                {
                    source: 'status_code',
                    target: 'status',
                    type: 'string',
                    enum: ['active', 'inactive', 'pending'],
                    transform: (value) => STATUS_MAP[value],
                    required: true
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({ status_code: '1' });

            expect(result.status).toBe('active');
        });
    });

    describe('Default values', () => {
        it('should apply default when source is missing', () => {
            const mapping = [
                {
                    source: 'optional_field',
                    target: 'optionalField',
                    type: 'string',
                    required: false,
                    default: 'default value'
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({});

            expect(result.optionalField).toBe('default value');
        });

        it('should apply default when source is null', () => {
            const mapping = [
                {
                    source: 'optional_field',
                    target: 'optionalField',
                    type: 'string',
                    required: false,
                    default: 'default value'
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({ optional_field: null });

            expect(result.optionalField).toBe('default value');
        });

        it('should not apply default when source is empty string', () => {
            const mapping = [
                {
                    source: 'optional_field',
                    target: 'optionalField',
                    type: 'string',
                    required: false,
                    default: 'default value'
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({ optional_field: '' });

            expect(result.optionalField).toBe('');
        });

        it('should not apply default when source is zero', () => {
            const mapping = [
                {
                    source: 'optional_field',
                    target: 'optionalField',
                    type: 'number',
                    required: false,
                    default: 100
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({ optional_field: 0 });

            expect(result.optionalField).toBe(0);
        });

        it('should not apply default when source is false', () => {
            const mapping = [
                {
                    source: 'optional_field',
                    target: 'optionalField',
                    type: 'boolean',
                    required: false,
                    default: true
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({ optional_field: false });

            expect(result.optionalField).toBe(false);
        });
    });

    describe('Validation errors', () => {
        it('should throw on required field missing', () => {
            const mapping = [
                { source: 'name', target: 'name', type: 'string', required: true }
            ];

            adaptor = new DataAdaptor(mapping);

            expect(() => adaptor.transform({}))
                .toThrow(/required/i);
        });

        it('should throw on type mismatch', () => {
            const mapping = [
                { source: 'age', target: 'age', type: 'number', required: true }
            ];

            adaptor = new DataAdaptor(mapping);

            expect(() => adaptor.transform({ age: 'not a number' }))
                .toThrow(/Expected type number/);
        });

        it('should throw on constraint violation', () => {
            const mapping = [
                { source: 'email', target: 'email', type: 'string', format: 'email', required: true }
            ];

            adaptor = new DataAdaptor(mapping);

            expect(() => adaptor.transform({ email: 'invalid-email' }))
                .toThrow(/email format/);
        });

        it('should include field name in error message', () => {
            const mapping = [
                { source: 'age', target: 'userAge', type: 'number', required: true }
            ];

            adaptor = new DataAdaptor(mapping);

            expect(() => adaptor.transform({ age: 'invalid' }))
                .toThrow(/userAge/);
        });

        it('should throw on transformation function error', () => {
            const mapping = [
                {
                    source: 'value',
                    target: 'result',
                    type: 'string',
                    transform: () => { throw new Error('Transform failed'); },
                    required: true
                }
            ];

            adaptor = new DataAdaptor(mapping);

            expect(() => adaptor.transform({ value: 'test' }))
                .toThrow(/Transform failed/);
        });
    });

    describe('Complex real-world scenarios', () => {
        it('should handle ServiceNow to REST API transformation', () => {
            const mapping = [
                {
                    source: 'sys_id',
                    target: 'id',
                    type: 'string',
                    format: 'uuid',
                    required: true
                },
                {
                    source: 'sys_created_on',
                    target: 'createdAt',
                    type: 'string',
                    format: 'date-time',
                    transform: (glideDate) => new Date(glideDate).toISOString(),
                    required: true
                },
                {
                    source: 'state',
                    target: 'status',
                    type: 'string',
                    enum: ['draft', 'submitted', 'approved', 'rejected'],
                    transform: (state) => {
                        const map = { '1': 'draft', '2': 'submitted', '3': 'approved', '4': 'rejected' };
                        return map[state] || 'draft';
                    },
                    required: true
                },
                {
                    sources: ['first_name', 'last_name'],
                    target: 'requester.name',
                    type: 'string',
                    transform: (names) => names.filter(Boolean).join(' '),
                    required: true
                },
                {
                    source: 'email',
                    target: 'requester.email',
                    type: 'string',
                    format: 'email',
                    required: true
                },
                {
                    source: 'priority',
                    target: 'priority',
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                    required: true
                }
            ];

            adaptor = new DataAdaptor(mapping);
            const result = adaptor.transform({
                sys_id: '550e8400-e29b-41d4-a716-446655440000',
                sys_created_on: '2024-01-15 10:30:00',
                state: '2',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                priority: 3
            });

            expect(result).toEqual({
                id: '550e8400-e29b-41d4-a716-446655440000',
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
                status: 'submitted',
                requester: {
                    name: 'John Doe',
                    email: 'john.doe@example.com'
                },
                priority: 3
            });
        });
    });

    describe('Immutability', () => {
        it('should not mutate source object', () => {
            const mapping = [
                { source: 'name', target: 'userName', type: 'string', required: true }
            ];

            const source = { name: 'John', age: 30 };
            const original = JSON.parse(JSON.stringify(source));

            adaptor = new DataAdaptor(mapping);
            adaptor.transform(source);

            expect(source).toEqual(original);
        });

        it('should not mutate mapping config', () => {
            const mapping = [
                { source: 'name', target: 'userName', type: 'string', required: true }
            ];

            const original = JSON.parse(JSON.stringify(mapping));

            adaptor = new DataAdaptor(mapping);
            adaptor.transform({ name: 'John' });

            expect(mapping).toEqual(original);
        });
    });
});
