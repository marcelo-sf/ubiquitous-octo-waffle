// This file is part of MapperExp.
//
// MapperExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// MapperExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with MapperExp. If not, see <https://www.gnu.org/licenses/>.

const PathUtils = require('./path-utils.js');

class ValueExtractor {
  constructor(pathUtils) {
    this.pathUtils = pathUtils || new PathUtils();
  }

  extract(source, path) {
    if (!path || path === '$') return source;
    const segments = this.pathUtils.parsePath(path);
    let cur = source;
    for (let i = 0; i < segments.length; i++) {
      if (cur === null || cur === undefined) return undefined;
      const key = segments[i];
      cur = cur[key];
    }
    return cur;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValueExtractor;
}
