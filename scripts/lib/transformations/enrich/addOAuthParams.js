/**
 * Add OAuth query parameters to callback endpoints
 */

/**
 * Add OAuth parameters to specified endpoints
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {array} options.endpoints - Array of endpoint configurations
 * @param {object} stats - Statistics object to update
 */
function addOAuthParams(spec, options, stats) {
  const { endpoints } = options;

  endpoints.forEach(({ path, method, parameters }) => {
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

    // Initialize parameters array if it doesn't exist
    if (!operation.parameters) {
      operation.parameters = [];
    }

    // Add each parameter if it doesn't already exist
    parameters.forEach(newParam => {
      const exists = operation.parameters.some(
        param => param.name === newParam.name && param.in === newParam.in
      );

      if (!exists) {
        operation.parameters.push(newParam);
        stats.oauthParamsAdded++;
      }
    });
  });
}

module.exports = { addOAuthParams };
