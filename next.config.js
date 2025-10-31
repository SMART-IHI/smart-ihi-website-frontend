const { i18n: i18nextConfig } = require("./next-i18next.config");

const { locales, defaultLocale } = i18nextConfig;

module.exports = {
  reactStrictMode: true,
  // Only pass Next.js-supported i18n options
  i18n: {
    locales,
    defaultLocale,
    // Next 16 expects false if provided
    localeDetection: false,
  },
  images: {
    // Allow using quality 95 as used by Header images
    qualities: [75, 95],
  },
  async rewrites() {
    const targetBase = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
    if (!targetBase) return [];
    return [
      // Proxy Strapi API and uploads through Next so clients on LAN don’t need direct access
      {
        source: "/api/:path*",
        destination: `${targetBase.replace(/\/$/, "")}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${targetBase.replace(/\/$/, "")}/uploads/:path*`,
      },
    ];
  },
  // Silence dev warning about cross-origin requests to /_next/* from 127.0.0.1
  //allowedDevOrigins: ["127.0.0.1", "localhost"],
};
