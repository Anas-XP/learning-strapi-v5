/**
 * Advanced OpenAPI Modifier
 * Post-processes Strapi v5 generated OpenAPI specifications
 */

const fs = require('fs');
const path = require('path');

// Utilities
const { validateOpenAPI } = require('./utils/validation');

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

class AdvancedOpenAPIModifier {
  constructor(config = {}) {
    this.config = config;
    this.specPath = config.specPath || './specification.json';
    this.outputPath = config.outputPath || this.specPath;
    this.spec = null;

    // Initialize statistics
    this.stats = {
      timestampsRemoved: 0,
      schemasReplaced: 0,
      formatsAdded: 0,
      descriptionsAdded: 0,
      examplesAdded: 0,
      oauthParamsAdded: 0,
      userEndpointsFixed: 0,
      componentDescriptionsAdded: 0,
      componentExamplesAdded: 0,
      propertyDescriptionsAdded: 0
    };
  }

  /**
   * Main orchestrator method
   */
  async modify() {
    try {
      this.printHeader();
      this.loadSpec();
      this.validateSpec();
      this.createBackup();
      this.runTransformations();
      this.saveSpec();
      this.printStats();
    } catch (error) {
      console.error('\n❌ Error during modification:', error.message);
      throw error;
    }
  }

  /**
   * Print header
   */
  printHeader() {
    if (this.config.options?.verbose) {
      console.log('🔧 Advanced OpenAPI Modifier v1.0.0');
      console.log('━'.repeat(50));
    }
  }

