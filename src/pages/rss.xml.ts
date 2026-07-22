import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedEntries, sortByPublishDate } from '../utils/content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../utils/site';

export async function GET(context: APIContext) {
  const entries = sortByPublishDate(await getPublishedEntries());

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: `/${entry.data.contentType}/${entry.data.slug}/`,
      categories: [entry.data.category, ...entry.data.tags],
      author: entry.data.author,
    })),
  });
}
