import { type Note } from './note.model';

export interface Theme {
  readonly name: string;
  readonly notes: readonly Note[];
}
