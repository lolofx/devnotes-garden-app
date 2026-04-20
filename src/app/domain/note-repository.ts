import { type Note } from './note.model';
import { type Tag } from './tag.model';

export interface NoteRepository {
  getNoteBySlug(slug: string): Promise<Note | undefined>;
  getRecentNotes(count: number): Promise<readonly Note[]>;
  getAllNotes(): Promise<readonly Note[]>;
  getAllTags(): Promise<readonly Tag[]>;
  getNotesByTag(tag: string): Promise<readonly Note[]>;
}
