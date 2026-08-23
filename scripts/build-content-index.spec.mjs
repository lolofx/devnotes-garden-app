import { describe, expect, it } from 'vitest';
import {
  validateFrontMatter,
  deriveTheme,
  deduplicateSlugs,
  generateRssFeed,
  generateLlmsTxt,
} from './build-content-index.mjs';

describe('deriveTheme', () => {
  it('should extract theme from file path', () => {
    expect(deriveTheme('notes/ddd/bounded-context.md')).toBe('ddd');
    expect(deriveTheme('notes/event-storming/color-code.md')).toBe('event-storming');
  });
});

describe('validateFrontMatter', () => {
  const valid = {
    title: 'Titre',
    slug: 'mon-slug',
    tags: ['ddd'],
    created: '2026-01-01',
    updated: '2026-04-17',
    summary: 'Résumé.',
  };

  it('should return no errors for valid front matter', () => {
    expect(validateFrontMatter(valid)).toHaveLength(0);
  });

  it('should return error when title is missing', () => {
    const { title: _, ...rest } = valid;
    expect(validateFrontMatter(rest)).toContain('title manquant');
  });

  it('should return error when slug is missing', () => {
    const { slug: _, ...rest } = valid;
    expect(validateFrontMatter(rest)).toContain('slug manquant');
  });

  it('should return error when tags is missing', () => {
    const { tags: _, ...rest } = valid;
    expect(validateFrontMatter(rest)).toContain('tags manquant');
  });

  it('should return error when created is missing', () => {
    const { created: _, ...rest } = valid;
    expect(validateFrontMatter(rest)).toContain('created manquant');
  });

  it('should return error when updated is missing', () => {
    const { updated: _, ...rest } = valid;
    expect(validateFrontMatter(rest)).toContain('updated manquant');
  });

  it('should return error when summary is missing', () => {
    const { summary: _, ...rest } = valid;
    expect(validateFrontMatter(rest)).toContain('summary manquant');
  });
});

describe('deduplicateSlugs', () => {
  it('should keep only the most recently updated note when slugs collide', () => {
    const notes = [
      { slug: 'mon-slug', updated: '2026-01-01', title: 'Ancien' },
      { slug: 'mon-slug', updated: '2026-04-17', title: 'Récent' },
    ];
    const result = deduplicateSlugs(notes);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Récent');
  });

  it('should keep all notes when slugs are unique', () => {
    const notes = [
      { slug: 'slug-a', updated: '2026-01-01', title: 'A' },
      { slug: 'slug-b', updated: '2026-04-17', title: 'B' },
    ];
    expect(deduplicateSlugs(notes)).toHaveLength(2);
  });
});

describe('generateRssFeed', () => {
  const SITE_URL = 'https://garden.leplomb.work';

  const notes = [
    {
      slug: 'bounded-context-intro',
      title: 'Introduction au Bounded Context',
      summary: 'Comment découper un système complexe.',
      updated: '2026-04-16',
      tags: ['ddd'],
      theme: 'ddd',
    },
    {
      slug: 'event-storming-colors',
      title: 'Palette Event Storming',
      summary: 'Les couleurs normalisées.',
      updated: '2026-04-10',
      tags: ['event-storming'],
      theme: 'event-storming',
    },
  ];

  it('should return a string starting with xml declaration', () => {
    const xml = generateRssFeed(notes, SITE_URL);
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('should include channel title and link', () => {
    const xml = generateRssFeed(notes, SITE_URL);
    expect(xml).toContain('<title>devnotes·garden</title>');
    expect(xml).toContain(`<link>${SITE_URL}</link>`);
  });

  it('should include one item per note', () => {
    const xml = generateRssFeed(notes, SITE_URL);
    const itemCount = (xml.match(/<item>/g) ?? []).length;
    expect(itemCount).toBe(2);
  });

  it('should set item link and guid to note url', () => {
    const xml = generateRssFeed(notes, SITE_URL);
    expect(xml).toContain(`<link>${SITE_URL}/notes/bounded-context-intro</link>`);
    expect(xml).toContain(`<guid>${SITE_URL}/notes/bounded-context-intro</guid>`);
  });

  it('should format pubDate in RFC 822 format', () => {
    const xml = generateRssFeed(notes, SITE_URL);
    expect(xml).toMatch(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 00:00:00 \+0000<\/pubDate>/);
  });

  it('should escape XML special characters in title and summary', () => {
    const xml = generateRssFeed(
      [
        {
          slug: 'test',
          title: 'Titre & <test>',
          summary: 'Résumé avec "guillemets"',
          updated: '2026-01-01',
          tags: [],
          theme: 'ddd',
        },
      ],
      SITE_URL,
    );
    expect(xml).toContain('Titre &amp; &lt;test&gt;');
    expect(xml).toContain('Résumé avec &quot;guillemets&quot;');
  });

  it('should return no items when notes array is empty', () => {
    const xml = generateRssFeed([], SITE_URL);
    expect(xml).not.toContain('<item>');
  });
});

describe('generateLlmsTxt', () => {
  const notes = [
    { title: 'Ports & Adapters', slug: 'ports-et-adapters', summary: 'La règle de dépendance.', theme: 'hexagonal' },
    { title: 'Outbox Pattern', slug: 'outbox-pattern', summary: 'Publication fiable.', theme: 'messaging' },
    { title: 'Inbox Pattern', slug: 'inbox-pattern', summary: 'Consommation idempotente.', theme: 'messaging' },
  ];

  it('should start with the garden heading and a summary blockquote', () => {
    const output = generateLlmsTxt(notes);
    expect(output.startsWith('# devnotes·garden')).toBe(true);
    expect(output).toContain('\n> Notes techniques');
  });

  it('should group notes under one H2 section per theme, sorted alphabetically', () => {
    const output = generateLlmsTxt(notes);
    const themes = [...output.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(themes).toEqual(['hexagonal', 'messaging']);
  });

  it('should render one item per note with an absolute url and its summary', () => {
    const output = generateLlmsTxt(notes);
    expect(output).toContain(
      '- [Outbox Pattern](https://garden.leplomb.work/notes/outbox-pattern) : Publication fiable.',
    );
    expect([...output.matchAll(/^- \[/gm)]).toHaveLength(3);
  });

  it('should honour a custom site url', () => {
    const output = generateLlmsTxt(notes, 'https://example.test');
    expect(output).toContain('https://example.test/notes/inbox-pattern');
    expect(output).not.toContain('garden.leplomb.work');
  });

  it('should render the headers and no section when there is no note', () => {
    const output = generateLlmsTxt([]);
    expect(output).toContain('# devnotes·garden');
    expect(output).not.toContain('## ');
    expect(output).not.toContain('- [');
  });

  it('should leave markdown special characters untouched, unlike the xml feed', () => {
    const special = [{ title: 'A & B', slug: 'a-b', summary: 'Un <script> et une esperluette &.', theme: 'ddd' }];
    expect(generateLlmsTxt(special)).toContain('Un <script> et une esperluette &.');
    expect(generateRssFeed(special)).toContain('Un &lt;script&gt; et une esperluette &amp;.');
  });
});
