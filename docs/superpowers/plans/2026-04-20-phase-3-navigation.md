# Phase 3 — Navigation complète : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter la navigation complète : MainLayout sidenav Material, SidebarNav par thèmes, SearchBar Fuse.js, pages Tags, NoteCard réutilisable, refacto HomePage.

**Architecture:** Clean Architecture allégée. Nouvelles méthodes NoteRepository (domain) → JsonNoteRepository (infrastructure) → TagService, ThemeService, SearchService, NoteService (application) → composants et pages (presentation). Pas de dépendance remontante.

**Tech Stack:** Angular 21 standalone/zoneless/signals, Angular Material 21 (M3), Fuse.js, Vitest, RxJS (toSignal/toObservable interop uniquement), TypeScript strict.

---

## File Structure

**Modifier :**
- `src/app/domain/note-repository.ts` — 3 nouvelles méthodes
- `src/app/application/note.service.ts` — 4 nouvelles méthodes
- `src/app/application/note.service.spec.ts` — tests des nouvelles méthodes
- `src/app/infrastructure/json-note-repository.ts` — implémenter les 3 méthodes
- `src/app/infrastructure/json-note-repository.spec.ts` — tests des 3 méthodes
- `src/app/app.routes.ts` — routes `/tags` et `/tags/:tagName`
- `src/app/app.ts` — importer `MainLayoutComponent`
- `src/app/app.html` — `<app-main-layout />` remplace `<router-outlet />`
- `src/app/app.config.ts` — `provideAnimationsAsync()`
- `src/styles.scss` — thème Angular Material
- `src/index.html` — polices Roboto + Material Icons
- `src/app/presentation/pages/home/home.page.ts` — refactor NoteCard + toSignal

**Créer :**
- `src/app/application/tag.service.ts` + `.spec.ts`
- `src/app/application/theme.service.ts` + `.spec.ts`
- `src/app/application/search.service.ts` + `.spec.ts`
- `src/app/presentation/layout/main-layout/main-layout.component.ts`
- `src/app/presentation/components/note-card/note-card.component.ts` + `.spec.ts`
- `src/app/presentation/components/sidebar-nav/sidebar-nav.component.ts`
- `src/app/presentation/components/tag-badge/tag-badge.component.ts`
- `src/app/presentation/components/search-bar/search-bar.component.ts` + `.spec.ts`
- `src/app/presentation/components/breadcrumb/breadcrumb.component.ts`
- `src/app/presentation/pages/tags/tags-list.page.ts`
- `src/app/presentation/pages/tags/tag.page.ts`

---

## Task 0 : Setup — Branche, Angular Material, Fuse.js

**Files:** `src/styles.scss`, `src/index.html`, `src/app/app.config.ts`, `package.json`

- [ ] **Step 1 : Créer la branche**
```bash
git checkout main && git pull && git checkout -b feat/phase-3
```

- [ ] **Step 2 : Installer les dépendances**
```bash
npm install @angular/material @angular/cdk fuse.js
```

- [ ] **Step 3 : Configurer le thème dans `src/styles.scss`**

> Note : vérifier la syntaxe exacte avec Context7 (`@angular/material` v21) — la syntaxe M3 peut différer. En cas de doute, utiliser `ng add @angular/material --skip-confirmation` qui configure tout automatiquement.

```scss
@use '@angular/material' as mat;

@include mat.core();

$theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,
  ),
  typography: (
    plain-family: Roboto,
    brand-family: Roboto,
  ),
));

html {
  @include mat.all-component-themes($theme);
}
```

- [ ] **Step 4 : Ajouter les polices dans `src/index.html`**

Dans `<head>` :
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

- [ ] **Step 5 : Ajouter `provideAnimationsAsync()` dans `src/app/app.config.ts`**
```typescript
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { NOTE_REPOSITORY } from './domain/note-repository.token';
import { JsonNoteRepository } from './infrastructure/json-note-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideMarkdown(),
    provideAnimationsAsync(),
    { provide: NOTE_REPOSITORY, useClass: JsonNoteRepository },
  ],
};
```

- [ ] **Step 6 : Vérifier le build**
```bash
rtk npm run build
```
Expected: build sans erreur TypeScript.

- [ ] **Step 7 : Commit**
```bash
rtk git add src/styles.scss src/index.html src/app/app.config.ts package.json package-lock.json
rtk git commit -m "chore(deps): installer Angular Material 21 et Fuse.js"
```

---

## Task 1 : Domain — étendre NoteRepository

**Files:** `src/app/domain/note-repository.ts`

- [ ] **Step 1 : Remplacer le contenu du fichier**
```typescript
import { type Note } from './note.model';
import { type Tag } from './tag.model';

export interface NoteRepository {
  getNoteBySlug(slug: string): Promise<Note | undefined>;
  getRecentNotes(count: number): Promise<readonly Note[]>;
  getAllNotes(): Promise<readonly Note[]>;
  getAllTags(): Promise<readonly Tag[]>;
  getNotesByTag(tag: string): Promise<readonly Note[]>;
}
```

