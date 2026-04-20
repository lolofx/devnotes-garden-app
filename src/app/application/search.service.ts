import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';
import { type Note } from '../domain/note.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  search(query: string, notes: readonly Note[]): readonly Note[] {
    if (!query.trim()) return [];
    const fuse = new Fuse(notes, {
      keys: ['title', 'summary', 'tags'],
      threshold: 0.4,
    });
    return fuse.search(query).map((r) => r.item);
  }
}
