import { Injectable, inject } from '@angular/core';
import { type Note } from '../domain/note.model';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly repo = inject(NOTE_REPOSITORY);

  getNoteBySlug(slug: string): Promise<Note | undefined> {
    return this.repo.getNoteBySlug(slug);
  }

  getRecentNotes(count: number): Promise<readonly Note[]> {
    return this.repo.getRecentNotes(count);
  }
}
