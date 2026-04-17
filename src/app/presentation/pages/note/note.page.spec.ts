import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NotePage } from './note.page';
import { NoteService } from '../../../application/note.service';
import { type Note } from '../../../domain/note.model';

const MOCK_NOTE: Note = {
  title: 'Bounded Context',
  slug: 'bounded-context-intro',
  tags: ['ddd'],
  created: '2026-04-01',
  updated: '2026-04-17',
  summary: 'Résumé de la note.',
  draft: false,
  theme: 'ddd',
  content: '# Bounded Context\n\nContenu.',
};

describe('NotePage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotePage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'bounded-context-intro' } } },
        },
        {
          provide: NoteService,
          useValue: { getNoteBySlug: vi.fn().mockResolvedValue(MOCK_NOTE) },
        },
      ],
    });
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(NotePage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