  /**
   * Load the OpenAPI specification from file
   */
  loadSpec() {
    const resolvedPath = path.resolve(this.specPath);

    if (this.config.options?.verbose) {
      console.log(`📂 Loading: ${resolvedPath}`);
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Specification file not found: ${resolvedPath}`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');
    this.spec = JSON.parse(content);

    const fileSize = (content.length / 1024).toFixed(1);
    const lineCount = content.split('\n').length;

    if (this.config.options?.verbose) {
      console.log(`✅ Loaded OpenAPI ${this.spec.openapi} (${lineCount.toLocaleString()} lines, ${fileSize}KB)\n`);
    }
  }

  /**
   * Validate the OpenAPI specification
   */
  validateSpec() {
    if (this.config.options?.validateSchema !== false) {
      validateOpenAPI(this.spec);
    }
  }

  /**
   * Create backup of the original file
   */
  createBackup() {
    if (!this.config.options?.createBackup) return;

    const backupPath = `${this.specPath}${this.config.options.backupSuffix || '.backup'}`;
    fs.copyFileSync(this.specPath, backupPath);

    if (this.config.options?.verbose) {
      console.log(`📋 Created backup: ${backupPath}\n`);
    }
  }

  /**
   * Run all enabled transformations
   */
  runTransformations() {
    // CLEAN transformations
    if (this.config.transformations?.clean?.enabled) {
      if (this.config.options?.verbose) {
        console.log('🧹 Running CLEAN transformations...');
      }

      const cleanOpts = this.config.transformations.clean.options;

      if (cleanOpts.removeTimestampDefaults?.enabled) {
        removeTimestamps(this.spec, cleanOpts.removeTimestampDefaults, this.stats);
        if (this.config.options?.verbose) {
          console.log(`  ✓ Removed ${this.stats.timestampsRemoved} dynamic timestamp defaults`);
        }
      }

      if (cleanOpts.deduplicateSchemas?.enabled) {
        deduplicateSchemas(this.spec, cleanOpts.deduplicateSchemas, this.stats);
        if (this.config.options?.verbose) {
          console.log(`  ✓ Replaced ${this.stats.schemasReplaced} inline schemas with $ref`);
        }
      }

      if (this.config.options?.verbose) {
        console.log('');
      }
    }

    // ENRICH transformations
    if (this.config.transformations?.enrich?.enabled) {
      if (this.config.options?.verbose) {
        console.log('✨ Running ENRICH transformations...');
      }

      const enrichOpts = this.config.transformations.enrich.options;

      if (enrichOpts.fixUserEndpoints?.enabled) {
        fixUserEndpoints(this.spec, enrichOpts.fixUserEndpoints, this.stats);
        if (this.config.options?.verbose) {
          console.log(`  ✓ Fixed ${this.stats.userEndpointsFixed} user endpoint schemas`);
        }
      }

      if (enrichOpts.addOAuthParameters?.enabled) {
        addOAuthParams(this.spec, enrichOpts.addOAuthParameters, this.stats);
        if (this.config.options?.verbose) {
          console.log(`  ✓ Added ${this.stats.oauthParamsAdded} OAuth parameters`);
        }
      }

      if (enrichOpts.addFormatHints?.enabled) {
        addFormats(this.spec, enrichOpts.addFormatHints, this.stats);
        if (this.config.options?.verbose) {
          console.log(`  ✓ Added format hints to ${this.stats.formatsAdded} fields`);
        }
      }

      if (enrichOpts.addDescriptions?.enabled) {
        addDescriptions(this.spec, enrichOpts.addDescriptions, this.stats);
        if (this.config.options?.verbose) {
          console.log(`  ✓ Added ${this.stats.descriptionsAdded} endpoint descriptions`);
        }
      }

      if (enrichOpts.enrichComponents?.enabled) {
        enrichComponents(this.spec, enrichOpts.enrichComponents, this.stats);
        if (this.config.options?.verbose) {
          const totalEnriched = this.stats.componentDescriptionsAdded +
                                this.stats.componentExamplesAdded +
                                this.stats.propertyDescriptionsAdded;
          console.log(`  ✓ Enriched component schemas (${totalEnriched} additions)`);
        }
      }

      if (enrichOpts.addExamples?.enabled) {
        addExamples(this.spec, enrichOpts.addExamples, this.stats);
        if (this.config.options?.verbose) {
          console.log(`  ✓ Added ${this.stats.examplesAdded} endpoint examples`);
        }
      }

      if (this.config.options?.verbose) {
        console.log('');
      }
    }
  }

  /**
   * Save the modified specification to file
   */
  saveSpec() {
    const resolvedPath = path.resolve(this.outputPath);

    if (this.config.options?.verbose) {
      console.log(`💾 Saving to: ${resolvedPath}`);
    }

    const indent = this.config.options?.prettyPrint !== false
      ? (this.config.options?.indentSpaces || 2)
      : 0;

    const content = JSON.stringify(this.spec, null, indent);
    fs.writeFileSync(resolvedPath, content, 'utf8');

    const newSize = (content.length / 1024).toFixed(1);
    if (this.config.options?.verbose) {
      console.log(`✅ Saved (${newSize}KB)\n`);
    }
  }

  /**
   * Print transformation statistics
   */
  printStats() {
    if (!this.config.options?.verbose) return;

    console.log('📊 Transformation Statistics:');
    console.log('━'.repeat(50));

    if (this.stats.timestampsRemoved > 0) {
      console.log(`  • Timestamps removed: ${this.stats.timestampsRemoved}`);
    }
    if (this.stats.schemasReplaced > 0) {
      console.log(`  • Schemas replaced: ${this.stats.schemasReplaced}`);
    }
    if (this.stats.formatsAdded > 0) {
      console.log(`  • Formats added: ${this.stats.formatsAdded}`);
    }
    if (this.stats.descriptionsAdded > 0) {
      console.log(`  • Descriptions added: ${this.stats.descriptionsAdded}`);
    }
    if (this.stats.examplesAdded > 0) {
      console.log(`  • Examples added: ${this.stats.examplesAdded}`);
    }
    if (this.stats.oauthParamsAdded > 0) {
      console.log(`  • OAuth params added: ${this.stats.oauthParamsAdded}`);
    }
    if (this.stats.userEndpointsFixed > 0) {
      console.log(`  • User endpoints fixed: ${this.stats.userEndpointsFixed}`);
    }
    if (this.stats.componentDescriptionsAdded > 0) {
      console.log(`  • Component descriptions: ${this.stats.componentDescriptionsAdded}`);
    }
    if (this.stats.componentExamplesAdded > 0) {
      console.log(`  • Component examples: ${this.stats.componentExamplesAdded}`);
    }
    if (this.stats.propertyDescriptionsAdded > 0) {
      console.log(`  • Property descriptions: ${this.stats.propertyDescriptionsAdded}`);
    }

    console.log('\n✅ OpenAPI modification complete!');
  }
}

module.exports = { AdvancedOpenAPIModifier };
