import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function fetchStrapi(endpoint, locale = "en") {
  const res = await axios.get(`${API_URL}/api/${endpoint}?locale=${locale}`);
  return res.data.data;
}
