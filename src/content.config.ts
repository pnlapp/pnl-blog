import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Allowed content types map 1:1 to the site's top-level sections.
export const CONTENT_TYPES = [
  'news',
  'education',
  'trading-psychology',
  'glossary',
  'research',
] as const;

// Lowercase letters, numbers, and single hyphens only. No spaces, no leading/trailing hyphen.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z
    .object({
      title: z.string().min(1, 'title is required'),
      description: z.string().min(1, 'description is required'),
      slug: z
        .string()
        .min(1, 'slug is required')
        .regex(
          SLUG_PATTERN,
          'slug must be lowercase letters, numbers, and hyphens only, e.g. "how-leverage-works"'
        ),
      contentType: z.enum(CONTENT_TYPES),
      category: z.string().min(1, 'category is required'),
      tags: z.array(z.string().min(1)).default([]),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().min(1, 'author is required'),
      reviewer: z.string().min(1).optional(),
      featuredImage: z.string().url('featuredImage must be an absolute URL').optional(),
      featuredImageAlt: z.string().min(1).optional(),
      canonicalURL: z.string().url('canonicalURL must be an absolute URL').optional(),
      draft: z.boolean().default(false),
      sources: z
        .array(
          z.object({
            title: z.string().min(1),
            url: z.string().url('source url must be an absolute URL'),
          })
        )
        .default([]),
      keyTakeaways: z.array(z.string().min(1)).default([]),
      faq: z
        .array(
          z.object({
            question: z.string().min(1),
            answer: z.string().min(1),
          })
        )
        .default([]),
    })
    .refine((data) => !data.featuredImage || Boolean(data.featuredImageAlt), {
      message: 'featuredImageAlt is required whenever featuredImage is set',
      path: ['featuredImageAlt'],
    }),
});

export const collections = { blog };
