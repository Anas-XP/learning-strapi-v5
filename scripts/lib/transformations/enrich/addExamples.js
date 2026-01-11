/**
 * Add examples to endpoint responses
 */

/**
 * Add examples to endpoint responses
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {object} options.endpoints - Endpoint example configurations
 * @param {object} stats - Statistics object to update
 */
function addExamples(spec, options, stats) {
  const { endpoints } = options;

  Object.entries(endpoints).forEach(([path, config]) => {
    const { method, response } = config;

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
      return;
    }

    const responseObj = operation.responses['200'];

    // Ensure content and application/json exist
    if (!responseObj.content || !responseObj.content['application/json']) {
      return;
    }

    const mediaType = responseObj.content['application/json'];

    // Add example if it doesn't exist
    if (!mediaType.example) {
      mediaType.example = response;
      stats.examplesAdded++;
    }
  });
}

module.exports = { addExamples };
