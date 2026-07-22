# Publishing Automation (Make.com)

This document describes how an external automation (Make.com or anything else) publishes
articles to this site. It does not configure or create a Make.com scenario. It only
describes the file format the Astro project expects, so a scenario can be built against it
reliably.

## How publishing works, in one sentence

Make.com creates one Markdown file per article inside `src/content/blog/`, in the exact
format described below, and commits it to the repository. Everything else (the page route,
the schema validation, the SEO tags, the JSON-LD, the sitemap, the RSS feed) is handled
automatically by the Astro project once that file lands in the repository.

A ready-to-copy example lives at [`src/content/blog/_template.md`](src/content/blog/_template.md).
It is prefixed with an underscore so the site never treats it as a real article (see
"Content loader rules" below).

## Content loader rules

The blog collection is loaded from `src/content/blog/**/*.md` (and `.mdx`), **except** files
whose name starts with an underscore (`_`). Underscore-prefixed files are invisible to the
site: no page, no listing, no sitemap entry, nothing. This is reserved for templates and
notes, not for hiding unfinished articles. To hide an unfinished or unapproved article, use
`draft: true` instead (see "How to create a draft" below).

## 1. Required frontmatter fields

These fields have no default value. The build fails if any is missing or empty.

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | The article headline. |
| `description` | string | One to two sentences. Used as the meta description and the deck shown under the headline. |
| `slug` | string | The URL segment. See "Expected slug format" below. |
| `contentType` | string | One of the five allowed values. See below. |
| `category` | string | A short label shown as a tag on the article (e.g. `"Risk Management"`). |
| `author` | string | Byline. Use `"PnL App Team"` for house-written content. |
| `publishDate` | string | See "Expected date format" below. |

## 2. Optional fields

These fields may be omitted entirely. If omitted, they simply do not render on the article.

| Field | Type | Default if omitted |
| --- | --- | --- |
| `updatedDate` | string | Not shown. Only add this when the article is actually revised after publishing. |
| `reviewer` | string | Not shown. Only set this when a named subject-matter reviewer actually reviewed the piece. |
| `featuredImage` | string (absolute URL) | No hero image is rendered. |
| `featuredImageAlt` | string | **Required if `featuredImage` is set.** The build fails otherwise. |
| `canonicalURL` | string (absolute URL) | The site computes its own canonical URL from the section and slug. Only set this if the article is a syndicated republish of content that lives at a different canonical URL. |
| `draft` | boolean | `false` |
| `tags` | array of strings | `[]` |
| `sources` | array of `{title, url}` | `[]` |
| `keyTakeaways` | array of strings | `[]` |
| `faq` | array of `{question, answer}` | `[]` |

## 3. Allowed `contentType` values

Exactly one of the following, lowercase, matching the string exactly:

- `news`
- `education`
- `trading-psychology`
- `glossary`
- `research`

Each value maps directly to a site section and the article's URL prefix
(`/news/`, `/education/`, `/trading-psychology/`, `/glossary/`, `/research/`). Any other
value fails the build.

## 4. Expected date format

Always a quoted string in `YYYY-MM-DD` format:

```yaml
publishDate: "2026-07-22"
updatedDate: "2026-07-23"
```

Do not leave dates unquoted. Unquoted dates are ambiguous in YAML and different parsers can
read them differently. A quoted ISO date string is parsed the same way every time.

## 5. Expected slug format

Lowercase letters, numbers, and single hyphens only. No spaces, no underscores, no
uppercase letters, no leading or trailing hyphen.

- Valid: `"how-leverage-works"`, `"what-is-drawdown"`, `"oil-prices-slip-2026"`
- Invalid: `"How Leverage Works"`, `"how_leverage_works"`, `"-how-leverage-works"`

The slug should match the article's filename (see "How Make.com should name the Markdown
file" below) and must be unique across the entire `src/content/blog/` directory,
independent of `contentType`. The schema cannot check uniqueness across files, so the
automation is responsible for not generating the same slug twice.

## 6. How tags should be formatted

A JSON-style array of short, lowercase strings:

