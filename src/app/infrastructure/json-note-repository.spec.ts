import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JsonNoteRepository } from './json-note-repository';
import { type NoteMetadata } from '../domain/note-metadata.model';

const MOCK_INDEX: NoteMetadata[] = [
  {
    title: 'Note B',
    slug: 'note-b',
    tags: ['ddd'],
    created: '2026-01-01',
    updated: '2026-04-17',
    summary: 'Résumé B.',
    draft: false,
    theme: 'ddd',
  },
  {
    title: 'Note A',
    slug: 'note-a',
    tags: ['bff'],
    created: '2026-01-01',
    updated: '2026-03-01',
    summary: 'Résumé A.',
    draft: false,
    theme: 'bff',
  },
];

describe('JsonNoteRepository', () => {
  let repo: JsonNoteRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonNoteRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repo = TestBed.inject(JsonNoteRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should return the 2 most recent notes when getRecentNotes is called', async () => {
    const promise = repo.getRecentNotes(2);
    httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
    const notes = await promise;
    expect(notes).toHaveLength(2);
    expect(notes[0]?.slug).toBe('note-b');
  });

  it('should cache the index and not fetch twice', async () => {
    const p1 = repo.getRecentNotes(5);
    httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
    await p1;
    const p2 = repo.getRecentNotes(5);
    httpMock.expectNone('/assets/content-index.json');
    await p2;
  });

  it('should fetch the note markdown when getNoteBySlug is called', async () => {
    const promise = repo.getNoteBySlug('note-b');
    httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
    await Promise.resolve();
    await Promise.resolve(); // .catch() handler adds one extra microtask tick
    httpMock.expectOne('/assets/content/ddd/note-b.md').flush('# Note B\n\nContenu.');
    const note = await promise;
    expect(note?.content).toContain('# Note B');
    expect(note?.slug).toBe('note-b');
  });

  it('should return empty array when content-index.json returns 404', async () => {
    const promise = repo.getRecentNotes(5);
    httpMock
      .expectOne('/assets/content-index.json')
      .flush('Not Found', { status: 404, statusText: 'Not Found' });
    const notes = await promise;
    expect(notes).toHaveLength(0);
  });

  it('should return undefined when getNoteBySlug is called with unknown slug', async () => {
    const promise = repo.getNoteBySlug('inexistant');
    httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
    const note = await promise;
    expect(note).toBeUndefined();
  });
});
