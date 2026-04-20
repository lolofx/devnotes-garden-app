import { Injectable, inject } from '@angular/core';
import { type Tag } from '../domain/tag.model';
import { type Note } from '../domain/note.model';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly repo = inject(NOTE_REPOSITORY);

  getAllTags(): Promise<readonly Tag[]> {
    return this.repo.getAllTags();
  }

  getNotesByTag(tag: string): Promise<readonly Note[]> {
    return this.repo.getNotesByTag(tag);
  }
}
