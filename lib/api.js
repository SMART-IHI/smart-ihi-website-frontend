import axios from "axios";

// Determine base URL depending on runtime:
// - Server (SSR/build): use STRAPI_INTERNAL_URL (or fallback to NEXT_PUBLIC_STRAPI_URL)
// - Browser: use relative URLs (proxied by Next.js rewrites)
const PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "";
const INTERNAL_URL = process.env.STRAPI_INTERNAL_URL || PUBLIC_URL || "";
const IS_SERVER = typeof window === "undefined";
const BASE_URL = IS_SERVER ? INTERNAL_URL : "";

const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_API_TOKEN;

// Map Next.js locales to Strapi locales when they differ (e.g., zh -> zh-Hans)
// You can override with envs if your Strapi uses different locale codes.
const LOCALE_MAP = {
  en: process.env.NEXT_PUBLIC_STRAPI_LOCALE_EN || "en",
  zh: process.env.NEXT_PUBLIC_STRAPI_LOCALE_ZH || "zh",
};

// Reusable axios client with optional auth header for protected/public endpoints
const client = axios.create(BASE_URL ? { baseURL: BASE_URL } : {});
if (IS_SERVER && !BASE_URL) {
  // Helpful diagnostic to avoid "Invalid URL" at runtime if envs are missing
  // eslint-disable-next-line no-console
  console.warn("[fetchStrapi] BASE_URL is empty on server. Set STRAPI_INTERNAL_URL or NEXT_PUBLIC_STRAPI_URL.");
}
if (API_TOKEN) {
  client.defaults.headers.common["Authorization"] = `Bearer ${API_TOKEN}`;
}

function buildUrl(endpoint, strapiLocale) {
  const hasQuery = endpoint.includes("?");
  const sep = hasQuery ? "&" : "?";
  const localePart = strapiLocale ? `locale=${encodeURIComponent(strapiLocale)}&` : "";
  return `/api/${endpoint}${sep}${localePart}populate=*`;
}

export async function fetchStrapi(endpoint, locale = "en") {
  // Special case: locale = "all" -> fetch each configured locale and merge unique by documentId/id
  if (locale === "all") {
    const localeCodes = Array.from(new Set(Object.values(LOCALE_MAP)));
    try {
      const results = await Promise.all(
        localeCodes.map(async (code) => {
          const url = buildUrl(endpoint, code);
          const res = await client.get(url);
          const data = res?.data?.data;
          // Normalize to array in case a single entity was requested accidentally
          return Array.isArray(data) ? data : (data ? [data] : []);
        })
      );
      const flat = results.flat();
      const seen = new Set();
      const merged = [];
      for (const item of flat) {
        const key = item?.documentId || item?.id;
        if (key && !seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      }
      return merged;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err.message;
      console.error(`[fetchStrapi] ERR (all) ${endpoint} -> ${msg}`);
      throw err;
    }
  }

  const strapiLocale = LOCALE_MAP[locale] || locale;
  const url = buildUrl(endpoint, strapiLocale);
  try {
    const res = await client.get(url);
    return res.data.data;
  } catch (err) {
    // Provide clearer diagnostics during development
    const status = err?.response?.status;
    const msg = err?.response?.data?.error?.message || err.message;
    console.error(`[fetchStrapi] ${status || "ERR"} ${url} -> ${msg}`);
    throw err;
  }
}
