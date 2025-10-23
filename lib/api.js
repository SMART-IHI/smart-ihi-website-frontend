import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_API_TOKEN;

// Reusable axios client with optional auth header for protected/public endpoints
const client = axios.create({ baseURL: API_URL });
if (API_TOKEN) {
  client.defaults.headers.common["Authorization"] = `Bearer ${API_TOKEN}`;
}

export async function fetchStrapi(endpoint, locale = "en") {
  const hasQuery = endpoint.includes("?");
  const sep = hasQuery ? "&" : "?";
  const url = `/api/${endpoint}${sep}locale=${locale}&populate=*`;

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
