import { describe, expect, it } from 'vitest';
import { validateFrontMatter, deriveTheme, deduplicateSlugs } from './build-content-index.mjs';

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
