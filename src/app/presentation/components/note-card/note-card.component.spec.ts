import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoteCardComponent } from './note-card.component';
import { type Note } from '../../../domain/note.model';

const MOCK_NOTE: Note = {
  title: 'DDD Aggregates',
  slug: 'ddd-aggregates',
  tags: ['ddd', 'architecture'],
  created: '2026-01-01',
  updated: '2026-04-01',
  summary: 'Modélisation des agrégats.',
  draft: false,
  theme: 'ddd',
  content: '',
};

describe('NoteCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoteCardComponent],
      providers: [provideRouter([])],
    });
  });

  it('should render the note title', () => {
    const fixture = TestBed.createComponent(NoteCardComponent);
    fixture.componentRef.setInput('note', MOCK_NOTE);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('DDD Aggregates');
  });

  it('should render the note summary', () => {
    const fixture = TestBed.createComponent(NoteCardComponent);
    fixture.componentRef.setInput('note', MOCK_NOTE);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Modélisation des agrégats.');
  });

  it('should have a link to the note page', () => {
    const fixture = TestBed.createComponent(NoteCardComponent);
    fixture.componentRef.setInput('note', MOCK_NOTE);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('/notes/ddd-aggregates');
  });
});
