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
- [ ] Repo GitHub public créé
- [ ] `README.md` initial avec description du projet
- [ ] License MIT
- [ ] `.gitignore` Angular standard

### T0.2 — Initialiser l'app Angular 21
- [ ] `ng new devnotes-garden-app --standalone --style=scss --ssr=false --routing=true`
- [ ] Configuration zoneless dans `app.config.ts` via `provideZonelessChangeDetection()`
- [ ] `npm run start` fonctionne localement
- [ ] Configuration Vitest vérifiée (`ng test` lance Vitest, pas Karma)
- [ ] Un test smoke passe (`app.component.spec.ts`)

### T0.3 — Copier les docs
- [ ] Créer `docs/` et y copier `SPEC.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md`
- [ ] Commit `docs: add initial specification and architecture`

### T0.4 — Configurer qualité
- [ ] ESLint 9 flat config (`eslint.config.mjs`) avec `angular-eslint`
- [ ] Prettier configuré (`.prettierrc` + `.prettierignore`)
- [ ] Husky installé + hook `pre-commit` → lint-staged
- [ ] lint-staged : lint + format sur fichiers staged
- [ ] Commitlint avec `@commitlint/config-conventional`
- [ ] Hook `commit-msg` valide les messages
- [ ] Scripts npm : `lint`, `format`, `test`, `test:coverage`, `build`

### T0.5 — Créer le repo `devnotes-garden-content`
- [ ] Repo GitHub public créé
- [ ] `README.md` expliquant le format des notes
- [ ] Arborescence `notes/ddd/`, `notes/event-storming/`, `notes/bff/`, `notes/clean-architecture/` (dossiers vides avec `.gitkeep`)
- [ ] Ajouter les 2 notes que Loïc a préparées (engagement pris en phase spec)

### T0.6 — CI basique (`ci.yml`)
- [ ] Workflow GitHub Actions déclenché sur PR
- [ ] Étapes : checkout → setup node 20 → `npm ci` → `npm run lint` → `npm run test:coverage` → `npm run build`
- [ ] PR bloquée si CI rouge

### T0.7 — Déploiement Azure Static Web Apps
- [ ] Créer la ressource Azure Static Web Apps (plan gratuit) via portail ou CLI
- [ ] Connecter le repo app à l'Azure SWA
- [ ] Workflow `deploy.yml` généré automatiquement par Azure, mergé sur main
- [ ] Le "Hello World" Angular est accessible en HTTPS via l'URL Azure
- [ ] Configuration DNS pour `garden.leplomb.work` (à faire plus tard, pas bloquant)

**Démo Phase 0** : une PR mergée + un site déployé qui affiche "Hello World Angular 21".

---

## Phase 1 — Domain + lecture d'une note hardcodée

**Objectif** : afficher une note Markdown statiquement embarquée dans l'app, avec modèles Domain propres et tests.

### T1.1 — Modèles Domain (TDD)
- [ ] `note.model.ts` : interface `Note` avec tous les champs du front matter
- [ ] `tag.model.ts` : `Tag` (nom + nombre de notes)
- [ ] `theme.model.ts` : `Theme` (nom + notes associées)
- [ ] Tests unitaires sur fonctions pures éventuelles (validation de slug par ex.)

### T1.2 — `NoteRepository` (infrastructure) lit une note hardcodée
- [ ] Contrat `NoteRepository` défini dans `domain` (ou type)
- [ ] Implémentation `StaticNoteRepository` dans `infrastructure` qui retourne 1 note codée en dur
- [ ] Tests Vitest avec mocks

### T1.3 — `NoteService` (application)
- [ ] Méthode `getNoteBySlug(slug)` qui délègue au repository
- [ ] Tests unitaires avec `NoteRepository` mocké

### T1.4 — `NotePage` (presentation)
- [ ] Page `/notes/:slug` standalone
- [ ] Utilise `inject(NoteService)` + signal `note = toSignal(...)`
- [ ] Affiche titre, résumé, contenu Markdown brut (pas encore de rendu Mermaid)
- [ ] Intègre `ngx-markdown` pour le rendu de base + coloration Prism
- [ ] Test d'intégration basique

### T1.5 — Routing et navigation minimale
- [ ] Route `/notes/:slug` fonctionne
- [ ] Page 404 custom si slug inconnu
- [ ] Lien temporaire depuis l'accueil vers la note hardcodée

**Démo Phase 1** : cliquer sur un lien depuis l'accueil ouvre la note hardcodée, avec titre, résumé et Markdown rendu.

---

## Phase 2 — Ingestion du repo content

**Objectif** : le site lit dynamiquement les notes du repo `devnotes-garden-content` au build.

### T2.1 — Script `build-content-index.mjs`
- [ ] Script Node qui lit tous les `.md` de `./content-source/notes/`
- [ ] Parse le front matter avec `gray-matter`
- [ ] Valide les champs obligatoires (RM01)
- [ ] Détecte les doublons de slug (RM02) → la plus récente gagne, warning console
- [ ] Filtre les drafts (`draft: true` → ignorés, RM07)
- [ ] Dérive le thème depuis le chemin (`/notes/ddd/xxx.md` → thème `ddd`, RM03)
- [ ] Génère `src/assets/content-index.json` avec la liste des métadonnées
- [ ] Copie les `.md` dans `src/assets/content/[theme]/[slug].md`
- [ ] Tests unitaires du script (avec filesystem mocké ou fixtures)

