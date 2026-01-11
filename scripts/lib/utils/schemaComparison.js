/**
 * Schema comparison utilities for deduplication
 */

/**
 * Generate a normalized signature for a schema
 * Used for quick lookup and comparison
 * @param {object} schema - OpenAPI schema object
 * @returns {string} Normalized signature
 */
function getSchemaSignature(schema) {
  if (!schema || typeof schema !== 'object') return '';

  const props = Object.keys(schema.properties || {}).sort();
  const required = (schema.required || []).sort();

  return JSON.stringify({ props, required });
}

/**
 * Calculate Jaccard similarity between two schemas
 * Returns a score from 0.0 (no match) to 1.0 (perfect match)
 * @param {object} schema1 - First schema
 * @param {object} schema2 - Second schema
 * @returns {number} Similarity score (0.0 to 1.0)
 */
function calculateSchemaMatch(schema1, schema2) {
  // Extract property names from both schemas
  const props1 = new Set(Object.keys(schema1.properties || {}));
  const props2 = new Set(Object.keys(schema2.properties || {}));

  // Calculate intersection (properties in both schemas)
  const intersection = new Set([...props1].filter(x => props2.has(x)));

  // Calculate union (all unique properties)
  const union = new Set([...props1, ...props2]);

  // Jaccard similarity: |intersection| / |union|
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Check if a schema matches the component schema structure
 * @param {object} schema - Schema to check
 * @param {object} componentSchema - Component schema to match against
 * @param {number} threshold - Minimum similarity threshold (default 0.8)
 * @returns {boolean} True if schemas match above threshold
 */
function isSchemaMatch(schema, componentSchema, threshold = 0.8) {
  if (!schema || !componentSchema) return false;
  if (!schema.properties || !componentSchema.properties) return false;

  const score = calculateSchemaMatch(schema, componentSchema);
  return score >= threshold;
}

/**
 * Find the best matching component schema for an inline schema
 * @param {object} inlineSchema - The inline schema to match
 * @param {object} componentSchemas - All component schemas
 * @param {number} threshold - Minimum match threshold
 * @returns {object|null} { name, score } or null if no match
 */
function findBestMatch(inlineSchema, componentSchemas, threshold = 0.8) {
  if (!inlineSchema || !inlineSchema.properties) return null;

  let bestMatch = null;
  let bestScore = 0;

  Object.entries(componentSchemas).forEach(([name, schema]) => {
    const score = calculateSchemaMatch(inlineSchema, schema);
    if (score >= threshold && score > bestScore) {
      bestMatch = { name, score };
      bestScore = score;
    }
  });

  return bestMatch;
}

module.exports = {
  getSchemaSignature,
  calculateSchemaMatch,
  isSchemaMatch,
  findBestMatch
};
