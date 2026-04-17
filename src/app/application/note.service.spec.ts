import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoteService } from './note.service';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';
import { type NoteRepository } from '../domain/note-repository';
import { type Note } from '../domain/note.model';

const MOCK_NOTE: Note = {
  title: 'Bounded Context',
  slug: 'bounded-context-intro',
  tags: ['ddd'],
  created: '2026-04-01',
  updated: '2026-04-17',
  summary: 'Résumé.',
  draft: false,
  theme: 'ddd',
  content: '# Contenu',
};

describe('NoteService', () => {
  let mockRepo: NoteRepository;
  let service: NoteService;

  beforeEach(() => {
    mockRepo = {
      getNoteBySlug: vi.fn(),
      getRecentNotes: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [NoteService, { provide: NOTE_REPOSITORY, useValue: mockRepo }],
    });
    service = TestBed.inject(NoteService);
  });

  it('should return the note when getNoteBySlug is called with a valid slug', async () => {
    vi.mocked(mockRepo.getNoteBySlug).mockResolvedValue(MOCK_NOTE);
    const note = await service.getNoteBySlug('bounded-context-intro');
    expect(note).toEqual(MOCK_NOTE);
    expect(mockRepo.getNoteBySlug).toHaveBeenCalledWith('bounded-context-intro');
  });

  it('should return undefined when getNoteBySlug is called with unknown slug', async () => {
    vi.mocked(mockRepo.getNoteBySlug).mockResolvedValue(undefined);
    const note = await service.getNoteBySlug('inexistant');
    expect(note).toBeUndefined();
  });

  it('should return recent notes when getRecentNotes is called', async () => {
    vi.mocked(mockRepo.getRecentNotes).mockResolvedValue([MOCK_NOTE]);
    const notes = await service.getRecentNotes(5);
    expect(notes).toHaveLength(1);
    expect(mockRepo.getRecentNotes).toHaveBeenCalledWith(5);
  });
});
