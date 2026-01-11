/**
 * Replace verbose inline schemas with $ref to component schemas
 * Reduces spec size and improves maintainability
 */

const { findBestMatch } = require('../../utils/schemaComparison');

/**
 * Deduplicate inline schemas by replacing them with $ref
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {number} options.matchThreshold - Minimum similarity score (0.0-1.0)
 * @param {array} options.targetSchemas - Component schema names to match against
 * @param {object} stats - Statistics object to update
 */
function deduplicateSchemas(spec, options, stats) {
  const { matchThreshold, targetSchemas } = options;

  if (!spec.components || !spec.components.schemas) {
    console.warn('⚠️  No component schemas found, skipping deduplication');
    return;
  }

  // Filter component schemas to only include targets
  const componentSchemas = {};
  targetSchemas.forEach(name => {
    if (spec.components.schemas[name]) {
      componentSchemas[name] = spec.components.schemas[name];
    }
  });

  if (Object.keys(componentSchemas).length === 0) {
    console.warn('⚠️  None of the target schemas found in components');
    return;
  }

  // Helper function to recursively replace inline schemas
  function replaceInlineSchemas(obj, path = []) {
    if (!obj || typeof obj !== 'object') return;

    // Check if this is a response schema (in paths)
    if (path.includes('paths') && path.includes('schema')) {
      // Check if this is an inline schema (has type and properties, no $ref)
      if (obj.type === 'object' && obj.properties && !obj.$ref) {
        // Try to find a matching component schema
        const match = findBestMatch(obj, componentSchemas, matchThreshold);

        if (match) {
          // Get parent object to replace the schema
          const parentPath = path.slice(0, -1);
          let parent = spec;
          for (const key of parentPath) {
            parent = parent[key];
          }

          // Replace with $ref
          const schemaKey = path[path.length - 1];
          parent[schemaKey] = {
            $ref: `#/components/schemas/${match.name}`
          };

          stats.schemasReplaced++;
          return; // Don't recurse into replaced schema
        }
      }

      // Handle array responses (data.items pattern)
      if (obj.type === 'array' && obj.items) {
        if (obj.items.type === 'object' && obj.items.properties && !obj.items.$ref) {
          const match = findBestMatch(obj.items, componentSchemas, matchThreshold);

          if (match) {
            obj.items = {
              $ref: `#/components/schemas/${match.name}`
            };
            stats.schemasReplaced++;
            return;
          }
        }
      }
    }

    // Recurse into nested objects
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        replaceInlineSchemas(item, [...path, index]);
      });
    } else {
      Object.keys(obj).forEach(key => {
        replaceInlineSchemas(obj[key], [...path, key]);
      });
    }
  }

  // Start deduplication from paths
  if (spec.paths) {
    replaceInlineSchemas(spec.paths, ['paths']);
  }
}

module.exports = { deduplicateSchemas };
