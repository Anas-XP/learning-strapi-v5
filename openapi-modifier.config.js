/**
 * Advanced OpenAPI Modifier Configuration
 * Post-processing configuration for Strapi v5 OpenAPI specifications
 */

module.exports = {
  // Input/Output paths
  specPath: './specification.json',
  outputPath: './specification.json', // Same file = overwrite

  // Transformation configurations
  transformations: {
    // CLEAN: Remove unwanted data
    clean: {
      enabled: true,
      options: {
        // Remove dynamic timestamp defaults
        removeTimestampDefaults: {
          enabled: true,
          fields: ['publishedAt', 'createdAt', 'updatedAt'],
          // Only remove if matches ISO 8601 datetime pattern (idempotent)
          pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        },

        // Replace verbose inline schemas with $ref
        deduplicateSchemas: {
          enabled: true,
          // Minimum similarity threshold (0.0-1.0)
          matchThreshold: 0.8,
          // Component schemas to match against
          targetSchemas: [
            'ApiPhoneNumverPhoneNumverDocument',
            'PluginUsersPermissionsUserDocument',
            'PluginUsersPermissionsPermissionDocument',
            'PluginUsersPermissionsRoleDocument'
          ]
        }
      }
    },

    // ENRICH: Add missing data
    enrich: {
      enabled: true,
      options: {
        // Fix user endpoint response schemas first (before other transformations)
        fixUserEndpoints: {
          enabled: true,
          endpoints: [
            {
              path: '/users/me',
              method: 'get',
              responseSchema: {
                $ref: '#/components/schemas/PluginUsersPermissionsUserDocument'
              }
            },
            {
              path: '/users',
              method: 'get',
              responseSchema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/PluginUsersPermissionsUserDocument'
                    }
                  },
                  meta: {
                    type: 'object'
                  }
                }
              }
            },
            {
              path: '/users/{id}',
              method: 'get',
              responseSchema: {
                $ref: '#/components/schemas/PluginUsersPermissionsUserDocument'
              }
            }
          ]
        },

        // Add OAuth parameters to callback endpoints
        addOAuthParameters: {
          enabled: true,
          endpoints: [
            {
              path: '/auth/{provider}/callback',
              method: 'get',
              parameters: [
                {
                  name: 'access_token',
                  in: 'query',
                  required: false,
                  description: 'OAuth access token returned by provider',
                  schema: { type: 'string' }
                },
                {
                  name: 'code',
                  in: 'query',
                  required: false,
                  description: 'OAuth authorization code',
                  schema: { type: 'string' }
                },
                {
                  name: 'state',
                  in: 'query',
                  required: false,
                  description: 'OAuth state parameter for CSRF protection',
                  schema: { type: 'string' }
                },
                {
                  name: 'error',
                  in: 'query',
                  required: false,
                  description: 'OAuth error code if authentication failed',
                  schema: { type: 'string' }
                },
                {
                  name: 'error_description',
                  in: 'query',
                  required: false,
                  description: 'Human-readable error description',
                  schema: { type: 'string' }
                }
              ]
            }
          ]
        },

        // Add missing format hints
        addFormatHints: {
          enabled: true,
          rules: [
            {
              // Add format: "date-time" to datetime fields
              condition: (property, key) => {
                const hasDatetimeDescription =
                  property.description?.toLowerCase().includes('datetime');
                const isTimestampField =
                  ['createdAt', 'updatedAt', 'publishedAt'].includes(key);
                return (
                  property.type === 'string' &&
                  (hasDatetimeDescription || isTimestampField) &&
                  !property.format
                );
              },
              format: 'date-time'
            },
            {
              // Add format: "email" to email fields without format
              condition: (property, key) => {
                return (
                  key === 'email' &&
                  property.type === 'string' &&
                  !property.format
                );
              },
              format: 'email'
            },
            {
              // Ensure UUID fields have format
              condition: (property, key) => {
                return (
                  key === 'documentId' &&
                  property.type === 'string' &&
                  !property.format
                );
              },
              format: 'uuid'
            }
          ]
        },

        // Add missing descriptions
        addDescriptions: {
          enabled: true,
          rules: [
            {
              path: '/users/me',
              method: 'get',
              description: 'Get the authenticated user profile'
            },
            {
              path: '/users',
              method: 'get',
              description: 'Get a list of users (requires appropriate permissions)'
            },
            {
              path: '/users/{id}',
              method: 'get',
              description: 'Get a specific user by ID'
            },
            {
              path: '/auth/{provider}/callback',
              method: 'get',
              description: 'OAuth callback endpoint for third-party authentication providers'
            }
          ]
        },

        // Enrich component schemas
        enrichComponents: {
          enabled: true,
          schemas: {
            'PluginUsersPermissionsUserDocument': {
              description: 'User document with authentication and profile information',
              example: {
                documentId: '12345678-1234-1234-1234-123456789012',
                id: 1,
                username: 'john_doe',
                email: 'john@example.com',
                provider: 'local',
                confirmed: true,
                blocked: false,
                isPhoneVerified: false,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
              },
              propertyDescriptions: {
                documentId: 'Unique document identifier (UUID v4)',
                username: "User's unique username for authentication",
                email: "User's email address (unique, validated)",
                confirmed: 'Whether email has been confirmed',
                blocked: 'Whether user is blocked from accessing the system',
                isPhoneVerified: 'Whether phone number has been verified'
              }
            },
            'ApiPhoneNumverPhoneNumverDocument': {
              description: 'Phone number entity',
              example: {
                documentId: '12345678-1234-1234-1234-123456789012',
                id: 1,
                dumb_number: 1234567890
              }
            }
          }
        },

        // Add examples to endpoints
        addExamples: {
          enabled: true,
          endpoints: {
            '/users/me': {
              method: 'get',
              response: {
                documentId: '12345678-1234-1234-1234-123456789012',
                id: 1,
                username: 'current_user',
                email: 'user@example.com',
                provider: 'local',
                confirmed: true,
                blocked: false
              }
            }
          }
        }
      }
    }
  },

  // Global options
  options: {
    // Pretty print JSON output
    prettyPrint: true,
    indentSpaces: 2,

    // Backup original file before modification
    createBackup: true,
    backupSuffix: '.backup',

    // Validation
    validateSchema: true, // Validate against OpenAPI 3.1.0 schema

    // Logging
    verbose: true
  }
};
