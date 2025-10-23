export function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(textOrHtml, maxChars = 180) {
  const plain = stripHtml(textOrHtml);
  if (plain.length <= maxChars) return plain;
  return plain.slice(0, maxChars).trimEnd() + "…";
}

// Render content that may be HTML or simple Markdown (links, newlines)
// - If it looks like HTML, return as-is
// - Otherwise, convert [text](https://...) to <a> and newlines to <br/>
//   Wrap in <p> for basic semantics.
export function renderMaybeMarkdown(input) {
  if (!input) return "";
  const s = String(input);
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(s);
  if (looksHtml) return s;
  // Linkify Markdown-style links
  let out = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Paragraphs and line breaks
  out = out.replace(/\n{2,}/g, '</p><p>');
  out = out.replace(/\n/g, '<br/>');
  return `<p>${out}</p>`;
}
