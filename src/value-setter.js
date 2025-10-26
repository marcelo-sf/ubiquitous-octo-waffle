// This file is part of AdaptorExp.
//
// AdaptorExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// AdaptorExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with AdaptorExp. If not, see <https://www.gnu.org/licenses/>.

/**
 * ValueSetter - Set values into target objects using dot paths, creating objects as needed
 */
class ValueSetter {
  constructor(pathUtils) {
    this.pathUtils = pathUtils;
  }

  /**
   * Set value at path within target, creating intermediate objects as necessary.
   * @param {Object} target
   * @param {string} path
   * @param {*} value
   * @returns {Object} target (and enables chaining by attaching bound set)
   */
  set(target, path, value) {
    if (target === null || target === undefined) {
      throw new Error('Target object cannot be null or undefined');
    }
    if (typeof target !== 'object' || Array.isArray(target)) {
      throw new Error('Target must be an object');
    }
    if (typeof path !== 'string' || !path.trim() || path === '$' || path === '.') {
      throw new Error('Path must be a non-empty string for setting values');
    }

    const segments = this.pathUtils.parsePath(path);
    let cur = target;
    const traversed = [];

    for (let i = 0; i < segments.length; i++) {
      const key = segments[i];
      const last = i === segments.length - 1;

      if (!last) {
        const nextKey = segments[i + 1];

        if (cur[key] !== undefined && (cur[key] === null || typeof cur[key] !== 'object')) {
          const atPath = [...traversed, key].join('.') || key;
          throw new Error(`Cannot set property "${nextKey}" on non-object value at path "${atPath}"`);
        }


        if (cur[key] === undefined) {
          const nextIsIndex = /^[0-9]+$/.test(String(nextKey));
          if (key === 'items') {
            if (!nextIsIndex) {
              throw new Error(`Cannot set non-numeric property "${nextKey}" on non-existent array`);
            }
            cur[key] = [];
          } else {
            cur[key] = {};
          }
        }


        cur = cur[key];
        traversed.push(key);
      } else {
        cur[key] = value;
      }
    }

    if (typeof target.set !== 'function') {
      Object.defineProperty(target, 'set', {
        value: this.set.bind(this),
        enumerable: false,
      });
    }
    return target;
  }
}

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValueSetter;
}
