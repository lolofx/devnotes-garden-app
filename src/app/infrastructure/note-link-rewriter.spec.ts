import { describe, it, expect } from 'vitest';
import { rewriteNoteLinks } from './note-link-rewriter';

describe('rewriteNoteLinks', () => {
  it('should rewrite a ./slug link to /notes/slug', () => {
    expect(rewriteNoteLinks('[voir](./bounded-context)')).toBe('[voir](/notes/bounded-context)');
  });

  it('should rewrite a ./slug.md link and strip the .md extension', () => {
    expect(rewriteNoteLinks('[voir](./bounded-context.md)')).toBe('[voir](/notes/bounded-context)');
  });

  it('should rewrite a ../theme/slug.md link using only the basename', () => {
    expect(rewriteNoteLinks('[voir](../event-storming/es-intro.md)')).toBe(
      '[voir](/notes/es-intro)',
    );
  });

  it('should rewrite a ../theme/slug link using only the basename', () => {
    expect(rewriteNoteLinks('[voir](../ddd/aggregate)')).toBe('[voir](/notes/aggregate)');
  });

  it('should not rewrite https:// links', () => {
    const input = '[voir](https://example.com)';
    expect(rewriteNoteLinks(input)).toBe(input);
  });

  it('should not rewrite absolute /notes/ links', () => {
    const input = '[voir](/notes/bounded-context)';
    expect(rewriteNoteLinks(input)).toBe(input);
  });

  it('should not rewrite anchor links', () => {
    const input = '[voir](#section)';
    expect(rewriteNoteLinks(input)).toBe(input);
  });

  it('should not rewrite image syntax', () => {
    const input = '![schema](./schema.png)';
    expect(rewriteNoteLinks(input)).toBe(input);
  });

  it('should rewrite multiple links in the same content', () => {
    const input = 'Voir [A](./note-a) et [B](./note-b.md).';
    expect(rewriteNoteLinks(input)).toBe('Voir [A](/notes/note-a) et [B](/notes/note-b).');
  });

  it('should return content unchanged when there are no relative links', () => {
    const input = '# Titre\n\nDu texte sans liens.';
    expect(rewriteNoteLinks(input)).toBe(input);
  });
});
