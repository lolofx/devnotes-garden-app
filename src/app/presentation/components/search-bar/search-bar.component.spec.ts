import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SearchBarComponent } from './search-bar.component';
import { NoteService } from '../../../application/note.service';
import { SearchService } from '../../../application/search.service';
import { NOTE_REPOSITORY } from '../../../domain/note-repository.token';
import { type NoteRepository } from '../../../domain/note-repository';
import { type Note } from '../../../domain/note.model';

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

describe('SearchBarComponent', () => {
  let mockRepo: NoteRepository;

  beforeEach(() => {
    mockRepo = {
      getNoteBySlug: vi.fn(),
      getRecentNotes: vi.fn(),
      getAllNotes: vi.fn().mockResolvedValue([MOCK_NOTE]),
      getAllTags: vi.fn(),
      getNotesByTag: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        NoteService,
        SearchService,
        { provide: NOTE_REPOSITORY, useValue: mockRepo },
      ],
    });
  });

  it('should render a search input', () => {
    const fixture = TestBed.createComponent(SearchBarComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input')).not.toBeNull();
  });

  it('should show results after debounce when query matches', async () => {
    const fixture = TestBed.createComponent(SearchBarComponent);
    fixture.detectChanges();
    fixture.componentInstance.query.set('DDD');
    await new Promise((r) => setTimeout(r, 250));
    fixture.detectChanges();
    expect(fixture.componentInstance.results()).toHaveLength(1);
  });
});
