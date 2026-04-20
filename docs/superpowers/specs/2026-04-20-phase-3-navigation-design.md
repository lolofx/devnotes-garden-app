# Design — Phase 3 : Navigation complète

Date : 2026-04-20  
Branche : `feat/phase-3`  
Stratégie : une branche, une PR (Option A)

---

## Section 1 — Domain / Application

### NoteRepository (nouvelles méthodes)

```typescript
getAllTags(): Promise<readonly string[]>
getNotesByTag(tag: string): Promise<readonly Note[]>
searchNotes(query: string): Promise<readonly Note[]>
```

### Services applicatifs

**`TagService`** (`application/tag.service.ts`)  
- `getAllTags()` : délègue au repository, déduplique, trie alphabétiquement  
- `getNotesByTag(tag)` : délègue au repository

**`ThemeService`** (`application/theme.service.ts`)  
- `getAllThemes()` : retourne les thèmes distincts extraits des notes  
- `getNotesByTheme(theme)` : filtre par thème

**`SearchService`** (`application/search.service.ts`)  
- Encapsule Fuse.js  
- `search(query, notes)` : retourne les résultats scorés

### Routes ajoutées

```
/tags              → TagsListPage (lazy)
/tags/:tagName     → TagPage (lazy)
```

---

## Section 2 — Présentation

**`MainLayout`** — composant shell avec `<mat-sidenav-container>`. Header fixe (titre + `SearchBar` + futur `ThemeToggle`), sidebar gauche avec `SidebarNav`, zone contenu principal via `<router-outlet>`. Sur mobile (< 768px) : la sidenav passe en `mode="over"` avec un bouton hamburger.

**`NoteCard`** — composant standalone réutilisable. Inputs signal : `note` (titre, résumé, date, tags). Émet un `output()` `clicked` ou on utilise directement `[routerLink]`.

**`HomePage`** — refactorée : utilise `NoteCard` × 5, `toSignal` sur `noteService.getRecentNotes(5)`.

**`SidebarNav`** — consomme `ThemeService.getAllThemes()`, affiche arbre thème > notes via `@for`. État ouvert/fermé par thème en `signal<Set<string>>`, persisté en `localStorage`.

**`TagsListPage`** (`/tags`) + **`TagPage`** (`/tags/:tagName`) — lazy loadées, consomment `TagService`. Composant `TagBadge` standalone réutilisable (chip Material).

**`Breadcrumb`** — lit `ActivatedRoute` en `inject()`, construit le fil via `computed()`.

**`SearchBar`** — input lié à un `signal<string>`, debounce 200ms via `rxjs debounceTime` + `toSignal`, affiche résultats en `mat-autocomplete`.

---

## Section 3 — Stratégie de tests

TDD strict, couche par couche.

### Application — tests unitaires (vi.fn() sur repository)
- `NoteService` : 3 nouvelles méthodes testées
- `TagService` : déduplication et tri des tags
- `ThemeService` : lecture/écriture localStorage signal
- `SearchService` : intégration Fuse.js, résultats filtrés

### Infrastructure — tests d'intégration légère
- `JsonNoteRepository` : 3 nouvelles méthodes avec fixture JSON en mémoire (pas de vrai `fetch`)

### Presentation — tests composants via TestBed
- `NoteCard` : rendu avec signal inputs
- `SearchBar` : debounce, émission de résultats
- Pages : smoke tests (render sans erreur)

### Coverage cible
- **> 80%** sur `domain` + `application`
- Best-effort sur `infrastructure` et `presentation`

---

## Contraintes techniques

- Angular Material à installer : `ng add @angular/material`
- Fuse.js à installer : `npm install fuse.js`
- Aucune autre dépendance sans validation explicite
- Règles Angular 21 strictes : `inject()`, signals, `@if`/`@for`, standalone, zoneless
- Architecture Clean : presentation → application → domain ← infrastructure
- TypeScript strict : pas de `any`, pas de `as Foo` sauf narrowing
