/**
 * OpenAPI specification validation utilities
 */

/**
 * Validate that the spec conforms to OpenAPI 3.x.x
 * @param {object} spec - The OpenAPI specification object
 * @throws {Error} If validation fails
 * @returns {boolean} True if valid
 */
function validateOpenAPI(spec) {
  if (!spec || typeof spec !== 'object') {
    throw new Error('Invalid spec: must be an object');
  }

  // Check OpenAPI version
  if (!spec.openapi) {
    throw new Error('Invalid spec: missing "openapi" version field');
  }

  if (!spec.openapi.startsWith('3.')) {
    console.warn(`⚠️  Expected OpenAPI 3.x.x, found ${spec.openapi}`);
  }

  // Check required top-level fields
  if (!spec.info) {
    throw new Error('Invalid spec: missing "info" object');
  }

  if (!spec.paths) {
    throw new Error('Invalid spec: missing "paths" object');
  }

  // Validate info object
  if (!spec.info.title) {
    throw new Error('Invalid spec: info.title is required');
  }

  if (!spec.info.version) {
    throw new Error('Invalid spec: info.version is required');
  }

  return true;
}

/**
 * Validate a schema object
 * @param {object} schema - The schema to validate
 * @returns {boolean} True if valid
 */
function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') return false;

  // Must have either type, $ref, or allOf/anyOf/oneOf
  const hasType = 'type' in schema;
  const hasRef = '$ref' in schema;
  const hasComposition = 'allOf' in schema || 'anyOf' in schema || 'oneOf' in schema;

  return hasType || hasRef || hasComposition;
}

module.exports = {
  validateOpenAPI,
  validateSchema
};
