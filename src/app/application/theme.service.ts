import { Injectable, inject } from '@angular/core';
import { type Theme } from '../domain/theme.model';
import { type Note } from '../domain/note.model';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly repo = inject(NOTE_REPOSITORY);

  async getAllThemes(): Promise<readonly Theme[]> {
    const notes = await this.repo.getAllNotes();
    const map = new Map<string, Note[]>();
    for (const note of notes) {
      const group = map.get(note.theme) ?? [];
      group.push(note);
      map.set(note.theme, group);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, noteList]) => ({ name, notes: noteList }));
  }

  async getNotesByTheme(theme: string): Promise<readonly Note[]> {
    const notes = await this.repo.getAllNotes();
    return notes.filter((n: Note) => n.theme === theme);
  }
}
