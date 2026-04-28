# devnotes-garden — Roadmap de développement

> Découpe du projet en **6 phases** avec tickets atomiques. Chaque ticket a des critères de "done" vérifiables. Suivre l'ordre, ne pas sauter de phase.

## Vue d'ensemble

| Phase | Objectif | Durée estimée |
|---|---|---|
| 0 | Bootstrap : repos, CI/CD, "Hello World" déployé | 1 session |
| 1 | Domain + lecture d'une note hardcodée | 1-2 sessions |
| 2 | Ingestion du repo content + génération `index.json` | 1-2 sessions |
| 3 | Navigation (accueil, arbo, tags, recherche) | 2-3 sessions |
| 4 | Rendu Mermaid + thème Event Storming | 2 sessions |
| 5 | Polish visuel via skill frontend-design | 1-2 sessions |

**Principe** : chaque phase se termine par une démo fonctionnelle, mergée sur main, déployée.

---

## Phase 0 — Bootstrap

**Objectif** : avoir un "Hello World" Angular 21 déployé sur Azure, avec CI/CD, qualité et repo content prêt.

### T0.1 — Créer le repo `devnotes-garden-app`
- [x] Repo GitHub public créé
- [x] `README.md` initial avec description du projet
- [x] License MIT
- [x] `.gitignore` Angular standard

### T0.2 — Initialiser l'app Angular 21
- [x] `ng new devnotes-garden-app --standalone --style=scss --ssr=false --routing=true`
- [x] Configuration zoneless dans `app.config.ts` via `provideZonelessChangeDetection()`
- [x] `npm run start` fonctionne localement
- [x] Configuration Vitest vérifiée (`ng test` lance Vitest, pas Karma)
- [x] Un test smoke passe (`app.component.spec.ts`)

### T0.3 — Copier les docs
- [x] Créer `docs/` et y copier `SPEC.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md`
- [x] Commit `docs: add initial specification and architecture`

### T0.4 — Configurer qualité
- [x] ESLint 9 flat config (`eslint.config.mjs`) avec `angular-eslint`
- [x] Prettier configuré (`.prettierrc` + `.prettierignore`)
- [x] Husky installé + hook `pre-commit` → lint-staged
- [x] lint-staged : lint + format sur fichiers staged
- [x] Commitlint avec `@commitlint/config-conventional`
- [x] Hook `commit-msg` valide les messages
- [x] Scripts npm : `lint`, `format`, `test`, `test:coverage`, `build`

### T0.5 — Créer le repo `devnotes-garden-content`
- [x] Repo GitHub public créé
- [x] `README.md` expliquant le format des notes
- [x] Arborescence `notes/ddd/`, `notes/event-storming/`, `notes/bff/`, `notes/clean-architecture/` (dossiers vides avec `.gitkeep`)
- [x] Ajouter les 2 notes que Loïc a préparées (engagement pris en phase spec)

### T0.6 — CI basique (`ci.yml`)
- [x] Workflow GitHub Actions déclenché sur PR
- [x] Étapes : checkout → setup node 20 → `npm ci` → `npm run lint` → `npm run test:coverage` → `npm run build`
- [x] PR bloquée si CI rouge

### T0.7 — Déploiement Azure Static Web Apps
- [x] Créer la ressource Azure Static Web Apps (plan gratuit) via portail ou CLI
- [x] Connecter le repo app à l'Azure SWA
- [x] Workflow `deploy.yml` généré automatiquement par Azure, mergé sur main
- [x] Le "Hello World" Angular est accessible en HTTPS via l'URL Azure
- [ ] Configuration DNS pour `garden.leplomb.work` (à faire plus tard, pas bloquant)

**Démo Phase 0** : une PR mergée + un site déployé qui affiche "Hello World Angular 21".

---

## Phase 1 — Domain + lecture d'une note hardcodée

**Objectif** : afficher une note Markdown statiquement embarquée dans l'app, avec modèles Domain propres et tests.

