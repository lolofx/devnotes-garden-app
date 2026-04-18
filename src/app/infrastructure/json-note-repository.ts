import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { type Note } from '../domain/note.model';
import { type NoteMetadata } from '../domain/note-metadata.model';
import { type NoteRepository } from '../domain/note-repository';

@Injectable({ providedIn: 'root' })
export class JsonNoteRepository implements NoteRepository {
  private readonly http = inject(HttpClient);
  private indexCache: Promise<NoteMetadata[]> | null = null;

  private getIndex(): Promise<NoteMetadata[]> {
    this.indexCache ??= firstValueFrom(
      this.http.get<NoteMetadata[]>('/assets/content-index.json'),
    ).catch(() => []);
    return this.indexCache;
  }

  async getRecentNotes(count: number): Promise<readonly Note[]> {
    const index = await this.getIndex();
    return index.slice(0, count).map((meta) => ({ ...meta, content: '' }));
  }

  async getNoteBySlug(slug: string): Promise<Note | undefined> {
    const index = await this.getIndex();
    const meta = index.find((n) => n.slug === slug);
    if (!meta) return undefined;
    const content = await firstValueFrom(
      this.http.get(`/assets/content/${meta.theme}/${slug}.md`, { responseType: 'text' }),
    );
    return { ...meta, content };
  }
}
