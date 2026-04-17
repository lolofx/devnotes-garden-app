import { describe, expect, it } from 'vitest';
import { StaticNoteRepository } from './static-note-repository';

describe('StaticNoteRepository', () => {
  const repo = new StaticNoteRepository();

  it('should return the hardcoded note when getNoteBySlug is called with its slug', async () => {
    const note = await repo.getNoteBySlug('bounded-context-intro');
    expect(note).toBeDefined();
    expect(note?.slug).toBe('bounded-context-intro');
    expect(note?.title).toBeTruthy();
    expect(note?.content).toBeTruthy();
  });

  it('should return undefined when getNoteBySlug is called with unknown slug', async () => {
    const note = await repo.getNoteBySlug('unknown-slug');
    expect(note).toBeUndefined();
  });

  it('should return 1 note when getRecentNotes is called', async () => {
    const notes = await repo.getRecentNotes(5);
    expect(notes).toHaveLength(1);
  });

  it('should return note with all required fields populated', async () => {
    const notes = await repo.getRecentNotes(1);
    const note = notes[0];
    expect(note).toBeDefined();
    expect(note?.slug).toBeTruthy();
    expect(note?.tags.length).toBeGreaterThan(0);
    expect(note?.theme).toBeTruthy();
    expect(note?.summary).toBeTruthy();
  });
});
