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
  const base = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_STRAPI_URL) || "";
  if (looksHtml) {
    return absolutizeAssetUrls(s, base);
  }
  // Linkify Markdown-style links
  // Images first: ![alt](url) or ![alt](url "title")
  let out = s.replace(/!\[([^\]]*)\]\((\S+?)(?:\s+["'][^"']*["'])??\)/g, (m, alt, url) => {
    const abs = /^(https?:|data:)/i.test(url)
      ? url
      : url.startsWith("/")
        ? `${base || ""}${url}`
        : url;
    return `<img src="${abs}" alt="${alt || ""}" />`;
  });
  // Then links: [text](https://...)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Headings: lines starting with #, ##, ### ...
  out = out.replace(/^(\s{0,3})(#{1,6})\s+(.+?)\s*#*\s*$/gm, (m, _space, hashes, text) => {
    const depth = hashes.length;
    // Map # -> h2, ## -> h3, etc., for larger section titles
    const level = Math.min(6, depth + 1);
    let cls = "font-serif";
    if (depth === 1) cls = "mt-6 mb-3 font-serif text-2xl md:text-3xl";
    else if (depth === 2) cls = "mt-5 mb-2 font-serif text-xl md:text-2xl";
    else cls = "mt-4 mb-2 font-serif text-lg md:text-xl";
    return `<h${level} class="${cls}">${text.trim()}</h${level}>`;
  });
  // Build blocks: keep headings as blocks, wrap others as paragraphs
  const blocks = out.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const html = blocks.map((b) => {
    if (/^<h[1-6]\b/i.test(b)) return b;
    return `<p>${b.replace(/\n/g, '<br/>')}</p>`;
  }).join('');
  return absolutizeAssetUrls(html, base);
}

// Prefix relative src/href URLs with the Strapi base URL so images/files in richtext render correctly
export function absolutizeAssetUrls(html, baseUrl = "") {
  if (!html) return "";
  const base = String(baseUrl || "").replace(/\/$/, "");
  if (!base) return html; // nothing to prefix with
  // Replace src or href that are not http(s), data:, mailto:, tel:
  return String(html).replace(/\b(src|href)=("|')(?!https?:|data:|mailto:|tel:)(\/[^"']*)(\2)/gi, (match, attr, quote, path) => {
    return `${attr}=${quote}${base}${path}${quote}`;
  });
}
