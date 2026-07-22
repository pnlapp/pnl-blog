import { CONTENT_TYPES } from '../content.config';

export type ContentType = (typeof CONTENT_TYPES)[number];

export interface Section {
  contentType: ContentType;
  /** URL path segment, e.g. `/news` */
  path: string;
  label: string;
  description: string;
  /** Longer SEO-oriented introduction shown on the category landing page. */
  intro: string;
}

// Single source of truth mapping each contentType to its route/nav metadata.
// Keep this in sync with CONTENT_TYPES in src/content.config.ts.
export const SECTIONS: Section[] = [
  {
    contentType: 'news',
    path: '/news',
    label: 'News',
    description: 'Market-moving news and trading headlines.',
    intro:
      'Markets move fast, and prices react to more than the headline. PnL App News tracks the events, data releases, and order flow shifts that actually move the tape, with the context you need to trade what happened instead of reacting to the noise.',
  },
  {
    contentType: 'education',
    path: '/education',
    label: 'Education',
    description: 'Guides and tutorials for traders at every level.',
    intro:
      'PnL App Education breaks trading down into skills you can actually practice: reading price action, managing risk, structuring a strategy, and understanding the mechanics behind every chart. Built for traders who want a foundation that holds up in live markets.',
  },
  {
    contentType: 'trading-psychology',
    path: '/trading-psychology',
    label: 'Trading Psychology',
    description: 'Mindset, discipline, and behavioral insights for traders.',
    intro:
      'Most losing trades start in the mind, not the chart. This is where PnL App unpacks discipline, bias, and the behavioral patterns that separate consistent traders from everyone else, using the same behavioral science that powers the PnL App itself.',
  },
  {
    contentType: 'glossary',
    path: '/glossary',
    label: 'Glossary',
    description: 'Definitions of trading and financial terms.',
    intro:
      'Trading has its own language. The PnL App Glossary defines the terms, indicators, and market structure concepts you will run into across every other section of this publication, written in plain terms rather than textbook jargon.',
  },
  {
    contentType: 'research',
    path: '/research',
    label: 'Research',
    description: 'In-depth analysis and data-driven research.',
    intro:
      'Original data and analysis from the PnL App team, covering trader behavior, market structure, and the patterns behind profit and loss. Research here is grounded in real trading data, not theory alone.',
  },
];

export function getSection(contentType: ContentType): Section {
  const section = SECTIONS.find((s) => s.contentType === contentType);
  if (!section) {
    throw new Error(`Unknown contentType: ${contentType}`);
  }
  return section;
}