### T1.1 — Modèles Domain (TDD)
- [x] `note.model.ts` : interface `Note` avec tous les champs du front matter
- [x] `tag.model.ts` : `Tag` (nom + nombre de notes)
- [x] `theme.model.ts` : `Theme` (nom + notes associées)
- [x] Tests unitaires sur fonctions pures éventuelles (validation de slug par ex.)

### T1.2 — `NoteRepository` (infrastructure) lit une note hardcodée
- [x] Contrat `NoteRepository` défini dans `domain` (ou type)
- [x] Implémentation `StaticNoteRepository` dans `infrastructure` qui retourne 1 note codée en dur
- [x] Tests Vitest avec mocks

### T1.3 — `NoteService` (application)
- [x] Méthode `getNoteBySlug(slug)` qui délègue au repository
- [x] Tests unitaires avec `NoteRepository` mocké

### T1.4 — `NotePage` (presentation)
- [x] Page `/notes/:slug` standalone
- [x] Utilise `inject(NoteService)` + signal `note = toSignal(...)`
- [x] Affiche titre, résumé, contenu Markdown brut (pas encore de rendu Mermaid)
- [x] Intègre `ngx-markdown` pour le rendu de base + coloration Prism
- [x] Test d'intégration basique

### T1.5 — Routing et navigation minimale
- [x] Route `/notes/:slug` fonctionne
- [x] Page 404 custom si slug inconnu
- [x] Lien temporaire depuis l'accueil vers la note hardcodée

**Démo Phase 1** : cliquer sur un lien depuis l'accueil ouvre la note hardcodée, avec titre, résumé et Markdown rendu.

---

## Phase 2 — Ingestion du repo content

**Objectif** : le site lit dynamiquement les notes du repo `devnotes-garden-content` au build.

### T2.1 — Script `build-content-index.mjs`
- [x] Script Node qui lit tous les `.md` de `./content-source/notes/`
- [x] Parse le front matter avec `gray-matter`
- [x] Valide les champs obligatoires (RM01)
- [x] Détecte les doublons de slug (RM02) → la plus récente gagne, warning console
- [x] Filtre les drafts (`draft: true` → ignorés, RM07)
- [x] Dérive le thème depuis le chemin (`/notes/ddd/xxx.md` → thème `ddd`, RM03)
- [x] Génère `src/assets/content-index.json` avec la liste des métadonnées
- [x] Copie les `.md` dans `src/assets/content/[theme]/[slug].md`
- [x] Tests unitaires du script (avec filesystem mocké ou fixtures)

### T2.2 — Mettre à jour `NoteRepository`
- [x] Remplacer `StaticNoteRepository` par `JsonNoteRepository`
- [x] `getRecentNotes(n)` : fetch `content-index.json` + retourne les n dernières par `updated`
- [x] `getNoteBySlug(slug)` : lookup dans l'index + fetch du `.md` correspondant
- [x] `getAllTags()`, `getNotesByTag(tag)`, `getAllThemes()` implémentés
- [x] Cache de l'index (fetch 1x par session)
- [x] Tests Vitest avec `fetch` mocké

### T2.3 — Workflow `deploy.yml` enrichi
- [x] Avant `ng build` : `git clone` du repo content dans `./content-source`
- [x] Exécute `node scripts/build-content-index.mjs`
- [x] Puis `ng build --configuration=production`
- [x] Deploy Azure

### T2.4 — Workflow `trigger-app-rebuild.yml` (côté content)
- [x] Déclenché sur push `main` du repo content
- [x] Envoie un `repository_dispatch` event vers le repo app
- [x] Le repo app a un workflow écoutant cet event qui déclenche `deploy.yml`

**Démo Phase 2** : ajouter une note dans le repo content, `git push`, et la voir apparaître en ligne dans les 2-3 minutes.

---

## Phase 3 — Navigation complète

