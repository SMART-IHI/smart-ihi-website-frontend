export function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(textOrHtml, maxChars = 180) {
  const plain = stripHtml(textOrHtml);
  if (plain.length <= maxChars) return plain;
  return plain.slice(0, maxChars).trimEnd() + "…";
}

// Basic HTML escaper to prevent attribute/text injection
export function escapeHtml(input) {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Very conservative URL sanitizers
export function sanitizeHrefUrl(url) {
  if (!url) return null;
  const s = String(url).trim();
  if (/^(https?:)\/\//i.test(s)) return s; // http/https
  if (/^(mailto:|tel:)/i.test(s)) return s; // contact links
  if (s.startsWith("/") && !s.startsWith("//")) return s; // same-origin path
  return null; // disallow others (javascript:, data:, protocol-relative, etc.)
}

export function sanitizeImgSrcUrl(url) {
  if (!url) return null;
  const s = String(url).trim();
  if (/^(https?:)\/\//i.test(s)) return s; // http/https images (including CDN)
  if (/^data:image\//i.test(s)) return s; // embedded image only
  if (s.startsWith("/") && !s.startsWith("//")) return s; // same-origin path
  return null; // disallow others
}

// Strip risky tags/attributes and neutralize javascript: URLs
export function sanitizeHtml(html) {
  if (!html) return "";
  let out = String(html);
  // Remove script and iframe entirely
  out = out.replace(/<\/(?:script|iframe)>/gi, "");
  out = out.replace(/<(script|iframe)([\s\S]*?)>([\s\S]*?)<\/(script|iframe)>/gi, "");
  out = out.replace(/<(script|iframe)([\s\S]*?)\/>/gi, "");
  // Remove style, link, form elements which are not needed in CMS content
  out = out.replace(/<\/(?:style|link|form)>/gi, "");
  out = out.replace(/<(style|link|form)([\s\S]*?)>([\s\S]*?)<\/(style|link|form)>/gi, "");
  out = out.replace(/<(style|link|form)([\s\S]*?)\/>/gi, "");
  // Remove on* event handlers
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Neutralize javascript: in href/src
  out = out.replace(/\b(href|src)=("|')\s*javascript:[^"']*(\2)/gi, (m, attr, q) => `${attr}=${q}#${q}`);
  // Optionally strip style attributes (prevent CSS-based injections)
  out = out.replace(/\sstyle=("[^"]*"|'[^']*')/gi, "");
  return out;
}

// Ensure href/src/srcset attributes only contain allowed URL schemes/paths
export function sanitizeAttributesInHtml(html) {
  if (!html) return "";
  let out = String(html);
  // Sanitize href
  out = out.replace(/\bhref=("|')([^"']*)(\1)/gi, (m, q, val) => {
    const safe = sanitizeHrefUrl(val);
    const finalVal = safe || '#';
    return `href=${q}${escapeHtml(finalVal)}${q}`;
  });
  // Sanitize src
  out = out.replace(/\bsrc=("|')([^"']*)(\1)/gi, (m, q, val) => {
    const safe = sanitizeImgSrcUrl(val);
    const finalVal = safe || '';
    return `src=${q}${escapeHtml(finalVal)}${q}`;
  });
  // Sanitize srcset (keep only allowed URLs)
  out = out.replace(/\bsrcset=("|')([^"']*)(\1)/gi, (m, q, val) => {
    const items = String(val).split(',').map((x) => x.trim()).filter(Boolean);
    const kept = items.map((item) => {
      const parts = item.split(/\s+/);
      const url = parts[0];
      const desc = parts.slice(1).join(' ');
      const safe = sanitizeImgSrcUrl(url);
      return safe ? `${safe}${desc ? ' ' + desc : ''}` : null;
    }).filter(Boolean);
    return `srcset=${q}${escapeHtml(kept.join(', '))}${q}`;
  });
  return out;
}

// Normalize a Strapi asset URL to a same-origin-friendly path when possible.
// If the URL is absolute like http://127.0.0.1:1337/uploads/..., return just /uploads/...
// Otherwise, return the original string.
export function normalizeAssetUrl(input) {
  if (!input) return input;
  const s = String(input).trim();
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.pathname && u.pathname.startsWith("/uploads")) return u.pathname;
      return s; // keep as-is (e.g., CDN or external)
    } catch {
      return s;
    }
  }
  return s;
}

// Render content that may be HTML or simple Markdown (links, newlines)
// - If it looks like HTML, return as-is
// - Otherwise, convert [text](https://...) to <a> and newlines to <br/>
//   Wrap in <p> for basic semantics.
export function renderMaybeMarkdown(input) {
  if (!input) return "";
  const s = String(input);
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(s);
  const base = ""; // default: same-origin
  if (looksHtml) {
    // First, sanitize to strip risky content
    const cleaned = sanitizeHtml(s);
    // Then strip absolute Strapi upload URLs to relative so Next rewrites can proxy them
    const normalized = normalizeUploadsInHtml(cleaned);
    // Optionally force absolute internal URL on server if requested
    const preferAbsolute = (typeof window === "undefined") && String(process.env.FORCE_ABSOLUTE_UPLOADS || "").toLowerCase() === "true";
    if (preferAbsolute) {
      const internal = (typeof process !== "undefined" && (process.env?.STRAPI_INTERNAL_URL || process.env?.NEXT_PUBLIC_STRAPI_URL)) || "";
      const absHtml = absolutizeAssetUrls(normalized, internal);
      return sanitizeAttributesInHtml(absHtml);
    }
    // Default: keep same-origin for LAN compatibility
    return sanitizeAttributesInHtml(normalized);
  }
  // Linkify Markdown-style links
  // Images first: ![alt](url) or ![alt](url "title")
  let out = s.replace(/!\[([^\]]*)\]\((\S+?)(?:\s+["'][^"']*["'])??\)/g, (m, alt, url) => {
    const safeUrl = sanitizeImgSrcUrl(url);
    if (!safeUrl) return ``; // drop unsafe image
    return `<img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(alt || "")}" />`;
  });
  // Then links: [text](https://...)
  out = out.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (m, text, url) => {
    const safeUrl = sanitizeHrefUrl(url);
    if (!safeUrl) return escapeHtml(text);
    return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
  });
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
  let html = blocks.map((b) => {
    if (/^<h[1-6]\b/i.test(b)) return b;
    return `<p>${b.replace(/\n/g, '<br/>')}</p>`;
  }).join('');
  // Sanitize and normalize absolute upload links
  html = sanitizeHtml(html);
  html = normalizeUploadsInHtml(html);
  // Optionally force absolute internal URL on server if requested
  const preferAbsolute = (typeof window === "undefined") && String(process.env.FORCE_ABSOLUTE_UPLOADS || "").toLowerCase() === "true";
  if (preferAbsolute) {
    const internal = (typeof process !== "undefined" && (process.env?.STRAPI_INTERNAL_URL || process.env?.NEXT_PUBLIC_STRAPI_URL)) || "";
    const absHtml = absolutizeAssetUrls(html, internal);
    return sanitizeAttributesInHtml(absHtml);
  }
  // Default: same-origin
  return sanitizeAttributesInHtml(html);
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

// Rewrite absolute upload URLs like src="http://127.0.0.1:1337/uploads/..." to src="/uploads/..."
export function normalizeUploadsInHtml(html) {
  if (!html) return "";
  // Match absolute or protocol-relative URLs ending with /uploads/... and rewrite to relative /uploads/...
  let out = String(html).replace(/\b(src|href)=("')(?:(?:https?:)?\/\/)[^"']*(\/uploads\/[^"']+)(\2)/gi, (match, attr, quote, path) => {
    return `${attr}=${quote}${path}${quote}`;
  });
  // Also handle srcset attribute values which can contain multiple URLs
  out = out.replace(/\bsrcset=("')([^"']+)(\1)/gi, (match, quote, value) => {
    const replaced = value.replace(/(?:(?:https?:)?\/\/)[^\s,]*?(\/uploads\/[^\s,]+)(?=\s|,|$)/gi, (m, path) => path);
    return `srcset=${quote}${replaced}${quote}`;
  });
  // Handle inline CSS url() occurrences
  out = out.replace(/url\(("|')?(?:(?:https?:)?\/\/)[^\)"']*(\/uploads\/[^\)"']+)(\1)?\)/gi, (match, quote, path) => {
    return `url(${quote || ''}${path}${quote || ''})`;
  });
  // Generic fallback: replace any absolute uploads occurrence in text/attributes
  out = out.replace(/(?:(?:https?:)?\/\/)[^\s"'<>]*?(\/uploads\/[^\s"'<>]+)(?![^<]*>)/gi, (m, path) => path);
  return out;
}
