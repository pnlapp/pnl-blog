import { SITE_URL } from './site';

/** Resolves an entry's canonical URL, honoring an explicit override from frontmatter. */
export function getCanonicalURL(path: string, canonicalURLOverride?: string): string {
  if (canonicalURLOverride) return canonicalURLOverride;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

/** Resolves a possibly-relative asset URL to an absolute URL, required for OG images and JSON-LD. */
export function getAbsoluteURL(pathOrURL: string): string {
  try {
    return new URL(pathOrURL).toString();
  } catch {
    return new URL(pathOrURL, SITE_URL).toString();
  }
}
