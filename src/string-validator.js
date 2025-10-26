// This file is part of AdaptorExp.
//
// AdaptorExp is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// AdaptorExp is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with AdaptorExp. If not, see <https://www.gnu.org/licenses/>.

/**
 * StringValidator - Validates string values against OpenAPI 3.0 string schema
 *
 * Responsibilities (Single Responsibility Principle):
 * - Validate string type
 * - Validate string constraints (length, pattern, enum)
 * - Validate OpenAPI string formats (date, date-time, email, uri, uuid, etc.)
 *
 * @class StringValidator
 */
class StringValidator {
    constructor() {
        // Format validators map
        this.formatValidators = {
            'date': this._validateDateFormat.bind(this),
            'date-time': this._validateDateTimeFormat.bind(this),
            'email': this._validateEmailFormat.bind(this),
            'uuid': this._validateUuidFormat.bind(this),
            'uri': this._validateUriFormat.bind(this),
            'hostname': this._validateHostnameFormat.bind(this),
            'ipv4': this._validateIpv4Format.bind(this),
            'ipv6': this._validateIpv6Format.bind(this)
        };
    }

    /**
     * Validate a value against string schema rules
     *
     * @param {*} value - Value to validate
     * @param {Object} rule - Validation rule with OpenAPI schema properties
     * @throws {Error} If validation fails
     */
    validate(value, rule) {
        // Type validation
        this._validateType(value);

        // Enum validation (if specified)
        if (rule.enum) {
            this._validateEnum(value, rule.enum);
        }

        // Length validation (if specified)
        if (rule.minLength !== undefined) {
            this._validateMinLength(value, rule.minLength);
        }

        if (rule.maxLength !== undefined) {
            this._validateMaxLength(value, rule.maxLength);
        }

        // Pattern validation (if specified)
        if (rule.pattern) {
            this._validatePattern(value, rule.pattern);
        }

        // Format validation (if specified)
        if (rule.format) {
            this._validateFormat(value, rule.format);
        }
    }

    /**
     * Validate value is a string
     *
     * @private
     */
    _validateType(value) {
        const actualType = this._getType(value);
        if (actualType !== 'string') {
            throw new Error(`Expected type string but got ${actualType}`);
        }
    }

    /**
     * Get type name for error messages
     *
     * @private
     */
    _getType(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    /**
     * Validate string is in allowed enum values
     *
     * @private
     */
    _validateEnum(value, enumValues) {
        if (!enumValues.includes(value)) {
            throw new Error(
                `Value "${value}" is not in enum [${enumValues.join(', ')}]`
            );
        }
    }

    /**
     * Validate minimum length
     *
     * @private
     */
    _validateMinLength(value, minLength) {
        if (value.length < minLength) {
            throw new Error(
                `String length ${value.length} is less than minimum length ${minLength}`
            );
        }
    }

    /**
     * Validate maximum length
     *
     * @private
     */
    _validateMaxLength(value, maxLength) {
        if (value.length > maxLength) {
            throw new Error(
                `String length ${value.length} is greater than maximum length ${maxLength}`
            );
        }
    }

    /**
     * Validate string matches regex pattern
     *
     * @private
     */
    _validatePattern(value, pattern) {
        try {
            const regex = new RegExp(pattern);
            if (!regex.test(value)) {
                throw new Error(`String does not match pattern ${pattern}`);
            }
        } catch (error) {
            if (error.message.includes('does not match pattern')) {
                throw error;
            }
            throw new Error('Invalid regex pattern');
        }
    }

    /**
     * Validate string format
     *
     * @private
     */
    _validateFormat(value, format) {
        const validator = this.formatValidators[format];

        // If format not recognized, skip validation (OpenAPI allows custom formats)
        if (!validator) {
            return;
        }

        validator(value);
    }

    /**
     * Validate date format (YYYY-MM-DD)
     *
     * @private
     */
    _validateDateFormat(value) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(value)) {
            throw new Error('String does not match date format (YYYY-MM-DD)');
        }

        // Validate it's a real date
        const date = new Date(value + 'T00:00:00Z');
        if (isNaN(date.getTime())) {
            throw new Error('String does not match date format (YYYY-MM-DD)');
        }

        // Validate the date string matches the parsed date (catches invalid dates like 2024-02-30)
        const [year, month, day] = value.split('-').map(Number);
        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            throw new Error('String does not match date format (YYYY-MM-DD)');
        }
    }

    /**
     * Validate date-time format (ISO 8601)
     *
     * @private
     */
    _validateDateTimeFormat(value) {
        // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ or with timezone offset
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

        if (!iso8601Regex.test(value)) {
            throw new Error('String does not match date-time format (ISO 8601)');
        }

        // Validate it's a real date
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('String does not match date-time format (ISO 8601)');
        }
    }

    /**
     * Validate email format
     *
     * @private
     */
    _validateEmailFormat(value) {
        // Basic email validation (simplified RFC 5322)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        if (!emailRegex.test(value)) {
            throw new Error('String does not match email format');
        }
    }

    /**
     * Validate UUID format
     *
     * @private
     */
    _validateUuidFormat(value) {
        // UUID format: 8-4-4-4-12 hex digits
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(value)) {
            throw new Error('String does not match uuid format');
        }
    }

    /**
     * Validate URI format
     *
     * @private
     */
    _validateUriFormat(value) {
        // Basic URI validation (RFC 3986)
        const uriRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

        if (!uriRegex.test(value)) {
            throw new Error('String does not match uri format');
        }

        // Additional validation: try to construct URL (for http/https)
        if (value.startsWith('http://') || value.startsWith('https://')) {
            try {
                new URL(value);
            } catch (error) {
                throw new Error('String does not match uri format');
            }
        }
    }

    /**
     * Validate hostname format
     *
     * @private
     */
    _validateHostnameFormat(value) {
        // Hostname validation (RFC 1123)
        const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

        if (!hostnameRegex.test(value)) {
            throw new Error('String does not match hostname format');
        }
    }

    /**
     * Validate IPv4 address format
     *
     * @private
     */
    _validateIpv4Format(value) {
        const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = value.match(ipv4Regex);

        if (!match) {
            throw new Error('String does not match ipv4 format');
        }

        // Validate each octet is 0-255
        for (let i = 1; i <= 4; i++) {
            const octet = parseInt(match[i], 10);
            if (octet > 255) {
                throw new Error('String does not match ipv4 format');
            }
        }
    }

    /**
     * Validate IPv6 address format
     *
     * @private
     */
    _validateIpv6Format(value) {
        // IPv6 validation (simplified - covers most common cases)
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

        if (!ipv6Regex.test(value)) {
            throw new Error('String does not match ipv6 format');
        }
    }
}

// Export for CommonJS (ServiceNow)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StringValidator;
}
