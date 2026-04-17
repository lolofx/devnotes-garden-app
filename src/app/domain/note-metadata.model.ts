export interface NoteMetadata {
  readonly title: string;
  readonly slug: string;
  readonly tags: readonly string[];
  readonly created: string;
  readonly updated: string;
  readonly summary: string;
  readonly draft: boolean;
  readonly theme: string;
}
