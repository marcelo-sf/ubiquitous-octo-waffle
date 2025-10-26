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

    this._validateConfiguration(mappingConfig);

    this.mapping = mappingConfig.map((r, idx) => ({
      ...r,
      __index: idx,
    }));

    this.pathUtils = new PathUtils();
    this.extractor = new ValueExtractor(this.pathUtils);
    this.setter = new ValueSetter(this.pathUtils);
    this.validatorFactory = new ValidatorFactory();
  }

  _validateConfiguration(config) {
    for (let i = 0; i < config.length; i++) {
      const rule = config[i];

      // Enforce sources as object
      if (!rule.sources || typeof rule.sources !== 'object' || Array.isArray(rule.sources)) {
        throw new Error(
          `Rule at index ${i}: "sources" must be an object. ` +
          `Found: ${JSON.stringify(rule.sources)}`
        );
      }

      if (Object.keys(rule.sources).length === 0) {
        throw new Error(`Rule at index ${i}: "sources" cannot be empty`);
      }

      if (!rule.target || typeof rule.target !== 'string') {
        throw new Error(`Rule at index ${i}: "target" must be a non-empty string`);
      }

      if (!rule.type || typeof rule.type !== 'string') {
        throw new Error(`Rule at index ${i}: "type" must be a non-empty string`);
      }

      if (rule.transform && typeof rule.transform !== 'function') {
        throw new Error(
          `Rule at index ${i}: "transform" must be a function with ` +
          `signature (input, { source }) => value`
        );
      }
    }
  }

  /**
   * Extract one or many inputs according to rule.source or rule.sources.
   * - If rule.sources is an array: returns array of extracted values (in order).
   * - If rule.sources is an object: returns object {key: value}.
   * - If only rule.source (string): returns single value.
   */
  _buildTransformInput(sourceObj, rule) {
    if (!rule.sources || typeof rule.sources !== 'object' || Array.isArray(rule.sources)) {
      throw new Error(
        `Rule at target "${rule.target}": "sources" must be an object. ` +
        `Example: { sources: { fieldName: 'path.to.source' } }`
      );
    }

    const input = {};
    for (const [key, path] of Object.entries(rule.sources)) {
      input[key] = this.extractor.extract(sourceObj, path);
    }
    return input;
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

        // Apply transform or direct mapping
        let value;
        if (typeof rule.transform === 'function') {
          value = rule.transform(input, { source: sourceObj }); // LOCKED CONTRACT
        } else {
          // Direct mapping only for single source
          const keys = Object.keys(input);
          if (keys.length > 1) {
            throw new Error(`Direct mapping requires exactly one source field`);
          }
          value = input[keys[0]];
        }

        // Required check (AFTER getting the value)
        if (rule.required && (value === undefined || value === null)) {
          throw new Error(`Field "${rule.target || '<unknown>'}" is required`);
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
