/**
 * Enrich component schemas with better descriptions and examples
 */

/**
 * Enrich component schemas
 * @param {object} spec - The OpenAPI specification
 * @param {object} options - Configuration options
 * @param {object} options.schemas - Schema enrichment configurations
 * @param {object} stats - Statistics object to update
 */
function enrichComponents(spec, options, stats) {
  const { schemas } = options;

  // Ensure components.schemas exists
  if (!spec.components || !spec.components.schemas) {
    console.warn('⚠️  No component schemas found');
    return;
  }

  Object.entries(schemas).forEach(([schemaName, enrichment]) => {
    const schema = spec.components.schemas[schemaName];

    if (!schema) {
      console.warn(`⚠️  Component schema not found: ${schemaName}`);
      return;
    }

    // Add top-level description
    if (enrichment.description && !schema.description) {
      schema.description = enrichment.description;
      stats.componentDescriptionsAdded++;
    }

    // Add example
    if (enrichment.example && !schema.example) {
      schema.example = enrichment.example;
      stats.componentExamplesAdded++;
    }

    // Add property-level descriptions
    if (enrichment.propertyDescriptions && schema.properties) {
      Object.entries(enrichment.propertyDescriptions).forEach(([propName, propDesc]) => {
        if (schema.properties[propName]) {
          // Only add if description doesn't exist or is generic
          const existingDesc = schema.properties[propName].description;
          const isGeneric = existingDesc && (
            existingDesc.includes('field') ||
            existingDesc.includes('represented by')
          );

          if (!existingDesc || isGeneric) {
            schema.properties[propName].description = propDesc;
            stats.propertyDescriptionsAdded++;
          }
        }
      });
    }
  });
}

module.exports = { enrichComponents };