Note : `getAllNotes()` retourne toutes les notes avec `content: ''` (pas de fetch Markdown). `getAllTags()` retourne les `Tag` avec `noteCount`.

- [ ] **Step 2 : Vérifier que TypeScript signale les erreurs sur l'implémentation manquante**
```bash
rtk tsc --noEmit
```
Expected: erreurs sur `JsonNoteRepository` (3 méthodes manquantes). C'est attendu.

- [ ] **Step 3 : Commit**
```bash
rtk git add src/app/domain/note-repository.ts
rtk git commit -m "feat(domain): étendre NoteRepository avec getAllNotes, getAllTags, getNotesByTag"
```

---

## Task 2 : Infrastructure — getAllNotes (TDD)

**Files:** `src/app/infrastructure/json-note-repository.ts`, `src/app/infrastructure/json-note-repository.spec.ts`

- [ ] **Step 1 : Ajouter le test dans `json-note-repository.spec.ts`**

Ajouter après les tests existants (le `MOCK_INDEX` existant contient `note-b` et `note-a`) :
```typescript
it('should return all notes without content when getAllNotes is called', async () => {
  const promise = repo.getAllNotes();
  httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
  const notes = await promise;
  expect(notes).toHaveLength(2);
  expect(notes[0]?.content).toBe('');
  expect(notes[0]?.slug).toBe('note-b');
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**
```bash
rtk npm run test
```
Expected: FAIL — `repo.getAllNotes is not a function`

- [ ] **Step 3 : Implémenter dans `json-note-repository.ts`**

Ajouter la méthode à la classe (l'import `Tag` sera ajouté en Task 3) :
```typescript
async getAllNotes(): Promise<readonly Note[]> {
  const index = await this.getIndex();
  return index.map((meta) => ({ ...meta, content: '' }));
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/infrastructure/json-note-repository.ts src/app/infrastructure/json-note-repository.spec.ts
rtk git commit -m "feat(infra): implémenter getAllNotes sur JsonNoteRepository"
```

---

## Task 3 : Infrastructure — getAllTags (TDD)

**Files:** `src/app/infrastructure/json-note-repository.ts`, `src/app/infrastructure/json-note-repository.spec.ts`

`MOCK_INDEX` existant : `note-b` (tags: `['ddd']`), `note-a` (tags: `['bff']`).

- [ ] **Step 1 : Ajouter le test**
```typescript
it('should return all tags with note count when getAllTags is called', async () => {
  const promise = repo.getAllTags();
  httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
  const tags = await promise;
  expect(tags).toHaveLength(2);
  const sorted = [...tags].sort((a, b) => a.name.localeCompare(b.name));
  expect(sorted[0]).toEqual({ name: 'bff', noteCount: 1 });
  expect(sorted[1]).toEqual({ name: 'ddd', noteCount: 1 });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**
```bash
rtk npm run test
```
Expected: FAIL — `repo.getAllTags is not a function`

- [ ] **Step 3 : Implémenter dans `json-note-repository.ts`**

Ajouter l'import en tête de fichier :
```typescript
import { type Tag } from '../domain/tag.model';
```

Ajouter la méthode :
```typescript
async getAllTags(): Promise<readonly Tag[]> {
  const index = await this.getIndex();
  const counts = new Map<string, number>();
  for (const note of index) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, noteCount]) => ({ name, noteCount }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/infrastructure/json-note-repository.ts src/app/infrastructure/json-note-repository.spec.ts
rtk git commit -m "feat(infra): implémenter getAllTags sur JsonNoteRepository"
```

---

## Task 4 : Infrastructure — getNotesByTag (TDD)

**Files:** `src/app/infrastructure/json-note-repository.ts`, `src/app/infrastructure/json-note-repository.spec.ts`

- [ ] **Step 1 : Ajouter les tests**
```typescript
it('should return notes filtered by tag when getNotesByTag is called', async () => {
  const promise = repo.getNotesByTag('ddd');
  httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
  const notes = await promise;
  expect(notes).toHaveLength(1);
  expect(notes[0]?.slug).toBe('note-b');
});

it('should return empty array when getNotesByTag is called with unknown tag', async () => {
  const promise = repo.getNotesByTag('unknown');
  httpMock.expectOne('/assets/content-index.json').flush(MOCK_INDEX);
  const notes = await promise;
  expect(notes).toHaveLength(0);
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**
```bash
rtk npm run test
```
Expected: FAIL — `repo.getNotesByTag is not a function`

- [ ] **Step 3 : Implémenter dans `json-note-repository.ts`**
```typescript
async getNotesByTag(tag: string): Promise<readonly Note[]> {
  const index = await this.getIndex();
  return index
    .filter((meta) => meta.tags.includes(tag))
    .map((meta) => ({ ...meta, content: '' }));
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/infrastructure/json-note-repository.ts src/app/infrastructure/json-note-repository.spec.ts
rtk git commit -m "feat(infra): implémenter getNotesByTag sur JsonNoteRepository"
```

---

## Task 5 : Application — TagService (TDD)

**Files:** `src/app/application/tag.service.ts`, `src/app/application/tag.service.spec.ts`

- [ ] **Step 1 : Créer `tag.service.spec.ts`**
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TagService } from './tag.service';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';
import { type NoteRepository } from '../domain/note-repository';
import { type Tag } from '../domain/tag.model';
import { type Note } from '../domain/note.model';

const MOCK_TAGS: Tag[] = [
  { name: 'architecture', noteCount: 2 },
  { name: 'ddd', noteCount: 5 },
];

const MOCK_NOTE: Note = {
  title: 'DDD Aggregates',
  slug: 'ddd-aggregates',
  tags: ['ddd'],
  created: '2026-01-01',
  updated: '2026-04-01',
  summary: 'Agrégats DDD.',
  draft: false,
  theme: 'ddd',
  content: '',
};

describe('TagService', () => {
  let mockRepo: NoteRepository;
  let service: TagService;

  beforeEach(() => {
    mockRepo = {
      getNoteBySlug: vi.fn(),
      getRecentNotes: vi.fn(),
      getAllNotes: vi.fn(),
      getAllTags: vi.fn(),
      getNotesByTag: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [TagService, { provide: NOTE_REPOSITORY, useValue: mockRepo }],
    });
    service = TestBed.inject(TagService);
  });

  it('should return all tags when getAllTags is called', async () => {
    vi.mocked(mockRepo.getAllTags).mockResolvedValue(MOCK_TAGS);
    const tags = await service.getAllTags();
    expect(tags).toEqual(MOCK_TAGS);
    expect(mockRepo.getAllTags).toHaveBeenCalledOnce();
  });

  it('should return notes filtered by tag when getNotesByTag is called', async () => {
    vi.mocked(mockRepo.getNotesByTag).mockResolvedValue([MOCK_NOTE]);
    const notes = await service.getNotesByTag('ddd');
    expect(notes).toHaveLength(1);
    expect(mockRepo.getNotesByTag).toHaveBeenCalledWith('ddd');
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**
```bash
rtk npm run test
```
Expected: FAIL — module `tag.service` not found.

- [ ] **Step 3 : Créer `tag.service.ts`**
```typescript
import { Injectable, inject } from '@angular/core';
import { type Tag } from '../domain/tag.model';
import { type Note } from '../domain/note.model';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly repo = inject(NOTE_REPOSITORY);

  getAllTags(): Promise<readonly Tag[]> {
    return this.repo.getAllTags();
  }

  getNotesByTag(tag: string): Promise<readonly Note[]> {
    return this.repo.getNotesByTag(tag);
  }
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/application/tag.service.ts src/app/application/tag.service.spec.ts
rtk git commit -m "feat(application): TagService avec getAllTags et getNotesByTag"
```

---

## Task 6 : Application — ThemeService (TDD)

**Files:** `src/app/application/theme.service.ts`, `src/app/application/theme.service.spec.ts`

- [ ] **Step 1 : Créer `theme.service.spec.ts`**
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';
import { type NoteRepository } from '../domain/note-repository';
import { type Note } from '../domain/note.model';

const MOCK_NOTES: Note[] = [
  {
    title: 'DDD Aggregates',
    slug: 'ddd-aggregates',
    tags: ['ddd'],
    created: '2026-01-01',
    updated: '2026-04-01',
    summary: 'Agrégats DDD.',
    draft: false,
    theme: 'ddd',
    content: '',
  },
  {
    title: 'Event Storming Intro',
    slug: 'event-storming-intro',
    tags: ['event-storming'],
    created: '2026-01-05',
    updated: '2026-04-05',
    summary: 'Introduction Event Storming.',
    draft: false,
    theme: 'event-storming',
    content: '',
  },
  {
    title: 'DDD Bounded Context',
    slug: 'ddd-bounded-context',
    tags: ['ddd'],
    created: '2026-01-10',
    updated: '2026-04-10',
    summary: 'Bounded context DDD.',
    draft: false,
    theme: 'ddd',
    content: '',
  },
];

describe('ThemeService', () => {
  let mockRepo: NoteRepository;
  let service: ThemeService;

  beforeEach(() => {
    mockRepo = {
      getNoteBySlug: vi.fn(),
      getRecentNotes: vi.fn(),
      getAllNotes: vi.fn(),
      getAllTags: vi.fn(),
      getNotesByTag: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: NOTE_REPOSITORY, useValue: mockRepo }],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should group notes by theme and sort alphabetically when getAllThemes is called', async () => {
    vi.mocked(mockRepo.getAllNotes).mockResolvedValue(MOCK_NOTES);
    const themes = await service.getAllThemes();
    expect(themes).toHaveLength(2);
    expect(themes[0]?.name).toBe('ddd');
    expect(themes[0]?.notes).toHaveLength(2);
    expect(themes[1]?.name).toBe('event-storming');
    expect(themes[1]?.notes).toHaveLength(1);
  });

  it('should return notes filtered by theme when getNotesByTheme is called', async () => {
    vi.mocked(mockRepo.getAllNotes).mockResolvedValue(MOCK_NOTES);
    const notes = await service.getNotesByTheme('ddd');
    expect(notes).toHaveLength(2);
    expect(notes.every((n) => n.theme === 'ddd')).toBe(true);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**
```bash
rtk npm run test
```
Expected: FAIL — module `theme.service` not found.

- [ ] **Step 3 : Créer `theme.service.ts`**
```typescript
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
    return notes.filter((n) => n.theme === theme);
  }
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/application/theme.service.ts src/app/application/theme.service.spec.ts
rtk git commit -m "feat(application): ThemeService avec getAllThemes et getNotesByTheme"
```

---

## Task 7 : Application — SearchService (TDD)

**Files:** `src/app/application/search.service.ts`, `src/app/application/search.service.spec.ts`

`SearchService.search(query, notes)` est synchrone (Fuse.js est synchrone). Prend les notes en paramètre, n'injecte rien.

- [ ] **Step 1 : Créer `search.service.spec.ts`**
```typescript
import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { type Note } from '../domain/note.model';

const MOCK_NOTES: Note[] = [
  {
    title: 'DDD Aggregates',
    slug: 'ddd-aggregates',
    tags: ['ddd', 'architecture'],
    created: '2026-01-01',
    updated: '2026-04-01',
    summary: 'Modélisation des agrégats en DDD.',
    draft: false,
    theme: 'ddd',
    content: '',
  },
  {
    title: 'Event Storming',
    slug: 'event-storming',
    tags: ['event-storming'],
    created: '2026-01-05',
    updated: '2026-04-05',
    summary: 'Atelier collaboratif de modélisation.',
    draft: false,
    theme: 'event-storming',
    content: '',
  },
  {
    title: 'Clean Architecture',
    slug: 'clean-architecture',
    tags: ['architecture'],
    created: '2026-01-10',
    updated: '2026-04-10',
    summary: 'Découplage et testabilité.',
    draft: false,
    theme: 'architecture',
    content: '',
  },
];

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SearchService] });
    service = TestBed.inject(SearchService);
  });

  it('should return empty array when query is empty', () => {
    expect(service.search('', MOCK_NOTES)).toHaveLength(0);
  });

  it('should return matching notes when query matches title', () => {
    const results = service.search('DDD', MOCK_NOTES);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((n) => n.slug === 'ddd-aggregates')).toBe(true);
  });

  it('should return matching notes when query matches tag', () => {
    const results = service.search('architecture', MOCK_NOTES);
    expect(results.some((n) => n.slug === 'ddd-aggregates')).toBe(true);
    expect(results.some((n) => n.slug === 'clean-architecture')).toBe(true);
  });

  it('should return empty array when query has no match', () => {
    expect(service.search('xxxxxxxxnotfound', MOCK_NOTES)).toHaveLength(0);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**
```bash
rtk npm run test
```
Expected: FAIL — module `search.service` not found.

- [ ] **Step 3 : Créer `search.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';
import { type Note } from '../domain/note.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  search(query: string, notes: readonly Note[]): readonly Note[] {
    if (!query.trim()) return [];
    const fuse = new Fuse(notes as Note[], {
      keys: ['title', 'summary', 'tags'],
      threshold: 0.4,
    });
    return fuse.search(query).map((r) => r.item);
  }
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/application/search.service.ts src/app/application/search.service.spec.ts
rtk git commit -m "feat(application): SearchService avec Fuse.js"
```

---

## Task 8 : Application — NoteService extension (TDD)

**Files:** `src/app/application/note.service.ts`, `src/app/application/note.service.spec.ts`

- [ ] **Step 1 : Mettre à jour `note.service.spec.ts`**

Ajouter les imports manquants en tête :
```typescript
import { SearchService } from './search.service';
import { type Tag } from '../domain/tag.model';
```

Mettre à jour `mockRepo` dans `beforeEach` pour inclure les nouvelles méthodes :
```typescript
mockRepo = {
  getNoteBySlug: vi.fn(),
  getRecentNotes: vi.fn(),
  getAllNotes: vi.fn(),
  getAllTags: vi.fn(),
  getNotesByTag: vi.fn(),
};
```

Ajouter `SearchService` aux providers du `TestBed.configureTestingModule` :
```typescript
TestBed.configureTestingModule({
  providers: [
    NoteService,
    SearchService,
    { provide: NOTE_REPOSITORY, useValue: mockRepo },
  ],
});
```

Ajouter la constante et les tests après les existants :
```typescript
const MOCK_TAG: Tag = { name: 'ddd', noteCount: 1 };

// dans describe('NoteService') :
it('should return all notes when getAllNotes is called', async () => {
  vi.mocked(mockRepo.getAllNotes).mockResolvedValue([MOCK_NOTE]);
  const notes = await service.getAllNotes();
  expect(notes).toHaveLength(1);
  expect(mockRepo.getAllNotes).toHaveBeenCalledOnce();
});

it('should return all tags when getAllTags is called', async () => {
  vi.mocked(mockRepo.getAllTags).mockResolvedValue([MOCK_TAG]);
  const tags = await service.getAllTags();
  expect(tags).toHaveLength(1);
  expect(mockRepo.getAllTags).toHaveBeenCalledOnce();
});

it('should return notes by tag when getNotesByTag is called', async () => {
  vi.mocked(mockRepo.getNotesByTag).mockResolvedValue([MOCK_NOTE]);
  const notes = await service.getNotesByTag('ddd');
  expect(notes).toHaveLength(1);
  expect(mockRepo.getNotesByTag).toHaveBeenCalledWith('ddd');
});

it('should return search results when searchNotes is called with matching query', async () => {
  vi.mocked(mockRepo.getAllNotes).mockResolvedValue([MOCK_NOTE]);
  const results = await service.searchNotes('Bounded');
  expect(results).toHaveLength(1);
  expect(results[0]?.slug).toBe('bounded-context-intro');
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**
```bash
rtk npm run test
```
Expected: FAIL — `service.getAllNotes is not a function`.

- [ ] **Step 3 : Remplacer le contenu de `note.service.ts`**
```typescript
import { Injectable, inject } from '@angular/core';
import { type Note } from '../domain/note.model';
import { type Tag } from '../domain/tag.model';
import { NOTE_REPOSITORY } from '../domain/note-repository.token';
import { SearchService } from './search.service';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly repo = inject(NOTE_REPOSITORY);
  private readonly searchService = inject(SearchService);

  getNoteBySlug(slug: string): Promise<Note | undefined> {
    return this.repo.getNoteBySlug(slug);
  }

  getRecentNotes(count: number): Promise<readonly Note[]> {
    return this.repo.getRecentNotes(count);
  }

  getAllNotes(): Promise<readonly Note[]> {
    return this.repo.getAllNotes();
  }

  getAllTags(): Promise<readonly Tag[]> {
    return this.repo.getAllTags();
  }

  getNotesByTag(tag: string): Promise<readonly Note[]> {
    return this.repo.getNotesByTag(tag);
  }

  async searchNotes(query: string): Promise<readonly Note[]> {
    const notes = await this.repo.getAllNotes();
    return this.searchService.search(query, notes);
  }
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/application/note.service.ts src/app/application/note.service.spec.ts
rtk git commit -m "feat(application): étendre NoteService avec getAllNotes, getAllTags, getNotesByTag, searchNotes"
```

---

## Task 9 : Présentation — NoteCard (TDD)

**Files:** `src/app/presentation/components/note-card/note-card.component.ts`, `.spec.ts`

- [ ] **Step 1 : Créer `note-card.component.spec.ts`**
```typescript
import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoteCardComponent } from './note-card.component';
import { type Note } from '../../../domain/note.model';

const MOCK_NOTE: Note = {
  title: 'DDD Aggregates',
  slug: 'ddd-aggregates',
  tags: ['ddd', 'architecture'],
  created: '2026-01-01',
  updated: '2026-04-01',
  summary: 'Modélisation des agrégats.',
  draft: false,
  theme: 'ddd',
  content: '',
};

describe('NoteCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoteCardComponent],
      providers: [provideRouter([])],
    });
  });

  it('should render the note title', () => {
    const fixture = TestBed.createComponent(NoteCardComponent);
    fixture.componentRef.setInput('note', MOCK_NOTE);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('DDD Aggregates');
  });

  it('should render the note summary', () => {
    const fixture = TestBed.createComponent(NoteCardComponent);
    fixture.componentRef.setInput('note', MOCK_NOTE);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Modélisation des agrégats.');
  });

  it('should have a link to the note page', () => {
    const fixture = TestBed.createComponent(NoteCardComponent);
    fixture.componentRef.setInput('note', MOCK_NOTE);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('/notes/ddd-aggregates');
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**
```bash
rtk npm run test
```
Expected: FAIL — module `note-card.component` not found.

- [ ] **Step 3 : Créer `note-card.component.ts`**
```typescript
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type Note } from '../../../domain/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="note-card">
      <h3>
        <a [routerLink]="['/notes', note().slug]">{{ note().title }}</a>
      </h3>
      <p class="note-card__summary">{{ note().summary }}</p>
      <div class="note-card__meta">
        <time>{{ note().updated }}</time>
        @for (tag of note().tags; track tag) {
          <span class="note-card__tag">{{ tag }}</span>
        }
      </div>
    </article>
  `,
})
export class NoteCardComponent {
  readonly note = input.required<Note>();
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/presentation/components/note-card/ 
rtk git commit -m "feat(presentation): composant NoteCard avec signal input"
```

---

## Task 10 : Présentation — TagBadge

**Files:** `src/app/presentation/components/tag-badge/tag-badge.component.ts`

- [ ] **Step 1 : Créer `tag-badge.component.ts`**
```typescript
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-tag-badge',
  standalone: true,
  imports: [RouterLink, MatChipsModule],
  template: `
    <a [routerLink]="['/tags', tag()]" class="tag-badge-link">
      <mat-chip>{{ tag() }}</mat-chip>
    </a>
  `,
})
export class TagBadgeComponent {
  readonly tag = input.required<string>();
}
```

- [ ] **Step 2 : Vérifier la compilation**
```bash
rtk tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3 : Commit**
```bash
rtk git add src/app/presentation/components/tag-badge/tag-badge.component.ts
rtk git commit -m "feat(presentation): composant TagBadge chip Material"
```

