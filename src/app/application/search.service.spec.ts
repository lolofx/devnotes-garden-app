import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { type Note } from '../domain/note.model';

const MOCK_NOTES: Note[] = [
  {
    title: 'DDD Aggregates',
    slug: 'ddd-aggregates',
    tags: ['ddd', 'architecture'],
    created: '2026-01-01',
    updated: '2026-04-01',
    summary: 'Modélisation des agrégats en DDD.',
    draft: false,
    theme: 'ddd',
    content: '',
  },
  {
    title: 'Event Storming',
    slug: 'event-storming',
    tags: ['event-storming'],
    created: '2026-01-05',
    updated: '2026-04-05',
    summary: 'Atelier collaboratif de modélisation.',
    draft: false,
    theme: 'event-storming',
    content: '',
  },
  {
    title: 'Clean Architecture',
    slug: 'clean-architecture',
    tags: ['architecture'],
    created: '2026-01-10',
    updated: '2026-04-10',
    summary: 'Découplage et testabilité.',
    draft: false,
    theme: 'architecture',
    content: '',
  },
];

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SearchService] });
    service = TestBed.inject(SearchService);
  });

  it('should return empty array when query is empty', () => {
    expect(service.search('', MOCK_NOTES)).toHaveLength(0);
  });

  it('should return matching notes when query matches title', () => {
    const results = service.search('DDD', MOCK_NOTES);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((n: Note) => n.slug === 'ddd-aggregates')).toBe(true);
  });

  it('should return matching notes when query matches tag', () => {
    const results = service.search('architecture', MOCK_NOTES);
    expect(results.some((n: Note) => n.slug === 'ddd-aggregates')).toBe(true);
    expect(results.some((n: Note) => n.slug === 'clean-architecture')).toBe(true);
  });

  it('should return empty array when query has no match', () => {
    expect(service.search('xxxxxxxxnotfound', MOCK_NOTES)).toHaveLength(0);
  });
});
