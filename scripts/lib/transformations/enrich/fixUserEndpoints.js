/**
 * Fix user endpoint response schemas
 * Replace inline schemas with proper $ref to component schemas
 */

/**
 * Fix response schemas for user endpoints
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {array} options.endpoints - Array of endpoint configurations
 * @param {object} stats - Statistics object to update
 */
function fixUserEndpoints(spec, options, stats) {
  const { endpoints } = options;

  endpoints.forEach(({ path, method, responseSchema }) => {
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

    // Check if responses exist
    if (!operation.responses || !operation.responses['200']) {
      console.warn(`⚠️  No 200 response found for ${method.toUpperCase()} ${path}`);
      return;
    }

    const response = operation.responses['200'];

    // Ensure content and application/json exist
    if (!response.content) response.content = {};
    if (!response.content['application/json']) {
      response.content['application/json'] = {};
    }

    // Replace the schema
    response.content['application/json'].schema = responseSchema;
    stats.userEndpointsFixed++;
  });
}

module.exports = { fixUserEndpoints };
