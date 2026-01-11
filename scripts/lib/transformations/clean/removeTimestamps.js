/**
 * Remove dynamic timestamp defaults from OpenAPI spec
 * This prevents git diff noise caused by regenerating the spec
 */

const { traverseObject } = require('../../utils/traversal');

/**
 * Remove timestamp default values that match a pattern
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {array} options.fields - Field names to check (e.g., ['publishedAt', 'createdAt'])
 * @param {RegExp} options.pattern - Pattern to match (e.g., ISO 8601 timestamp)
 * @param {object} stats - Statistics object to update
 */
function removeTimestamps(spec, options, stats) {
  const { fields, pattern } = options;

  traverseObject(spec, (obj) => {
    // Check each key in the current object
    Object.keys(obj).forEach(key => {
      // Check if this is one of our target fields
      if (fields.includes(key) && obj[key] && typeof obj[key] === 'object') {
        const field = obj[key];

        // Check if it has a default value
        if (field.default !== undefined) {
          const defaultValue = field.default;

          // Only remove if it matches our timestamp pattern (idempotent)
          if (typeof defaultValue === 'string' && pattern.test(defaultValue)) {
            delete field.default;
            stats.timestampsRemoved++;
          }
        }
      }
    });
  });
}

module.exports = { removeTimestamps };