```yaml
tags: ["leverage", "risk management", "margin"]
```

An empty array (`tags: []`) or omitting the field entirely is fine if there is nothing
meaningful to tag.

## 7. How sources should be formatted

A JSON-style array of objects, each with a `title` and an absolute `url`:

```yaml
sources: [{"title": "U.S. Energy Information Administration", "url": "https://www.eia.gov/petroleum/supply/weekly/"}, {"title": "IEA Oil Market Report", "url": "https://www.iea.org/topics/oil-market-report"}]
```

Sources render as a visible, numbered list on the article itself. They are not hidden
metadata. Omit the field, or use `sources: []`, when an article has no external sources
(most glossary and trading psychology pieces will not have any).

## 8. How FAQ should be formatted

A JSON-style array of objects, each with a `question` and an `answer`:

```yaml
faq: [{"question": "Is leverage always risky?", "answer": "High leverage increases how fast losses accumulate relative to account size, but the underlying risk still comes from position size and stop placement."}]
```

Every question needs a genuinely complete answer. Do not add a FAQ entry unless it has a
real answer, and do not add FAQ purely to insert extra keywords. FAQ content becomes
visible, user-facing text on the article and structured data (`FAQPage`) generated directly
from these same values, so the two can never drift out of sync.

## 9. Where images should be hosted

`featuredImage` must be a full, absolute, HTTPS URL to an image hosted somewhere stable and
publicly reachable (a CDN, object storage bucket, or image host the automation already
uses). It must not be:

- a relative path (`/images/foo.jpg`)
- a `localhost` or internal URL
- a path into this repository (Make.com does not commit binary files here)

The build fails if `featuredImage` is present but is not a valid absolute URL, or if it is
present without a matching `featuredImageAlt`.

## 10. How Make.com should name the Markdown file

`src/content/blog/<slug>.md`, where `<slug>` is exactly the same string used in the
`slug` frontmatter field.

- Lowercase, hyphenated, ending in `.md`.
- Do not prefix the filename with an underscore, that hides the article entirely.
- Do not reuse a filename or slug that already exists in the directory.
- Use plain `.md`, not `.mdx`, unless the article actually needs MDX/component syntax.
  Make.com should never need `.mdx`.

Example: an article with `slug: "how-leverage-works"` is saved as
`src/content/blog/how-leverage-works.md`.

## 11. How publishing triggers a rebuild

This is a statically generated Astro site. Content is only read and turned into pages at
build time, so a new file does nothing on its own until the site is rebuilt and
redeployed.

1. Make.com commits the new or updated Markdown file to the branch connected to this
   project's hosting provider (for example, Netlify, Vercel, or Cloudflare Pages).
2. The hosting provider's git integration detects the push and automatically runs
   `npm run build`.
3. If the build succeeds, the new article goes live. If any article in the repository
   fails schema validation, the entire build fails and nothing is deployed, including
   otherwise-valid articles committed in the same push. See "Common formatting mistakes"
   below to avoid this.

There is no separate "publish" step beyond committing a valid file. There is also no
database and no runtime content sync. Locally, `npm run build` reproduces exactly what the
hosting provider will do.

## 12. How to create a draft

Set `draft: true` in the frontmatter:

```yaml
draft: true
```

A draft article:

- Is excluded from the production build (no page is generated for it, visiting its URL
  returns 404).
- Is excluded from its section listing, the homepage, the sitemap, the RSS feed, the
  client-side search index, and every "related articles" list.
- Is still visible when running the site locally with `npm run dev`, so it can be
  previewed before flipping `draft` to `false`.

To publish a draft, change `draft: true` to `draft: false` (or remove the field, since
`false` is the default) and let the next rebuild pick it up.

## 13. One complete valid article example