**Objectif** : l'utilisateur peut naviguer librement via accueil, sidebar, tags et recherche.

### T3.1 — `HomePage`
- [x] Affiche les 5 dernières notes (UC-01, RM08)
- [x] Composant `NoteCard` réutilisable (titre, résumé, date, tags)
- [x] Clic sur une carte → `NotePage`

### T3.2 — `SidebarNav` (arborescence par thème)
- [x] Lit les thèmes + notes via `NoteService`
- [x] Affiche un arbre à 2 niveaux : thème > note
- [x] Composant `ThemeService.getAllThemes()` (retourne themes avec leurs notes)
- [x] Persistance de l'état ouvert/fermé de chaque thème (localStorage)

### T3.3 — `TagsListPage` + `TagPage`
- [x] `/tags` : liste tous les tags avec leur nombre de notes
- [x] `/tags/:tagName` : liste toutes les notes portant ce tag (UC-03)
- [x] Composant `TagBadge` réutilisable

### T3.4 — `SearchBar` + `SearchService` (Fuse.js)
- [x] `SearchService` utilise Fuse.js, indexe sur `title`, `summary`, `tags`
- [x] Recherche insensible à la casse et aux accents (RM10)
- [x] Debounce 200ms (UC-02)
- [x] Composant `SearchBar` affiche les résultats en dropdown (mat-autocomplete)
- [ ] Highlight du terme recherché dans les extraits
- [x] Min 2 caractères avant déclenchement
- [x] Tests du service

### T3.5 — `Breadcrumb`
- [x] Composant `BreadcrumbComponent` créé, intégré dans `MainLayout`
- [ ] Affiché sur `NotePage` et `TagPage` (intégration dans les pages à vérifier)
- [x] Format : `Accueil > [Thème ou Tags] > [Titre ou TagName]`

### T3.6 — `MainLayout`
- [x] Header avec logo/titre, `SearchBar`
- [ ] `ThemeToggle` (dark/light mode — prévu en Phase 5)
- [x] Sidebar à gauche avec `SidebarNav`
- [x] Zone de contenu principale
- [x] Responsive : sidebar devient drawer sur mobile

**Démo Phase 3** : navigation complète fonctionnelle, recherche réactive, accueil + tags opérationnels.

---

## Phase 4 — Rendu Mermaid + Event Storming

**Objectif** : diagrammes Mermaid rendus avec le code couleur Event Storming normalisé.

