// This file is part of AdaptorExp.
//
// AdaptorExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// AdaptorExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with AdaptorExp. If not, see <https://www.gnu.org/licenses/>.

const ValueSetter = require('../../src/value-setter.js');
const PathUtils = require('../../src/path-utils.js');


/**
 * ValueSetter Test Suite
 * Tests for setting values in target objects using path notation
 * ECMAScript 2021 - ServiceNow Compatible
 */

describe('ValueSetter', () => {
    let setter;

    beforeEach(() => {
        setter = new ValueSetter(new PathUtils());
    });

    describe('Simple property setting', () => {
        it('should set root level string property', () => {
            const target = {};
            setter.set(target, 'name', 'John');
            expect(target.name).toBe('John');
        });

        it('should set root level number property', () => {
            const target = {};
            setter.set(target, 'age', 30);
            expect(target.age).toBe(30);
        });

        it('should set root level boolean property', () => {
            const target = {};
            setter.set(target, 'active', true);
            expect(target.active).toBe(true);
        });

        it('should set null value', () => {
            const target = {};
            setter.set(target, 'value', null);
            expect(target.value).toBeNull();
        });

        it('should set undefined value', () => {
            const target = {};
            setter.set(target, 'value', undefined);
            expect(target.value).toBeUndefined();
        });

        it('should overwrite existing property', () => {
            const target = { name: 'John' };
            setter.set(target, 'name', 'Jane');
            expect(target.name).toBe('Jane');
        });
    });

    describe('Nested property setting', () => {
        it('should create nested object one level deep', () => {
            const target = {};
            setter.set(target, 'user.name', 'John');
            expect(target).toEqual({ user: { name: 'John' } });
        });

        it('should create deeply nested objects', () => {
            const target = {};
            setter.set(target, 'user.profile.contact.email', 'test@example.com');
            expect(target).toEqual({
                user: {
                    profile: {
                        contact: {
                            email: 'test@example.com'
                        }
                    }
                }
            });
        });

        it('should add property to existing nested object', () => {
            const target = { user: { name: 'John' } };
            setter.set(target, 'user.age', 30);
            expect(target).toEqual({ user: { name: 'John', age: 30 } });
        });

        it('should create intermediate objects if missing', () => {
            const target = { user: {} };
            setter.set(target, 'user.profile.email', 'test@example.com');
            expect(target).toEqual({
                user: {
                    profile: {
                        email: 'test@example.com'
                    }
                }
            });
        });

        it('should handle setting multiple nested properties', () => {
            const target = {};
            setter.set(target, 'user.firstName', 'John');
            setter.set(target, 'user.lastName', 'Doe');
            setter.set(target, 'user.age', 30);
            expect(target).toEqual({
                user: {
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 30
                }
            });
        });
    });

    describe('Array handling', () => {
        it('should set value in existing array by index', () => {
            const target = { items: ['a', 'b', 'c'] };
            setter.set(target, 'items.1', 'x');
            expect(target.items).toEqual(['a', 'x', 'c']);
        });

        it('should set entire array', () => {
            const target = {};
            setter.set(target, 'items', ['a', 'b', 'c']);
            expect(target.items).toEqual(['a', 'b', 'c']);
        });

        it('should set property in array element object', () => {
            const target = { users: [{ name: 'John' }, { name: 'Jane' }] };
            setter.set(target, 'users.0.age', 30);
            expect(target.users[0]).toEqual({ name: 'John', age: 30 });
        });

        it('should throw when trying to create array with non-numeric index', () => {
            const target = {};
            expect(() => setter.set(target, 'items.abc', 'value'))
                .toThrow('Cannot set non-numeric property "abc" on non-existent array');
        });
    });

    describe('Type preservation', () => {
        it('should preserve string type', () => {
            const target = {};
            setter.set(target, 'value', 'text');
            expect(typeof target.value).toBe('string');
            expect(target.value).toBe('text');
        });

        it('should preserve number type including zero', () => {
            const target = {};
            setter.set(target, 'value', 0);
            expect(typeof target.value).toBe('number');
            expect(target.value).toBe(0);
        });

        it('should preserve boolean false', () => {
            const target = {};
            setter.set(target, 'value', false);
            expect(typeof target.value).toBe('boolean');
            expect(target.value).toBe(false);
        });

        it('should preserve empty string', () => {
            const target = {};
            setter.set(target, 'value', '');
            expect(typeof target.value).toBe('string');
            expect(target.value).toBe('');
        });

        it('should preserve null', () => {
            const target = {};
            setter.set(target, 'value', null);
            expect(target.value).toBeNull();
        });

        it('should preserve object references', () => {
            const obj = { nested: 'value' };
            const target = {};
            setter.set(target, 'value', obj);
            expect(target.value).toBe(obj);
        });

        it('should preserve array references', () => {
            const arr = [1, 2, 3];
            const target = {};
            setter.set(target, 'value', arr);
            expect(target.value).toBe(arr);
        });
    });

    describe('Edge cases', () => {
        it('should throw on null target', () => {
            expect(() => setter.set(null, 'field', 'value'))
                .toThrow('Target object cannot be null or undefined');
        });

        it('should throw on undefined target', () => {
            expect(() => setter.set(undefined, 'field', 'value'))
                .toThrow('Target object cannot be null or undefined');
        });

        it('should throw on non-object target', () => {
            expect(() => setter.set('string', 'field', 'value'))
                .toThrow('Target must be an object');
        });

        it('should throw on array target', () => {
            expect(() => setter.set([], 'field', 'value'))
                .toThrow('Target must be an object');
        });

        it('should handle properties with special characters', () => {
            const target = {};
            setter.set(target, 'user-name', 'John');
            expect(target['user-name']).toBe('John');
        });

        it('should handle properties with numbers', () => {
            const target = {};
            setter.set(target, 'field123', 'value');
            expect(target.field123).toBe('value');
        });

        it('should handle properties with underscores', () => {
            const target = {};
            setter.set(target, 'first_name', 'John');
            expect(target.first_name).toBe('John');
        });

        it('should throw when overwriting primitive with nested path', () => {
            const target = { user: 'John' };
            expect(() => setter.set(target, 'user.name', 'Jane'))
                .toThrow('Cannot set property "name" on non-object value at path "user"');
        });
    });

    describe('Return value', () => {
        it('should return the target object for chaining', () => {
            const target = {};
            const result = setter.set(target, 'name', 'John');
            expect(result).toBe(target);
        });

        it('should allow method chaining', () => {
            const target = {};
            setter.set(target, 'name', 'John')
                .set(target, 'age', 30)
                .set(target, 'active', true);
            expect(target).toEqual({ name: 'John', age: 30, active: true });
        });
    });

    describe('Complex scenarios', () => {
        it('should handle mixed nested objects and arrays', () => {
            const target = {};
            setter.set(target, 'users.0.profile.email', 'test@example.com');
            expect(target).toEqual({
                users: {
                    '0': {
                        profile: {
                            email: 'test@example.com'
                        }
                    }
                }
            });
        });

        it('should handle setting sibling properties', () => {
            const target = {};
            setter.set(target, 'user.address.street', '123 Main St');
            setter.set(target, 'user.address.city', 'NYC');
            setter.set(target, 'user.contact.phone', '555-1234');
            expect(target).toEqual({
                user: {
                    address: {
                        street: '123 Main St',
                        city: 'NYC'
                    },
                    contact: {
                        phone: '555-1234'
                    }
                }
            });
        });
    });
});
