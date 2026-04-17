# CLAUDE.md — Règles projet pour Claude Code

> Ce fichier est lu par Claude Code à chaque session. Il contient les règles, conventions et workflows à respecter strictement.

## Contexte projet

Digital garden personnel Angular 21, hébergé sur Azure Static Web Apps, qui affiche des notes Markdown (depuis un repo GitHub séparé) avec un rendu soigné et des diagrammes Mermaid aux couleurs Event Storming normalisées.

**Documents de référence (à lire avant toute action) :**
- `docs/SPEC.md` — spécification fonctionnelle (cas d'usage, règles métier)
- `docs/ARCHITECTURE.md` — architecture technique (Clean Archi allégée, structure dossiers)
- `docs/ROADMAP.md` — découpe en phases et tickets

---

## Environnement de développement

- **OS** : Windows (utiliser la syntaxe bash Unix via Git Bash, pas PowerShell)
- **Python** : non installé — ne jamais utiliser Python ni de scripts `.py`
- **RTK** : toutes les commandes bash doivent être préfixées par `rtk` (ex : `rtk npm run build`, `rtk git status`). Voir le global `CLAUDE.md` pour la référence complète.

---

## Stack obligatoire

- **Angular 21** (standalone, zoneless, signals, Angular Material 21)
- **TypeScript strict** (`strict: true` + flags additionnels, voir §TypeScript)
- **Vitest** pour les tests (runner par défaut d'Angular 21)
- **SCSS** pour le styling (pas de CSS-in-JS, pas de Tailwind)
- **npm** comme gestionnaire de packages
- **ESLint 9 flat config** + **Prettier** + **Husky** + **lint-staged** + **commitlint**
- **ngx-markdown**, **Mermaid**, **Fuse.js**, **panzoom**

Ne pas ajouter de dépendance sans validation explicite.

---

## Règles Angular 21 (patterns senior, non négociables)

### Composants
- **Standalone obligatoire**, jamais de `NgModule`
- `ChangeDetection.OnPush` est implicite en zoneless, ne pas le déclarer explicitement
- **Control flow natif uniquement** : `@if`, `@for`, `@switch`, `@defer`. Jamais de `*ngIf`, `*ngFor`, `*ngSwitch`
- **`input()` et `output()` signal-based**. Jamais de décorateurs `@Input()` ou `@Output()`
- **`inject()` partout**. Jamais d'injection par constructeur

### Réactivité
- **Signals pour tout état** local ou partagé
- **`computed()`** pour toute valeur dérivée
- **`effect()`** avec parcimonie, uniquement pour les effets de bord observables (log, DOM, localStorage)
- **Pas de `BehaviorSubject` ni `Subject`** sauf cas d'interop forcée avec une lib externe
- RxJS accepté uniquement pour l'interop HTTP (puis conversion en signal via `toSignal`)

### Routing
- **Lazy loading obligatoire** sur toutes les routes via `loadComponent`
- Functional guards et resolvers uniquement (pas de classes)

### Templates
- Attributes bindings via `[attr.xxx]` uniquement quand nécessaire
- Préférer les signals dans les templates (`{{ myCount() }}`)
- Pas de logique complexe dans les templates — extraire en `computed()`

---

## TypeScript strict

`tsconfig.json` doit contenir au minimum :

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
}
```

**Interdits absolus :**
- `any` (utiliser `unknown` + narrowing)
- `as Foo` sauf pour narrowing de `unknown`
- `@ts-ignore` et `@ts-expect-error`
- Types non explicites sur les signatures publiques

---

## TDD strict (Vitest)

### Cycle Red / Green / Refactor
1. **Red** : écrire un test qui échoue (et qui décrit un comportement précis)
2. **Green** : écrire le MINIMUM de code pour que le test passe
3. **Refactor** : améliorer le code sans casser les tests

**Ne jamais écrire de code de production sans test préalable qui l'exige.**

### Conventions de test
- Fichier `.spec.ts` à côté de chaque fichier testé
- `describe` par classe ou service, `it` par comportement
- Nommage des `it` : `should [comportement attendu] when [condition]`
- Mocks via `vi.fn()` et `vi.spyOn()`
- Coverage cible : **> 80% sur `domain` et `application`**

### Exemple
```typescript
describe('NoteService', () => {
  it('should return the 5 most recently updated notes when getRecentNotes is called', () => {
    // arrange
    // act
    // assert
  });
});
```

---

## Architecture (voir ARCHITECTURE.md pour détails)

### Couches (dépendances sens unique)
```
presentation → application → domain
                  ↓
            infrastructure → domain
```

**Règles de dépendance :**
- `domain` : AUCUNE dépendance (pas même Angular)
- `application` : dépend de `domain` uniquement
- `infrastructure` : dépend de `domain`
- `presentation` : dépend de `application` uniquement (jamais de `infrastructure` directement)

Toute violation = code review rouge.

---

## Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers | `kebab-case.ts` | `note-repository.ts` |
| Classes | `PascalCase` | `NoteRepository` |
| Signals | `camelCase` sans préfixe | `notes`, pas `notes$` |
| Services | suffixe `Service` | `NoteService` |
| Pages | fichier `.page.ts`, classe suffixée `Page` | `home.page.ts` → `HomePage` |
| Composants | fichier `.component.ts`, classe suffixée `Component` | `search-bar.component.ts` → `SearchBarComponent` |
| Interfaces/Types | `PascalCase` sans préfixe `I` | `Note`, pas `INote` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_RECENT_NOTES` |

---

## Git & commits

### Branches
- `main` : branche de référence, déploiement automatique
- Branches de travail : `feat/xxx`, `fix/xxx`, `chore/xxx`, `docs/xxx`, `test/xxx`, `refactor/xxx`

### Commits (Conventional Commits, vérifié par commitlint)
Format : `<type>(<scope>): <description>`

Types autorisés : `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`, `ci`, `build`

Exemples :
- `feat(search): add full-text search with Fuse.js`
- `fix(mermaid): handle empty diagram gracefully`
- `test(note-service): cover getRecentNotes edge cases`

### PRs
- Titre = message de commit final
- Squash merge obligatoire
- PR mergée uniquement si CI verte

---

## Workflow Claude Code

### À chaque début de session
1. Lire `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`
2. Identifier le ticket en cours dans `ROADMAP.md`
3. Créer une branche `feat/<ticket-id>-<slug>` (ou adapter selon le type)

### À chaque ticket
1. Écrire le test d'abord (Red)
2. Faire passer le test avec le minimum de code (Green)
3. Refacto si nécessaire
4. Lancer `npm run lint && npm run test && npm run build` avant commit
5. Commit en Conventional Commits
6. Répéter jusqu'à ce que le ticket soit done selon ses critères

### Avant de proposer un merge
- Tous les tests passent
- Lint vert
- Build OK
- Coverage > 80% sur les couches concernées
- Critères du ticket tous cochés

---

## MCP servers à activer

- **Angular MCP Server** (stable en v21) : pour accéder aux docs et exemples Angular à jour, dépassant le knowledge cutoff. Utilise `search_documentation` et `find_examples` systématiquement quand tu codes un pattern Angular moderne.
- **Context7** : pour chercher la doc à jour de Mermaid, Vitest, Fuse.js, Angular Material.
- **Microsoft Learn** : pour toute question Azure Static Web Apps ou déploiement.

---

## Skills à activer

- **`frontend-design`** : à invoquer systématiquement pour tout travail de design/UI (composants, pages, layouts). L'esthétique est un objectif de première importance.
- **`ddd-architect`** : pour les décisions architecturales et les diagrammes Mermaid. Utile pour préparer les diagrammes de chaque note elle-même.

---

## Interdictions fermes

- Ne jamais introduire un `NgModule`
- Ne jamais utiliser `*ngIf` / `*ngFor` / `*ngSwitch`
- Ne jamais utiliser `@Input()` / `@Output()` décorateurs
- Ne jamais écrire de code sans test préalable
- Ne jamais committer avec les tests rouges
- Ne jamais ajouter une dépendance sans validation
- Ne jamais utiliser `any` ou `@ts-ignore`
- Ne jamais skipper le hook pre-commit avec `--no-verify`
- Ne jamais modifier les règles de ce fichier sans validation explicite

---

## Langue

- Code, commentaires, noms de variables, messages de commit : **anglais**
- Documentation projet, SPEC, ROADMAP, notes dans `devnotes-garden-content` : **français**
- Messages d'erreur visibles à l'utilisateur : **français**
