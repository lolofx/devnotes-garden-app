import { Injectable, inject } from '@angular/core';
import { type Note } from '../domain/note.model';
import { type Tag } from '../domain/tag.model';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';
import { SearchService } from './search.service';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly repo = inject(NOTE_REPOSITORY);
  private readonly searchService = inject(SearchService);

  getNoteBySlug(slug: string): Promise<Note | undefined> {
    return this.repo.getNoteBySlug(slug);
  }

  getRecentNotes(count: number): Promise<readonly Note[]> {
    return this.repo.getRecentNotes(count);
  }

  getAllNotes(): Promise<readonly Note[]> {
    return this.repo.getAllNotes();
  }

  getAllTags(): Promise<readonly Tag[]> {
    return this.repo.getAllTags();
  }

  getNotesByTag(tag: string): Promise<readonly Note[]> {
    return this.repo.getNotesByTag(tag);
  }

  async searchNotes(query: string): Promise<readonly Note[]> {
    const notes = await this.repo.getAllNotes();
    return this.searchService.search(query, notes);
  }
}