---

## Task 11 : Présentation — SearchBar (TDD)

**Files:** `src/app/presentation/components/search-bar/search-bar.component.ts`, `.spec.ts`

> Note : `fakeAsync/tick` peut ne pas fonctionner en zoneless Angular. Si les tests échouent pour cette raison, remplacer `fakeAsync/tick` par `async/await` + `await new Promise(r => setTimeout(r, 250))`.

- [ ] **Step 1 : Créer `search-bar.component.spec.ts`**
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SearchBarComponent } from './search-bar.component';
import { NoteService } from '../../../application/note.service';
import { SearchService } from '../../../application/search.service';
import { NOTE_REPOSITORY } from '../../../domain/note-repository.token';
import { type NoteRepository } from '../../../domain/note-repository';
import { type Note } from '../../../domain/note.model';

const MOCK_NOTE: Note = {
  title: 'DDD Aggregates',
  slug: 'ddd-aggregates',
  tags: ['ddd'],
  created: '2026-01-01',
  updated: '2026-04-01',
  summary: 'Agrégats DDD.',
  draft: false,
  theme: 'ddd',
  content: '',
};

describe('SearchBarComponent', () => {
  let mockRepo: NoteRepository;

  beforeEach(() => {
    mockRepo = {
      getNoteBySlug: vi.fn(),
      getRecentNotes: vi.fn(),
      getAllNotes: vi.fn().mockResolvedValue([MOCK_NOTE]),
      getAllTags: vi.fn(),
      getNotesByTag: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        NoteService,
        SearchService,
        { provide: NOTE_REPOSITORY, useValue: mockRepo },
      ],
    });
  });

  it('should render a search input', () => {
    const fixture = TestBed.createComponent(SearchBarComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input')).not.toBeNull();
  });

  it('should show results after debounce when query matches', fakeAsync(() => {
    const fixture = TestBed.createComponent(SearchBarComponent);
    fixture.detectChanges();
    fixture.componentInstance.query.set('DDD');
    tick(250);
    fixture.detectChanges();
    expect(fixture.componentInstance.results()).toHaveLength(1);
  }));
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**
```bash
rtk npm run test
```
Expected: FAIL — module `search-bar.component` not found.

- [ ] **Step 3 : Créer `search-bar.component.ts`**
```typescript
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, from, of } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { type Note } from '../../../domain/note.model';
import { NoteService } from '../../../application/note.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [RouterLink, MatAutocompleteModule, MatInputModule, MatFormFieldModule],
  template: `
    <mat-form-field appearance="outline" class="search-bar">
      <input
        matInput
        [matAutocomplete]="auto"
        placeholder="Rechercher..."
        (input)="query.set($any($event.target).value)"
      />
      <mat-autocomplete #auto="matAutocomplete">
        @for (note of results(); track note.slug) {
          <mat-option [routerLink]="['/notes', note.slug]">
            {{ note.title }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class SearchBarComponent {
  private readonly noteService = inject(NoteService);

  readonly query = signal('');
  readonly results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(200),
      switchMap((q) =>
        q.length > 1 ? from(this.noteService.searchNotes(q)) : of([] as readonly Note[]),
      ),
    ),
    { initialValue: [] as readonly Note[] },
  );
}
```

- [ ] **Step 4 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/presentation/components/search-bar/
rtk git commit -m "feat(presentation): SearchBar avec debounce et mat-autocomplete"
```

---

## Task 12 : Présentation — Breadcrumb

**Files:** `src/app/presentation/components/breadcrumb/breadcrumb.component.ts`

- [ ] **Step 1 : Créer `breadcrumb.component.ts`**
```typescript
import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

interface Crumb {
  label: string;
  link: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  notes: 'Notes',
  tags: 'Tags',
};

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav aria-label="breadcrumb" class="breadcrumb">
      <ol>
        <li><a routerLink="/">Accueil</a></li>
        @for (crumb of crumbs(); track crumb.link) {
          <li><a [routerLink]="crumb.link">{{ crumb.label }}</a></li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<Crumb[]>(() =>
    this.url()
      .split('/')
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: SEGMENT_LABELS[seg] ?? seg,
        link: '/' + arr.slice(0, i + 1).join('/'),
      })),
  );
}
```

- [ ] **Step 2 : Vérifier la compilation**
```bash
rtk tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3 : Commit**
```bash
rtk git add src/app/presentation/components/breadcrumb/breadcrumb.component.ts
rtk git commit -m "feat(presentation): composant Breadcrumb"
```

---

## Task 13 : Présentation — SidebarNav

**Files:** `src/app/presentation/components/sidebar-nav/sidebar-nav.component.ts`

- [ ] **Step 1 : Créer `sidebar-nav.component.ts`**
```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { ThemeService } from '../../../application/theme.service';
import { type Theme } from '../../../domain/theme.model';

const LS_KEY = 'sidebar-expanded-themes';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="sidebar-nav">
      <a routerLink="/" class="sidebar-nav__home">devnotes-garden</a>
      <ul class="sidebar-nav__themes">
        @for (theme of themes(); track theme.name) {
          <li class="sidebar-nav__theme">
            <button
              class="sidebar-nav__theme-toggle"
              (click)="toggleTheme(theme.name)"
              [attr.aria-expanded]="expandedThemes().has(theme.name)"
            >
              {{ theme.name }}
            </button>
            @if (expandedThemes().has(theme.name)) {
              <ul class="sidebar-nav__notes">
                @for (note of theme.notes; track note.slug) {
                  <li>
                    <a [routerLink]="['/notes', note.slug]">{{ note.title }}</a>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    </nav>
  `,
})
export class SidebarNavComponent implements OnInit {
  private readonly themeService = inject(ThemeService);

  readonly themes = toSignal(from(this.themeService.getAllThemes()), {
    initialValue: [] as readonly Theme[],
  });

  readonly expandedThemes = signal<Set<string>>(this.loadExpanded());

  ngOnInit(): void {
    if (this.expandedThemes().size === 0) {
      const first = this.themes()[0];
      if (first) {
        this.expandedThemes.set(new Set([first.name]));
      }
    }
  }

  toggleTheme(name: string): void {
    this.expandedThemes.update((set) => {
      const next = new Set(set);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  private loadExpanded(): Set<string> {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  }
}
```

- [ ] **Step 2 : Vérifier la compilation**
```bash
rtk tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3 : Commit**
```bash
rtk git add src/app/presentation/components/sidebar-nav/sidebar-nav.component.ts
rtk git commit -m "feat(presentation): SidebarNav avec accordéon thèmes et localStorage"
```

---

## Task 14 : Présentation — MainLayout + intégration App

**Files:** `src/app/presentation/layout/main-layout/main-layout.component.ts`, `src/app/app.ts`, `src/app/app.html`

- [ ] **Step 1 : Créer `main-layout.component.ts`**
```typescript
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SidebarNavComponent } from '../../components/sidebar-nav/sidebar-nav.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarNavComponent,
    SearchBarComponent,
    BreadcrumbComponent,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="layout-sidenav"
      >
        <app-sidebar-nav />
      </mat-sidenav>

      <mat-sidenav-content class="layout-content">
        <mat-toolbar class="layout-toolbar">
          @if (isMobile()) {
            <button mat-icon-button (click)="sidenav.toggle()" aria-label="Menu">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="layout-toolbar__title">devnotes-garden</span>
          <span class="layout-toolbar__spacer"></span>
          <app-search-bar />
        </mat-toolbar>

        <main class="layout-main">
          <app-breadcrumb />
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container { height: 100vh; }
    .layout-sidenav { width: 280px; }
    .layout-toolbar__spacer { flex: 1; }
    .layout-main { padding: 1.5rem; }
  `],
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );
}
```

- [ ] **Step 2 : Remplacer `src/app/app.ts`**
```typescript
import { Component } from '@angular/core';
import { MainLayoutComponent } from './presentation/layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
```

- [ ] **Step 3 : Remplacer `src/app/app.html`**
```html
<app-main-layout />
```

- [ ] **Step 4 : Vérifier la compilation**
```bash
rtk tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 5 : Commit**
```bash
rtk git add src/app/presentation/layout/ src/app/app.ts src/app/app.html
rtk git commit -m "feat(presentation): MainLayout shell avec sidenav Material et header"
```

---

## Task 15 : Présentation — Refactorer HomePage

**Files:** `src/app/presentation/pages/home/home.page.ts`

- [ ] **Step 1 : Remplacer le contenu de `home.page.ts`**
```typescript
import { Component, inject } from '@angular/core';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NoteService } from '../../../application/note.service';
import { NoteCardComponent } from '../../components/note-card/note-card.component';
import { type Note } from '../../../domain/note.model';

const FALLBACK_NOTES: readonly Note[] = [
  {
    title: 'Contenu en cours de préparation',
    slug: 'coming-soon',
    summary: 'Les notes arriveront bientôt. Le jardin est en train de pousser.',
    content: '',
    tags: ['meta'],
    theme: 'meta',
    created: new Date().toISOString().slice(0, 10),
    updated: new Date().toISOString().slice(0, 10),
    draft: false,
  },
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NoteCardComponent],
  template: `
    <div class="home-page">
      <h1>Notes récentes</h1>
      @for (note of notes() ?? fallback; track note.slug) {
        <app-note-card [note]="note" />
      }
    </div>
  `,
})
export class HomePage {
  private readonly noteService = inject(NoteService);

  readonly notes = toSignal(from(this.noteService.getRecentNotes(5)));
  readonly fallback = FALLBACK_NOTES;
}
```

- [ ] **Step 2 : Lancer les tests**
```bash
rtk npm run test
```
Expected: tous les tests PASS.

- [ ] **Step 3 : Commit**
```bash
rtk git add src/app/presentation/pages/home/home.page.ts
rtk git commit -m "refactor(presentation): HomePage utilise NoteCard et toSignal"
```

---

## Task 16 : Présentation — TagsListPage + TagPage

**Files:** `src/app/presentation/pages/tags/tags-list.page.ts`, `src/app/presentation/pages/tags/tag.page.ts`

- [ ] **Step 1 : Créer `tags-list.page.ts`**
```typescript
import { Component, inject } from '@angular/core';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TagService } from '../../../application/tag.service';
import { TagBadgeComponent } from '../../components/tag-badge/tag-badge.component';