### T4.1 — `MermaidRenderer` (composant)
- [ ] Composant standalone `MermaidRendererComponent`
- [ ] Input signal `code: string`
- [ ] Détecte le langage (`mermaid` vs `event-storming`)
- [ ] Initialise Mermaid avec thème `base` + `themeVariables` custom
- [ ] Génère le SVG, insère dans le DOM via `innerHTML` + sanitizer Angular
- [ ] Tests basiques (rendering d'un graphe simple)

### T4.2 — Transformateur DSL `event-storming` → Mermaid
- [ ] Service `EventStormingTransformer` dans `infrastructure`
- [ ] Parse la syntaxe DSL (actor, command, event, policy, readModel, aggregate, externalSystem, hotspot)
- [ ] Génère le Mermaid avec `classDef` appliqués (voir ARCHITECTURE.md §6.3)
- [ ] Tests unitaires complets (TDD strict)

### T4.3 — Intégration dans le rendu Markdown
- [ ] Plugin ngx-markdown pour détecter les blocs ```mermaid et ```event-storming
- [ ] Remplace le bloc par un `MermaidRendererComponent`
- [ ] Les autres blocs de code restent traités par Prism

### T4.4 — Zoom & pan sur diagrammes
- [ ] Intégration `panzoom` sur chaque SVG généré
- [ ] Bouton reset zoom
- [ ] Désactivé sur mobile (tap et scroll classique)

### T4.5 — Palette Event Storming en SCSS
- [ ] `_event-storming.scss` avec les 8 variables couleur (RM04)
- [ ] `_mermaid-theme.scss` qui injecte les variables dans Mermaid au runtime
- [ ] Cohérence visuelle entre mode clair et sombre

**Démo Phase 4** : une note contenant un diagramme `event-storming` s'affiche avec les couleurs normalisées + zoom fonctionnel.

---

## Phase 5 — Polish visuel

**Objectif** : le site est beau, moderne, et donne envie d'y revenir.

### T5.1 — Activer le skill `frontend-design`
- [x] Skill invoqué et appliqué
- [x] Principes appliqués : tokens de design, typographie, espacement, hiérarchie visuelle

### T5.2 — Design tokens (`styles.scss`)
- [x] Palette principale en CSS custom properties (bg, surface, accent amber, green, text)
- [x] Échelle de typographie (Cormorant Garamond display, Sora body, JetBrains Mono)
- [x] Espacement cohérent (base 1rem / 0.25rem)
- [x] Border-radius défini (`--radius-sm/md/lg` via tokens)
- [ ] Ombres (non nécessaires avec le thème flat/dark actuel)

### T5.3 — `ThemeToggle` + dark/light mode
- [ ] Service `ThemeService` avec signal `currentTheme`
- [ ] Au premier chargement, suit `prefers-color-scheme`
- [ ] Toggle persiste en localStorage
- [ ] Transition CSS douce entre thèmes
- [ ] `_light.scss` + `_dark.scss` appliqués via attribute `data-theme`

> Note : thème dark-only pour le MVP. ThemeToggle reporté post-MVP.

### T5.4 — Typographie et mise en page des notes
- [x] Cormorant Garamond (display) + Sora (corps) — polices distinctives chargées via Google Fonts
- [x] Largeur max contenu `720px` (`--content-max`)
- [x] Marges généreuses (`2rem 2.5rem`)
- [x] Style distinct pour h1/h2/h3 (tailles, border-bottom sur h2), citations (amber), listes, code inline

### T5.5 — Animations et micro-interactions
- [x] Transition de page : fade + slide-up 350ms sur chaque page
- [x] Hover states : barre amber animée sur NoteCard, couleur sur liens sidebar
- [ ] Focus visible accessible (à vérifier)
- [ ] Loading state pour le fetch du `.md` (affiché "Chargement..." sans style)

### T5.6 — Responsive et accessibilité
- [x] Sidebar en drawer sur mobile (mat-sidenav `mode="over"` sur Handset)
- [x] Bouton hamburger sur mobile
- [ ] Contraste WCAG AA (à auditer)
- [ ] Navigation clavier complète (à vérifier)
- [x] `aria-expanded` sur les toggles sidebar, `aria-label` sur le bouton menu

### T5.7 — Page d'accueil
- [x] Hero avec titre + pitch "Un jardin de notes techniques en croissance."
- [x] Section "Notes récentes" avec NoteCards soignées (titre Cormorant, tags verts, barre amber)
- [ ] Section "Parcours par thème" avec les thèmes (sidebar suffit pour le MVP)
- [ ] Footer minimal (post-MVP)

### T5.8 — Audit Lighthouse
- [ ] Performance > 90
- [ ] Accessibility > 95
- [ ] Best Practices > 95
- [ ] SEO > 90
- [ ] Corriger les warnings restants

**Démo Phase 5** : thème "Atelier" dark déployé, typographie distinctive, notes lisibles, navigation fonctionnelle et esthétique.

---

## Après le MVP — Idées pour plus tard

Non spécifié ni planifié, juste pour mémoire :

- Backlinks automatiques entre notes
- Graphe de notes (vue type Obsidian)
- Interactivité au clic sur les éléments Event Storming
- PWA offline
- Flux RSS
- Mode présentation (transformer une note en slides)
- Commentaires via GitHub Discussions

**Rien de tout ça ne doit polluer le MVP.**
