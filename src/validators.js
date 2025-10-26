// This file is part of AdaptorExp.
//
// AdaptorExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// AdaptorExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with AdaptorExp. If not, see <https://www.gnu.org/licenses/>.

const StringValidator = require('./string-validator.js');

class BooleanValidator {
  validate(value, _rule) {
    if (typeof value !== 'boolean') {
      const t = this._typeOf(value);
      throw new Error(`Expected type boolean but got ${t}`);
    }
  }
  _typeOf(v){ if(v===null) return 'null'; if(Array.isArray(v)) return 'array'; return typeof v; }
}

class ArrayValidator {
  constructor(validatorFactory){ this.factory = validatorFactory || new ValidatorFactory(); }
  validate(value, rule = {}) {
    if (!Array.isArray(value)) {
      const t = this._typeOf(value);
      throw new Error(`Expected type array but got ${t}`);
    }
    if (rule.minItems !== undefined && value.length < rule.minItems) {
      throw new Error(`Array length ${value.length} is less than minimum ${rule.minItems}`);
    }
    if (rule.maxItems !== undefined && value.length > rule.maxItems) {
      throw new Error(`Array length ${value.length} exceeds maximum ${rule.maxItems}`);
    }
    if (rule.uniqueItems) {
      const set = new Set(value.map(v => JSON.stringify(v)));
      if (set.size !== value.length) {
        throw new Error('Array items are not unique');
      }
    }
    if (rule.items) {
      const itemRule = rule.items;
      for (const item of value) {
        if (itemRule.type) {
          const v = this.factory.getValidator(itemRule.type);
          v.validate(item, itemRule);
        }
      }
    }
  }
  _typeOf(v){ if(v===null) return 'null'; if(Array.isArray(v)) return 'array'; return typeof v; }
}

class ObjectValidator {
  validate(value, rule = {}) {
    const t = this._typeOf(value);
    if (t !== 'object') {
      throw new Error(`Expected type object but got ${t}`);
    }
    if (Array.isArray(rule.required)) {
      for (const prop of rule.required) {
        if (!Object.prototype.hasOwnProperty.call(value, prop)) {
          throw new Error(`Missing required property: ${prop}`);
        }
      }
    }
  }
  _typeOf(v){ if(v===null) return 'null'; if(Array.isArray(v)) return 'array'; return typeof v; }
}

class NullValidator {
  validate(value, _rule) {
    if (value !== null) {
      const t = this._typeOf(value);
      throw new Error(`Expected type null but got ${t}`);
    }
  }
  _typeOf(v){ if(v===null) return 'null'; if(Array.isArray(v)) return 'array'; return typeof v; }
}

class NumberValidator {
  validate(value, rule = {}) {
    const expected = rule.type || 'number';

    if (Number.isNaN(value)) {
      throw new Error('Number cannot be NaN');
    }
    if (value === Infinity || value === -Infinity) {
      throw new Error('Number cannot be Infinity');
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      const t = this._typeOf(value);
      throw new Error(`Expected type ${expected} but got ${t}`);
    }

    if (expected === 'integer' && !Number.isInteger(value)) {
      throw new Error(`Expected type integer but got float`);
    }

    if (rule.multipleOf !== undefined) {
      const m = rule.multipleOf;
      if (typeof m !== 'number' || m === 0) {
        throw new Error('multipleOf must be a non-zero number');
      }
      const ratio = value / m;
      if (Math.abs(ratio - Math.round(ratio)) > 1e-12) {
        throw new Error(`Number ${value} is not a multiple of ${m}`);
      }
    }

    if (rule.minimum !== undefined) {
      if (value < rule.minimum) {
        throw new Error(`Number ${value} is less than minimum ${rule.minimum}`);
      }
    }

    if (rule.maximum !== undefined) {
      if (rule.maximum < 0) {
        if (Math.abs(value) > Math.abs(rule.maximum)) {
          throw new Error(`Number ${value} is greater than maximum ${rule.maximum}`);
        }
      } else {
        if (value > rule.maximum) {
          throw new Error(`Number ${value} is greater than maximum ${rule.maximum}`);
        }
      }
    }

    if (rule.exclusiveMinimum !== undefined) {
      const min = rule.exclusiveMinimum;
      if (typeof min === 'number') {
        if (!(value > min)) {
          throw new Error(`Number ${value} is not greater than exclusive minimum ${min}`);
        }
      }
    }

    if (rule.exclusiveMaximum !== undefined) {
      const max = rule.exclusiveMaximum;
      if (typeof max === 'number') {
        if (!(value < max)) {
          throw new Error(`Number ${value} is not less than exclusive maximum ${max}`);
        }
      }
    }

    if (Array.isArray(rule.enum)) {
      const ok = rule.enum.some(v => v === value);
      if (!ok) {
        throw new Error(`Value ${value} is not in enum [${rule.enum.join(', ')}]`);
      }
    }

    if (expected === 'integer' && rule.format) {
      if (rule.format === 'int32') {
        if (value < -2147483648 || value > 2147483647) {
          throw new Error('Integer out of int32 range');
        }
      } else if (rule.format === 'int64') {
        if (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER) {
          throw new Error('Integer outside JS safe range for int64');
        }
      }
    }
  }
  _typeOf(v){ if(v===null) return 'null'; if(Array.isArray(v)) return 'array'; return typeof v; }
}

class ValidatorFactory {
  constructor() {
    this.validators = {};
    this.validatorClasses = {
      'string': StringValidator,
      'number': NumberValidator,
      'integer': NumberValidator,
      'boolean': BooleanValidator,
      'array': ArrayValidator,
      'object': ObjectValidator,
      'null': NullValidator
    };
  }
  getValidator(type) {
    if (this.validators[type]) return this.validators[type];
    const Cls = this.validatorClasses[type];
    if (!Cls) throw new Error(`Unknown type: ${type}`);
    this.validators[type] = (type === 'array') ? new Cls(this) : new Cls();
    return this.validators[type];
  }
  registerValidator(type, Cls) { this.validatorClasses[type] = Cls; delete this.validators[type]; }
  unregisterValidator(type) { delete this.validatorClasses[type]; delete this.validators[type]; }
}

module.exports = {
  NumberValidator,
  BooleanValidator,
  ArrayValidator,
  ObjectValidator,
  NullValidator,
  ValidatorFactory
};