@Component({
  selector: 'app-tags-list-page',
  standalone: true,
  imports: [TagBadgeComponent],
  template: `
    <div class="tags-list-page">
      <h1>Tags</h1>
      <div class="tags-list">
        @for (tag of tags() ?? []; track tag.name) {
          <app-tag-badge [tag]="tag.name" />
          <span class="tag-count">({{ tag.noteCount }})</span>
        }
      </div>
    </div>
  `,
})
export class TagsListPage {
  private readonly tagService = inject(TagService);
  readonly tags = toSignal(from(this.tagService.getAllTags()));
}
```

- [ ] **Step 2 : Créer `tag.page.ts`**
```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { TagService } from '../../../application/tag.service';
import { NoteCardComponent } from '../../components/note-card/note-card.component';
import { type Note } from '../../../domain/note.model';

@Component({
  selector: 'app-tag-page',
  standalone: true,
  imports: [NoteCardComponent],
  template: `
    <div class="tag-page">
      <h1>#{{ tagName() }}</h1>
      @for (note of notes(); track note.slug) {
        <app-note-card [note]="note" />
      } @empty {
        <p>Aucune note pour ce tag.</p>
      }
    </div>
  `,
})
export class TagPage {
  private readonly route = inject(ActivatedRoute);
  private readonly tagService = inject(TagService);

