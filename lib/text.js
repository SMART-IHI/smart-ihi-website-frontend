export function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(textOrHtml, maxChars = 180) {
  const plain = stripHtml(textOrHtml);
  if (plain.length <= maxChars) return plain;
  return plain.slice(0, maxChars).trimEnd() + "…";
}
