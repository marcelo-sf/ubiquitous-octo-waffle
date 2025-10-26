// This file is part of AdaptorExp.
//
// AdaptorExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// AdaptorExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with AdaptorExp. If not, see <https://www.gnu.org/licenses/>.

const PathUtils = require('../../src/path-utils.js');

/**
 * PathUtils Test Suite
 * Tests for path parsing and validation utilities
 * ECMAScript 2021 - ServiceNow Compatible
 */

describe('PathUtils', () => {
  let pathUtils;

  beforeEach(() => {
    pathUtils = new PathUtils();
  });

  describe('parsePath', () => {
    it('should parse simple property path', () => {
      const result = pathUtils.parsePath('name');
      expect(result).toEqual(['name']);
    });

    it('should parse nested path with dots', () => {
      const result = pathUtils.parsePath('user.profile.email');
      expect(result).toEqual(['user', 'profile', 'email']);
    });

    it('should parse path with array index', () => {
      const result = pathUtils.parsePath('items.0.name');
      expect(result).toEqual(['items', '0', 'name']);
    });

    it('should handle single character property names', () => {
      const result = pathUtils.parsePath('a.b.c');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle properties with numbers', () => {
      const result = pathUtils.parsePath('user1.address2');
      expect(result).toEqual(['user1', 'address2']);
    });

    it('should handle properties with underscores', () => {
      const result = pathUtils.parsePath('first_name.last_name');
      expect(result).toEqual(['first_name', 'last_name']);
    });

    it('should handle properties with hyphens', () => {
      const result = pathUtils.parsePath('user-id.profile-data');
      expect(result).toEqual(['user-id', 'profile-data']);
    });
  });

  describe('parsePath - Edge Cases', () => {
    it('should throw on null path', () => {
      expect(() => pathUtils.parsePath(null))
        .toThrow('Path cannot be null or undefined');
    });

    it('should throw on undefined path', () => {
      expect(() => pathUtils.parsePath(undefined))
        .toThrow('Path cannot be null or undefined');
    });

    it('should throw on empty string path', () => {
      expect(() => pathUtils.parsePath(''))
        .toThrow('Path cannot be empty');
    });

    it('should throw on non-string path', () => {
      expect(() => pathUtils.parsePath(123))
        .toThrow('Path must be a string');
    });

    it('should throw on path with only dots', () => {
      expect(() => pathUtils.parsePath('...'))
        .toThrow('Invalid path format');
    });

    it('should throw on path starting with dot', () => {
      expect(() => pathUtils.parsePath('.name'))
        .toThrow('Path cannot start or end with a dot');
    });

    it('should throw on path ending with dot', () => {
      expect(() => pathUtils.parsePath('name.'))
        .toThrow('Path cannot start or end with a dot');
    });

    it('should throw on path with consecutive dots', () => {
      expect(() => pathUtils.parsePath('user..name'))
        .toThrow('Path cannot contain consecutive dots');
    });
  });
});
