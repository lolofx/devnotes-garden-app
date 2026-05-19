import { Component } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { parseContentSegments } from '../../../infrastructure/content-segment-parser';
import { MermaidRendererComponent } from '../../components/mermaid-renderer/mermaid-renderer.component';

const SHOWCASE_CONTENT = `
# Titres et typographie

## H2 — Section principale

### H3 — Sous-section

#### H4 — Détail

---

## Texte

Paragraphe normal avec du texte courant. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

**Texte en gras** et *texte en italique* et ***gras + italique***.

Du \`code inline\` dans une phrase, et un [lien externe](https://angular.dev) pour tester les couleurs.

---

## Listes

### Non ordonnée

- Premier élément simple
- Deuxième élément
  - Sous-élément imbriqué
  - Autre sous-élément
    - Niveau 3
- Troisième élément

### Ordonnée

1. Étape une
2. Étape deux
   1. Sous-étape
   2. Autre sous-étape
3. Étape trois

### Mixte

- Feature A
  1. Implémentation
  2. Tests
- Feature B
  - Backend
  - Frontend

---

## Blockquote

> Une citation simple sur une ligne.

> Blockquote multi-ligne.
> Avec du **gras** à l'intérieur et du \`code\`.
>
> Deuxième paragraphe dans la même citation.

---

## Code

Bloc Python :

\`\`\`python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))  # 55
\`\`\`

Bloc TypeScript :

\`\`\`typescript
interface Note {
  slug: string;
  title: string;
  tags: string[];
}

const getRecentNotes = (notes: Note[], count: number): Note[] =>
  notes.slice(0, count);
\`\`\`

Bloc sans langage :

\`\`\`
texte brut
sans coloration syntaxique
\`\`\`

---

## Tableaux

| Colonne A     | Colonne B    | Nombre |
|---------------|--------------|--------|
| Alpha         | Omega        | 42     |
| Beta          | Sigma        | 7      |
| **Gamma**     | *Delta*      | 100    |
| \`code\`      | Texte long avec beaucoup de contenu | 0 |

---

## Diagramme Mermaid — Flowchart

\`\`\`mermaid
flowchart LR
  A([Début]) --> B{Condition ?}
  B -- Oui --> C[Action A]
  B -- Non --> D[Action B]
  C --> E([Fin])
  D --> E
\`\`\`

## Diagramme Mermaid — Sequence

\`\`\`mermaid
sequenceDiagram
  participant U as Utilisateur
  participant A as Angular App
  participant R as Repository

  U->>A: Clique sur une note
  A->>R: getNoteBySlug(slug)
  R-->>A: Note { content }
  A-->>U: Affiche le markdown rendu
\`\`\`

---

## Règle horizontale

Avant

---

Après

---

## Liens

- [Lien simple](https://angular.dev)
- [Lien avec **gras** dans le texte](https://angular.dev)
- <https://angular.dev> (lien automatique)
`;

@Component({
  selector: 'app-dev-preview',
  standalone: true,
  imports: [MarkdownComponent, MermaidRendererComponent],
  styleUrl: '../note/note.page.scss',
  template: `
    <div class="note-page">
      <article>
        <header>
          <h1>Dev — Markdown Showcase</h1>
          <p class="summary">Rendu complet de tous les éléments Markdown. Alpha-test uniquement.</p>
          <div class="tags">
            <span class="tag">dev-only</span>
            <span class="tag">showcase</span>
          </div>
        </header>

        @for (segment of segments; track $index) {
          @if (segment.type === 'markdown') {
            <markdown [data]="segment.content" />
          } @else {
            <app-mermaid-renderer [code]="segment.code" [lang]="segment.type" />
          }
        }
      </article>
    </div>
  `,
})
export class DevPreviewPage {
  readonly segments = parseContentSegments(SHOWCASE_CONTENT);
}
