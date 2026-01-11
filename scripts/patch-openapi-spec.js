const fs = require('fs');
const path = require('path');

const specPath = path.join(__dirname, '../specification.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

// Find the auth callback endpoint
const callbackPath = spec.paths['/auth/{provider}/callback'];

if (callbackPath && callbackPath.get) {
  // Add query parameters
  callbackPath.get.parameters = callbackPath.get.parameters || [];

  // Only add if not already present
  const hasAccessToken = callbackPath.get.parameters.some(p => p.name === 'access_token');
  const hasCode = callbackPath.get.parameters.some(p => p.name === 'code');

  if (!hasAccessToken) {
    callbackPath.get.parameters.push({
      name: 'access_token',
      in: 'query',
      required: false,
      schema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'string',
      },
      description: 'OAuth 2.0 access token (used by some providers in implicit flow)',
    });
  }

  if (!hasCode) {
    callbackPath.get.parameters.push({
      name: 'code',
      in: 'query',
      required: false,
      schema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'string',
      },
      description: 'OAuth 2.0 authorization code (used by Google, GitHub, Facebook)',
    });
  }

  console.log('✅ Added OAuth parameters to auth callback endpoint');
} else {
  console.log('❌ Could not find /auth/{provider}/callback endpoint');
}

// Helper function to patch user endpoint response schema
function patchUserEndpoint(path, method, endpointName) {
  const endpoint = spec.paths[path];
  if (endpoint?.[method]?.responses['200']) {
    const responseContent = endpoint[method].responses['200'].content?.['application/json'];
    if (responseContent?.schema) {
      // For list endpoints, wrap in data array
      if (path === '/users') {
        responseContent.schema = {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                "$ref": "#/components/schemas/PluginUsersPermissionsUserDocument"
              }
            },
            meta: { type: 'object' }
          }
        };
      } else {
        // For single user endpoints
        responseContent.schema = {
          "$ref": "#/components/schemas/PluginUsersPermissionsUserDocument"
        };
      }
      console.log(`✅ Updated ${endpointName} to reference PluginUsersPermissionsUserDocument`);
      return true;
    }
  }
  console.log(`❌ Could not patch ${endpointName} endpoint`);
  return false;
}

// Patch all user endpoints
patchUserEndpoint('/users/me', 'get', '/users/me');
patchUserEndpoint('/users', 'get', '/users');
patchUserEndpoint('/users/{id}', 'get', '/users/{id}');

// Write back
fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
console.log('✅ Specification patching complete');
