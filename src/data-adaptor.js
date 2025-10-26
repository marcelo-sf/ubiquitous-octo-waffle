// This file is part of AdaptorExp.
//
// AdaptorExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// AdaptorExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with AdaptorExp. If not, see <https://www.gnu.org/licenses/>.

'use strict';

const PathUtils = require('./path-utils');
const ValueExtractor = require('./value-extractor');
const ValueSetter = require('./value-setter');
const { ValidatorFactory } = require('./validators');

class DataAdaptor {
  constructor(mappingConfig) {
    if (!Array.isArray(mappingConfig)) {
      throw new Error('Mapping config must be an array');
    }
    this.mapping = mappingConfig.map((r, idx) => ({
      ...r,
      __index: idx
    }));
    this.pathUtils = new PathUtils();
    this.extractor = new ValueExtractor(this.pathUtils);
    this.setter = new ValueSetter(this.pathUtils);
    this.validatorFactory = new ValidatorFactory();
  }

  /**
   * Extract one or many inputs according to rule.source or rule.sources.
   * - If rule.sources is an array: returns array of extracted values (in order).
   * - If rule.sources is an object: returns object {key: value}.
   * - If only rule.source (string): returns single value.
   */
  _buildTransformInput(sourceObj, rule) {
    if (Array.isArray(rule.sources)) {
      return rule.sources.map(sel => this.extractor.extract(sourceObj, sel));
    }
    if (rule.sources && typeof rule.sources === 'object') {
      const out = {};
      for (const [k, sel] of Object.entries(rule.sources)) {
        out[k] = this.extractor.extract(sourceObj, sel);
      }
      return out;
    }
    // legacy single selector
    if (typeof rule.source === 'string') {
      return this.extractor.extract(sourceObj, rule.source);
    }
    // nothing specified
    return undefined;
  }

  _applyDefaultIfNeeded(value, rule) {
    if ((value === undefined || value === null) && 'default' in rule) {
      return typeof rule.default === 'function' ? rule.default() : rule.default;
    }
    return value;
  }

  _validateIfNeeded(value, rule) {
    if (!rule.type) return;
    const validator = this.validatorFactory.getValidator(rule.type);
    validator.validate(value, rule);
  }

  transform(sourceObj) {
    const output = {};
    for (const rule of this.mapping) {
      try {
        // Build input for transform
        const input = this._buildTransformInput(sourceObj, rule);

        // Required check (pre-default for presence of selector result)
        if (rule.required && (input === undefined || input === null)) {
          throw new Error(`Field "${rule.target || '<unknown>'}" is required`);
        }

        // Apply transform
        let value;
        if (typeof rule.transform === 'function') {
          // Always call with (input, { source })
          value = rule.transform(input, { source: sourceObj });
        } else {
          value = input;
        }

        // Apply default if needed
        value = this._applyDefaultIfNeeded(value, rule);

        // Validate if specified
        this._validateIfNeeded(value, rule);

        // Finally set on output (skip undefined to avoid creating keys)
        if (value !== undefined) {
          this.setter.set(output, rule.target, value);
        }
      } catch (err) {
        const tgt = rule && rule.target ? rule.target : '<unknown>';
        throw new Error(`Transformation failed at field "${tgt}": ${err.message}`);
      }
    }
    return output;
  }
}

module.exports = DataAdaptor;