  readonly tagName = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('tagName') ?? '')),
    { initialValue: '' },
  );

  readonly notes = toSignal<readonly Note[]>(
    this.route.paramMap.pipe(
      map((p) => p.get('tagName') ?? ''),
      switchMap((tag) => from(this.tagService.getNotesByTag(tag))),
    ),
    { initialValue: [] },
  );
}
```

- [ ] **Step 3 : Vérifier la compilation**
```bash
rtk tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 4 : Commit**
```bash
rtk git add src/app/presentation/pages/tags/
rtk git commit -m "feat(presentation): TagsListPage et TagPage lazy"
```

---

## Task 17 : Routing + validation finale

**Files:** `src/app/app.routes.ts`

- [ ] **Step 1 : Remplacer `app.routes.ts`**
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'notes/:slug',
    loadComponent: () => import('./presentation/pages/note/note.page').then((m) => m.NotePage),
  },
  {
    path: 'tags',
    loadComponent: () =>
      import('./presentation/pages/tags/tags-list.page').then((m) => m.TagsListPage),
  },
  {
    path: 'tags/:tagName',
    loadComponent: () =>
      import('./presentation/pages/tags/tag.page').then((m) => m.TagPage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./presentation/pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
```

- [ ] **Step 2 : Vérification finale complète**
```bash
rtk npm run lint && rtk npm run test && rtk npm run build
```
Expected: lint vert, tous les tests PASS, build OK.

- [ ] **Step 3 : Commit**
```bash
rtk git add src/app/app.routes.ts
rtk git commit -m "feat(routing): ajouter routes /tags et /tags/:tagName"
```

---

## Notes importantes

- **Angular Material Sass (Task 0)** : si `mat.define-theme()` n'est pas reconnu, vérifier avec Context7 la syntaxe exacte pour Angular Material 21. Alternativement : `ng add @angular/material --skip-confirmation` configure tout automatiquement.
- **SearchBar zoneless (Task 11)** : si `fakeAsync/tick` échoue en zoneless, remplacer par `async/await` + `await new Promise(r => setTimeout(r, 250))`.
- **Fuse.js import** : si `import Fuse from 'fuse.js'` échoue, essayer `import Fuse = require('fuse.js')` selon la config `moduleResolution` du tsconfig.
