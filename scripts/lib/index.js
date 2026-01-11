/**
 * Module exports for Advanced OpenAPI Modifier
 */

const { AdvancedOpenAPIModifier } = require('./AdvancedOpenAPIModifier');

// Utilities
const { traverseObject, getAtPath, setAtPath } = require('./utils/traversal');
const { calculateSchemaMatch, isSchemaMatch, findBestMatch } = require('./utils/schemaComparison');
const { validateOpenAPI, validateSchema } = require('./utils/validation');

// Clean transformations
const { removeTimestamps } = require('./transformations/clean/removeTimestamps');
const { deduplicateSchemas } = require('./transformations/clean/deduplicateSchemas');

// Enrich transformations
const { addOAuthParams } = require('./transformations/enrich/addOAuthParams');
const { addFormats } = require('./transformations/enrich/addFormats');
const { addDescriptions } = require('./transformations/enrich/addDescriptions');
const { fixUserEndpoints } = require('./transformations/enrich/fixUserEndpoints');
const { enrichComponents } = require('./transformations/enrich/enrichComponents');
const { addExamples } = require('./transformations/enrich/addExamples');

module.exports = {
  // Main class
  AdvancedOpenAPIModifier,

  // Utilities
  traverseObject,
  getAtPath,
  setAtPath,
  calculateSchemaMatch,
  isSchemaMatch,
  findBestMatch,
  validateOpenAPI,
  validateSchema,

  // Transformations
  removeTimestamps,
  deduplicateSchemas,
  addOAuthParams,
  addFormats,
  addDescriptions,
  fixUserEndpoints,
  enrichComponents,
  addExamples
};
