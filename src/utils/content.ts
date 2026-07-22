import { getCollection, type CollectionEntry } from 'astro:content';
import type { ContentType } from './sections';
import { HOUSE_AUTHOR_MATCH } from './site';

/** Returns blog entries, excluding drafts in production, optionally filtered by contentType. */
export async function getPublishedEntries(
  contentType?: ContentType
): Promise<CollectionEntry<'blog'>[]> {
  return getCollection('blog', (entry) => {
    if (import.meta.env.PROD && entry.data.draft) return false;
    if (contentType && entry.data.contentType !== contentType) return false;
    return true;
  });
}

export function sortByPublishDate(
  entries: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  return [...entries].sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );
}

/** Ranks other entries by shared tags, then category, then contentType. */
export function getRelatedEntries(
  entry: CollectionEntry<'blog'>,
  candidates: CollectionEntry<'blog'>[],
  limit = 3
): CollectionEntry<'blog'>[] {
  const scored = candidates
    .filter((candidate) => candidate.id !== entry.id)
    .map((candidate) => {
      const sharedTags = candidate.data.tags.filter((tag) => entry.data.tags.includes(tag));
      let score = sharedTags.length * 3;
      if (candidate.data.category === entry.data.category) score += 2;
      if (candidate.data.contentType === entry.data.contentType) score += 1;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0);

  scored.sort(
    (a, b) =>
      b.score - a.score || b.candidate.data.publishDate.valueOf() - a.candidate.data.publishDate.valueOf()
  );

  return scored.slice(0, limit).map(({ candidate }) => candidate);
}

/** Finds the chronologically previous and next entry within a set (usually one section). */
export function getAdjacentEntries(
  entry: CollectionEntry<'blog'>,
  sectionEntries: CollectionEntry<'blog'>[]
): { prev: CollectionEntry<'blog'> | null; next: CollectionEntry<'blog'> | null } {
  const sorted = [...sectionEntries].sort(
    (a, b) => a.data.publishDate.valueOf() - b.data.publishDate.valueOf()
  );
  const index = sorted.findIndex((candidate) => candidate.id === entry.id);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}

/** Entries bylined to the in-house PnL App editorial team, matched loosely on the author string. */
export function getHouseEntries(entries: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return entries.filter((entry) => entry.data.author.toLowerCase().includes(HOUSE_AUTHOR_MATCH));
}

/** Builds a lowercase, whitespace-joined string of every field the site search should match against. */
export function buildSearchIndex(entry: CollectionEntry<'blog'>): string {
  return [
    entry.data.title,
    entry.data.description,
    entry.data.category,
    entry.data.contentType,
    ...entry.data.tags,
  ]
    .join(' ')
    .toLowerCase();
}
