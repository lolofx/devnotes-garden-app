import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TagService } from './tag.service';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';
import { type NoteRepository } from '../domain/note-repository';
import { type Tag } from '../domain/tag.model';
import { type Note } from '../domain/note.model';

const MOCK_TAGS: Tag[] = [
  { name: 'architecture', noteCount: 2 },
  { name: 'ddd', noteCount: 5 },
];

const MOCK_NOTE: Note = {
  title: 'DDD Aggregates',
  slug: 'ddd-aggregates',
  tags: ['ddd'],
  created: '2026-01-01',
  updated: '2026-04-01',
  summary: 'Agrégats DDD.',
  draft: false,
  theme: 'ddd',
  content: '',
};

describe('TagService', () => {
  let mockRepo: NoteRepository;
  let service: TagService;

  beforeEach(() => {
    mockRepo = {
      getNoteBySlug: vi.fn(),
      getRecentNotes: vi.fn(),
      getAllNotes: vi.fn(),
      getAllTags: vi.fn(),
      getNotesByTag: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [TagService, { provide: NOTE_REPOSITORY, useValue: mockRepo }],
    });
    service = TestBed.inject(TagService);
  });

  it('should return all tags when getAllTags is called', async () => {
    vi.mocked(mockRepo.getAllTags).mockResolvedValue(MOCK_TAGS);
    const tags = await service.getAllTags();
    expect(tags).toEqual(MOCK_TAGS);
    expect(mockRepo.getAllTags).toHaveBeenCalledOnce();
  });

  it('should return notes filtered by tag when getNotesByTag is called', async () => {
    vi.mocked(mockRepo.getNotesByTag).mockResolvedValue([MOCK_NOTE]);
    const notes = await service.getNotesByTag('ddd');
    expect(notes).toHaveLength(1);
    expect(mockRepo.getNotesByTag).toHaveBeenCalledWith('ddd');
  });
});
