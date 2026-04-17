export interface Note {
  readonly title: string;
  readonly slug: string;
  readonly tags: readonly string[];
  readonly created: string;
  readonly updated: string;
  readonly summary: string;
  readonly draft: boolean;
  readonly theme: string;
  readonly content: string;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
