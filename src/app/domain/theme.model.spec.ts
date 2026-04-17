import { describe, expect, it } from 'vitest';
import { type Theme } from './theme.model';
import { type Note } from './note.model';

describe('Theme', () => {
  it('should have name and notes properties', () => {
    const note: Note = {
      title: 'Bounded Context',
      slug: 'bounded-context-intro',
      tags: ['ddd'],
      created: '2026-04-01',
      updated: '2026-04-17',
      summary: 'Introduction au bounded context.',
      draft: false,
      theme: 'ddd',
      content: '# Bounded Context\n\nContenu de la note.',
    };
    const theme: Theme = { name: 'ddd', notes: [note] };
    expect(theme.name).toBe('ddd');
    expect(theme.notes).toHaveLength(1);
  });
});