### T2.2 — Mettre à jour `NoteRepository`
- [ ] Remplacer `StaticNoteRepository` par `JsonNoteRepository`
- [ ] `getRecentNotes(n)` : fetch `content-index.json` + retourne les n dernières par `updated`
- [ ] `getNoteBySlug(slug)` : lookup dans l'index + fetch du `.md` correspondant
- [ ] `getAllTags()`, `getNotesByTag(tag)`, `getAllThemes()` implémentés
- [ ] Cache de l'index (fetch 1x par session)
- [ ] Tests Vitest avec `fetch` mocké

### T2.3 — Workflow `deploy.yml` enrichi
- [ ] Avant `ng build` : `git clone` du repo content dans `./content-source`
- [ ] Exécute `node scripts/build-content-index.mjs`
- [ ] Puis `ng build --configuration=production`
- [ ] Deploy Azure

### T2.4 — Workflow `trigger-app-rebuild.yml` (côté content)
- [ ] Déclenché sur push `main` du repo content
- [ ] Envoie un `repository_dispatch` event vers le repo app
- [ ] Le repo app a un workflow écoutant cet event qui déclenche `deploy.yml`

**Démo Phase 2** : ajouter une note dans le repo content, `git push`, et la voir apparaître en ligne dans les 2-3 minutes.

---

## Phase 3 — Navigation complète

**Objectif** : l'utilisateur peut naviguer librement via accueil, sidebar, tags et recherche.

### T3.1 — `HomePage`
- [ ] Affiche les 5 dernières notes (UC-01, RM08)
- [ ] Composant `NoteCard` réutilisable (titre, résumé, date, tags)
- [ ] Clic sur une carte → `NotePage`

### T3.2 — `SidebarNav` (arborescence par thème)
- [ ] Lit les thèmes + notes via `NoteService`
- [ ] Affiche un arbre à 2 niveaux : thème > note
- [ ] Composant `ThemeService.getAllThemesWithNotes()`
- [ ] Persistance de l'état ouvert/fermé de chaque thème (localStorage)

### T3.3 — `TagsListPage` + `TagPage`
- [ ] `/tags` : liste tous les tags avec leur nombre de notes
- [ ] `/tags/:tagName` : liste toutes les notes portant ce tag (UC-03)
- [ ] Composant `TagBadge` réutilisable

### T3.4 — `SearchBar` + `SearchService` (Fuse.js)
- [ ] `SearchService` utilise Fuse.js, indexe sur `title`, `summary`, `tags`, `content` (hors code/diagrammes)
- [ ] Recherche insensible à la casse et aux accents (RM10)
- [ ] Debounce 200ms (UC-02)
- [ ] Composant `SearchBar` affiche les résultats en dropdown
- [ ] Highlight du terme recherché dans les extraits
- [ ] Min 2 caractères avant déclenchement
- [ ] Tests du service

### T3.5 — `Breadcrumb`
- [ ] Affiché sur `NotePage` et `TagPage`
- [ ] Format : `Accueil > [Thème ou Tags] > [Titre ou TagName]`

### T3.6 — `MainLayout`
- [ ] Header avec logo/titre, `SearchBar`, `ThemeToggle`
- [ ] Sidebar à gauche avec `SidebarNav`
- [ ] Zone de contenu principale
- [ ] Responsive : sidebar devient drawer sur mobile

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
- [ ] Lire `/mnt/skills/public/frontend-design/SKILL.md`
- [ ] Appliquer les principes : tokens de design, typographie, espacement, hiérarchie visuelle

### T5.2 — Design tokens (`_tokens.scss`)
- [ ] Palette principale (primary, accent, neutral, semantic)
- [ ] Échelle de typographie (tailles, font-weights, line-heights)
- [ ] Échelle d'espacement (4px base)
- [ ] Échelle de border-radius
- [ ] Ombres

### T5.3 — `ThemeToggle` + dark/light mode
- [ ] Service `ThemeService` avec signal `currentTheme`
- [ ] Au premier chargement, suit `prefers-color-scheme`
- [ ] Toggle persiste en localStorage
- [ ] Transition CSS douce entre thèmes
- [ ] `_light.scss` + `_dark.scss` appliqués via attribute `data-theme`

### T5.4 — Typographie et mise en page des notes
- [ ] Police de corps lisible (system font stack ou Inter/Plus Jakarta Sans)
- [ ] Largeur max de contenu (~70 caractères par ligne)
- [ ] Marges généreuses
- [ ] Style distinct pour h1/h2/h3, citations, listes, code inline

### T5.5 — Animations et micro-interactions
- [ ] Transition de page (fade léger, < 200ms)
- [ ] Hover states sur cartes et liens
- [ ] Focus visible accessible
- [ ] Loading state pour le fetch du `.md`

### T5.6 — Responsive et accessibilité
- [ ] Breakpoints : mobile < 768px, tablet 768-1024px, desktop > 1024px
- [ ] Sidebar en drawer sur mobile avec hamburger
- [ ] Contraste WCAG AA minimum
- [ ] Navigation clavier complète
- [ ] Labels ARIA sur les éléments interactifs

### T5.7 — Page d'accueil inspirante
- [ ] Hero simple mais marquant (titre, pitch en 1 phrase, appel à explorer)
- [ ] Section "Notes récentes" avec cartes soignées
- [ ] Section "Parcours par thème" avec les thèmes disponibles
- [ ] Footer minimal (lien GitHub, mention "propulsé par Angular 21")

### T5.8 — Audit Lighthouse
- [ ] Performance > 90
- [ ] Accessibility > 95
- [ ] Best Practices > 95
- [ ] SEO > 90
- [ ] Corriger les warnings restants

**Démo Phase 5** : site final, propre, responsive, mode sombre, prêt à être partagé.

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
