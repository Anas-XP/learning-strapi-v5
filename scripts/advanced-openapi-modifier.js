#!/usr/bin/env node

/**
 * Advanced OpenAPI Modifier
 * Post-processes Strapi v5 generated OpenAPI specifications
 *
 * Usage:
 *   node scripts/advanced-openapi-modifier.js
 *   npm run generate-specs
 */

const { AdvancedOpenAPIModifier } = require('./lib');
const path = require('path');
const fs = require('fs');

async function main() {
  try {
    // Load configuration
    const configPath = path.resolve(__dirname, '../openapi-modifier.config.js');

    if (!fs.existsSync(configPath)) {
      console.error('❌ Configuration file not found: openapi-modifier.config.js');
      console.error('   Please create a configuration file in the project root.');
      process.exit(1);
    }

    const config = require(configPath);

    // Create and run modifier
    const modifier = new AdvancedOpenAPIModifier(config);
    await modifier.modify();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ OpenAPI modification failed:');
    console.error(error.message);

    if (process.env.DEBUG) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
