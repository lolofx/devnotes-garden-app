import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';
import { type NoteRepository } from '../domain/note-repository';
import { type Note } from '../domain/note.model';

const MOCK_NOTES: Note[] = [
  {
    title: 'DDD Aggregates',
    slug: 'ddd-aggregates',
    tags: ['ddd'],
    created: '2026-01-01',
    updated: '2026-04-01',
    summary: 'Agrégats DDD.',
    draft: false,
    theme: 'ddd',
    content: '',
  },
  {
    title: 'Event Storming Intro',
    slug: 'event-storming-intro',
    tags: ['event-storming'],
    created: '2026-01-05',
    updated: '2026-04-05',
    summary: 'Introduction Event Storming.',
    draft: false,
    theme: 'event-storming',
    content: '',
  },
  {
    title: 'DDD Bounded Context',
    slug: 'ddd-bounded-context',
    tags: ['ddd'],
    created: '2026-01-10',
    updated: '2026-04-10',
    summary: 'Bounded context DDD.',
    draft: false,
    theme: 'ddd',
    content: '',
  },
];

describe('ThemeService', () => {
  let mockRepo: NoteRepository;
  let service: ThemeService;

  beforeEach(() => {
    mockRepo = {
      getNoteBySlug: vi.fn(),
      getRecentNotes: vi.fn(),
      getAllNotes: vi.fn(),
      getAllTags: vi.fn(),
      getNotesByTag: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: NOTE_REPOSITORY, useValue: mockRepo }],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should group notes by theme and sort alphabetically when getAllThemes is called', async () => {
    vi.mocked(mockRepo.getAllNotes).mockResolvedValue(MOCK_NOTES);
    const themes = await service.getAllThemes();
    expect(themes).toHaveLength(2);
    expect(themes[0]?.name).toBe('ddd');
    expect(themes[0]?.notes).toHaveLength(2);
    expect(themes[1]?.name).toBe('event-storming');
    expect(themes[1]?.notes).toHaveLength(1);
  });

  it('should return notes filtered by theme when getNotesByTheme is called', async () => {
    vi.mocked(mockRepo.getAllNotes).mockResolvedValue(MOCK_NOTES);
    const notes = await service.getNotesByTheme('ddd');
    expect(notes).toHaveLength(2);
    expect(notes.every((n) => n.theme === 'ddd')).toBe(true);
  });
});
