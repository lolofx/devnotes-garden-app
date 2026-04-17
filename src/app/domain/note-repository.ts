import { type Note } from './note.model';

export interface NoteRepository {
  getNoteBySlug(slug: string): Promise<Note | undefined>;
  getRecentNotes(count: number): Promise<readonly Note[]>;
}