```markdown
---
title: "How Leverage Really Works (and Where It Breaks Down)"
description: "Leverage magnifies both gains and losses, but the mechanics of margin, maintenance requirements, and forced liquidation are where most traders get surprised."
slug: "how-leverage-works"
contentType: "education"
category: "Risk Management"
tags: ["leverage", "margin", "risk management"]
publishDate: "2026-07-15"
updatedDate: "2026-07-17"
author: "Jordan Blake"
reviewer: "Priya Nair, CMT"
featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200"
featuredImageAlt: "Multiple monitors displaying trading charts on a desk"
draft: false
sources: [{"title": "FINRA, Margin Requirements Overview", "url": "https://www.finra.org/investors/investing/investment-products/margin-accounts"}]
keyTakeaways: ["Leverage changes the size of your position, not the odds of the trade working out.", "Maintenance margin, not initial margin, is usually what triggers a liquidation."]
faq: [{"question": "What is a margin call?", "answer": "A margin call happens when your account equity falls below the maintenance margin requirement, prompting the broker to ask for more funds or close part of the position."}]
---

Leverage is one of the most misunderstood tools in trading. Used carelessly, it turns a
manageable loss into an account-ending one. Used deliberately, it simply lets you size a
position without tying up the full notional value in cash.

## What leverage actually does

Leverage lets you control a larger position than your account balance would otherwise
allow, using borrowed capital from your broker.

## A practical way to think about it

Before opening a leveraged position, work backward from your stop loss, then size the
position so a stop-out costs what you decided to risk, not more.
```

This is a trimmed version of a real article already published on this site, at
[`src/content/blog/how-leverage-works.md`](src/content/blog/how-leverage-works.md). Open
that file to see the full, unabridged version.

## 14. Common formatting mistakes that cause build failures

- **Unquoted string containing a colon.** `title: Oil Prices: A Primer` breaks YAML,
  because the second colon looks like a new key. Always quote: `title: "Oil Prices: A Primer"`.
- **Single-quoted string with an unescaped apostrophe.** `title: 'A trader's edge'` breaks
  YAML. Use double quotes instead: `title: "A trader's edge"`. Apostrophes need no escaping
  inside double quotes.
- **Unescaped double quote inside a double-quoted value.** `description: "He said "sell""`
  breaks YAML. Escape it: `description: "He said \"sell\""`.
- **A literal line break inside a frontmatter value.** Every frontmatter field must be a
  single line. If a value needs a line break, it does not belong in frontmatter, move it
  into the Markdown body.
- **Unquoted date.** `publishDate: 2026-07-22` (no quotes) can be parsed inconsistently.
  Always quote it: `publishDate: "2026-07-22"`.
- **Invalid slug characters.** Spaces, underscores, or uppercase letters in `slug` fail
  validation. Only lowercase letters, numbers, and hyphens are allowed.
- **Wrong or mistyped `contentType`.** Must be exactly one of `news`, `education`,
  `trading-psychology`, `glossary`, `research`. `"News"` or `"Trading Psychology"` both fail.
- **`featuredImage` without `featuredImageAlt`.** If one is set, the other is required.
- **`featuredImage` or `canonicalURL` that is not a full URL.** A relative path or a bare
  domain without `https://` fails validation.
- **Malformed JSON-style arrays.** A trailing comma (`["a", "b",]`), an unquoted object key
  (`{title: "x"}` instead of `{"title": "x"}`), or a missing closing bracket all break YAML
  parsing. Copy the exact bracket structure shown in this document.
- **Duplicate `slug` across two files.** The schema validates each file independently and
  cannot catch this. Duplicate slugs produce two pages competing for the same URL. The
  automation must guarantee slug uniqueness before committing a file.
- **Missing a required field.** Any of the seven required fields listed in section 1 being
  absent or empty fails the build with a clear error naming the file and the field.

When a file fails validation, the build output names the exact file and field. For example,
an article saved with `slug: "Bad Slug With Spaces"` produces this, and the build exits with
a non-zero status and writes no output at all:

```
[InvalidContentEntryDataError] blog → Bad Slug With Spaces data does not match collection schema.

  slug: slug must be lowercase letters, numbers, and hyphens only, e.g. "how-leverage-works"

  Location:
    /path/to/src/content/blog/bad-slug-test.md:0:0
```

Fix the named file and re-run the build. A validation failure in one article fails the
entire build, so no articles go live until every article in the repository is valid.
