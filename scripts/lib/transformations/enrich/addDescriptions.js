/**
 * Add descriptions to endpoints
 * Improves API documentation readability
 */

/**
 * Add descriptions to specified endpoints
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {array} options.rules - Array of description rules
 * @param {object} stats - Statistics object to update
 */
function addDescriptions(spec, options, stats) {
  const { rules } = options;

  rules.forEach(({ path, method, description, summary }) => {
    // Check if the path exists
    if (!spec.paths || !spec.paths[path]) {
      console.warn(`⚠️  Path not found: ${path}`);
      return;
    }

    const endpoint = spec.paths[path];

    // Check if the method exists
    if (!endpoint[method]) {
      console.warn(`⚠️  Method ${method.toUpperCase()} not found for path: ${path}`);
      return;
    }

    const operation = endpoint[method];

    // Add description if provided and doesn't exist
    if (description && !operation.description) {
      operation.description = description;
      stats.descriptionsAdded++;
    }

    // Add summary if provided and doesn't exist
    if (summary && !operation.summary) {
      operation.summary = summary;
      stats.descriptionsAdded++;
    }
  });
}

module.exports = { addDescriptions };
