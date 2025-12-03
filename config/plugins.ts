export default ({ env }) => ({
  "auto-slug-manager": {
    enabled: true,
    config: {
      enabled: true, // Enable/disable plugin globally
      sourceField: "title", // Primary field to generate slug from
      fallbackField: "name", // Fallback field if primary is empty
      handleRichText: true, // Process Rich Text (blocks) fields
      addSuffixForUnique: true, // Add suffixes for uniqueness
      supportCyrillic: true, // Support Cyrillic transliteration
      updateExistingSlugs: true, // Update existing slugs when title changes
      slugifyOptions: {
        lower: true,
        strict: true,
        locale: "en",
      },
    },
  },
  "users-permissions": {
    config: {
      jwtManagement: "refresh",
      sessions: {
        accessTokenLifespan: 604800, // 1 week (default)
        maxRefreshTokenLifespan: 2592000, // 30 days
        idleRefreshTokenLifespan: 604800, // 7 days
        httpOnly: false, // Set to true for HTTP-only cookies
        cookie: {
          name: "strapi_up_refresh",
          sameSite: "lax",
          path: "/",
          secure: env("NODE_ENV", "development") === "production", // true in production
        },
      },
      ratelimit: {
        enabled: true,
        interval: { min: 5 },
        max: 5,
      },
    },
  },
});
