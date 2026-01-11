/**
 * Add format hints to string properties
 * Improves client code generation and validation
 */

const { traverseObject } = require('../../utils/traversal');

/**
 * Add format hints to properties based on rules
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {array} options.rules - Array of rule objects with condition and format
 * @param {object} stats - Statistics object to update
 */
function addFormats(spec, options, stats) {
  const { rules } = options;

  traverseObject(spec, (obj, path) => {
    // Only process objects that look like schema properties
    if (typeof obj !== 'object' || !obj || Array.isArray(obj)) return;

    // Iterate through properties of this object
    Object.entries(obj).forEach(([key, property]) => {
      // Only process string properties
      if (typeof property === 'object' && property.type === 'string') {
        // Try each rule
        for (const rule of rules) {
          // Skip if format already exists (idempotent)
          if (property.format) break;

          // Check if rule condition matches
          if (rule.condition(property, key, path)) {
            property.format = rule.format;
            stats.formatsAdded++;
            break; // Apply first matching rule only
          }
        }
      }
    });
  });
}

module.exports = { addFormats };
