// This file is part of MapperExp.
//
// MapperExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// MapperExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with MapperExp. If not, see <https://www.gnu.org/licenses/>.

/**
 * PathUtils - utility to parse dot-separated paths with array indices.
 */
class PathUtils {
  /**
   * Parse a dot path like "user.name", "items.0.value"
   * Returns an array of segments as strings.
   */
  parsePath(path) {
    if (path === null || path === undefined) {
      throw new Error('Path cannot be null or undefined');
    }
    if (typeof path !== 'string') {
      throw new Error('Path must be a string');
    }
    if (path.length === 0) {
      throw new Error('Path cannot be empty');
    }
    // Only dots is invalid
    if (/^\.+$/.test(path)) {
      throw new Error('Invalid path format');
    }
    // Can't start or end with dot
    if (path.startsWith('.') || path.endsWith('.')) {
      throw new Error('Path cannot start or end with a dot');
    }
    // No consecutive dots
    if (path.includes('..')) {
      throw new Error('Path cannot contain consecutive dots');
    }

    // Split by dot; keep array indices as strings
    return path.split('.');
  }

  isValidPath(path) {
    try {
      this.parsePath(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PathUtils;
}
