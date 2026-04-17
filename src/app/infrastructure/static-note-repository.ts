import { type Note } from '../domain/note.model';
import { type NoteRepository } from '../domain/note-repository';

const HARDCODED_NOTE: Note = {
  title: 'Introduction au Bounded Context',
  slug: 'bounded-context-intro',
  tags: ['ddd', 'architecture', 'strategic-design'],
  created: '2026-04-01',
  updated: '2026-04-17',
  summary: 'Comment découper un système complexe en contextes métier cohérents.',
  draft: false,
  theme: 'ddd',
  content: `# Introduction au Bounded Context

Le **Bounded Context** est un patron stratégique du Domain-Driven Design (DDD).
Il définit une frontière explicite à l'intérieur de laquelle un modèle de domaine est cohérent.

## Pourquoi l'utiliser ?

Dans un système complexe, différentes parties de l'organisation utilisent les mêmes termes
avec des significations différentes. Par exemple, "Client" peut signifier :

- un prospect pour l'équipe commerciale
- un compte facturable pour la comptabilité
- un utilisateur authentifié pour l'équipe technique

Le Bounded Context permet d'isoler chaque modèle dans son propre espace de cohérence.

## Exemple

\`\`\`mermaid
graph LR
  A[Vente] -->|Bounded Context| B[CRM]
  C[Facturation] -->|Bounded Context| D[ERP]
  B -->|Context Map| D
\`\`\`
`,
};

export class StaticNoteRepository implements NoteRepository {
  async getNoteBySlug(slug: string): Promise<Note | undefined> {
    return HARDCODED_NOTE.slug === slug ? HARDCODED_NOTE : undefined;
  }

  async getRecentNotes(count: number): Promise<readonly Note[]> {
    return [HARDCODED_NOTE].slice(0, count);
  }
}
