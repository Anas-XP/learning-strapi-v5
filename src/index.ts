import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Add OAuth query parameters to the OpenAPI documentation
    // Note: User endpoint schemas are handled by scripts/patch-openapi-spec.js
    // which automatically includes all custom fields from schema.json
    if (strapi.plugin('documentation')) {
      const override = {
        info: { version: '1.0.0' },
        paths: {
          '/auth/{provider}/callback': {
            get: {
              parameters: [
                {
                  name: 'provider',
                  in: 'path',
                  required: true,
                  description: 'Provider name',
                  schema: { type: 'string' }
                },
                {
                  name: 'access_token',
                  in: 'query',
                  required: false,
                  description: 'OAuth 2.0 access token (used by some providers in implicit flow)',
                  schema: { type: 'string' }
                },
                {
                  name: 'code',
                  in: 'query',
                  required: false,
                  description: 'OAuth 2.0 authorization code (used by Google, GitHub, Facebook)',
                  schema: { type: 'string' }
                }
              ]
            }
          }
        }
      };

      strapi
        .plugin('documentation')
        .service('override')
        .registerOverride(override);
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
