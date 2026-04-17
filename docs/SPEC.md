# devnotes-garden — Spécification fonctionnelle

> Version : 1.0 | Statut : Brouillon | Date : 2026-04-16

## Sommaire

- [1. Contexte et objectif](#1-contexte-et-objectif)
- [2. Utilisateurs cibles](#2-utilisateurs-cibles)
- [3. Périmètre fonctionnel](#3-périmètre-fonctionnel)
- [4. Cas d'usage principaux](#4-cas-dusage-principaux)
- [5. Règles métier](#5-règles-métier)
- [6. Contraintes techniques](#6-contraintes-techniques)
- [7. Hors périmètre](#7-hors-périmètre)
- [8. Critères de succès](#8-critères-de-succès)

---

## 1. Contexte et objectif

`devnotes-garden` est un digital garden personnel destiné à capitaliser et partager des notes techniques sur l'architecture logicielle avancée : Domain-Driven Design, Event Storming, Backend For Frontend, Clean Architecture, Event Sourcing, CQRS.

Le projet répond à trois besoins :

1. **Référentiel personnel** : centraliser les notes techniques de l'auteur dans un format versionné, portable, consultable en ligne depuis n'importe quel poste.
2. **Support pédagogique pour l'équipe** : pouvoir partager une URL à un collègue pour illustrer un concept (par exemple un Event Storming avec code couleur standard).
3. **Vitrine technique** : démontrer la maîtrise des bonnes pratiques Angular modernes (v21, standalone, zoneless, signals, Vitest, TDD) à travers un projet open-source réel.

La valeur ajoutée par rapport à un simple repo GitHub de `.md` : un **rendu visuel soigné**, des **diagrammes Mermaid au code couleur Event Storming normalisé**, et une **navigation pensée pour l'exploration** (tags, arbo, recherche).

---

## 2. Utilisateurs cibles

Projet **perso solo** : l'auteur est l'unique rédacteur et le principal utilisateur.

Deux profils de lecteurs :

- **Auteur** (profil principal) : développeur fullstack senior, consulte ses propres notes pour se remémorer des concepts ou les partager.
- **Collègues développeurs** (profil secondaire) : niveau technique varié, reçoivent une URL ciblée vers une note précise. N'explorent pas nécessairement le site.

**Pas d'authentification** : site public non promu, accessible à qui possède l'URL. Pas de référencement actif, mais pas de masquage non plus (pas de `robots.txt` restrictif, pas de `noindex`).

---

## 3. Périmètre fonctionnel

### 3.1 Lecture et rendu de contenu

- Affichage de notes au format Markdown avec front matter YAML
- Rendu des blocs de code avec coloration syntaxique (TypeScript, C#, YAML, JSON minimum)
- Rendu des diagrammes Mermaid standards (`graph`, `sequenceDiagram`, `classDiagram`, etc.)
- **Thème Mermaid custom** aux couleurs Event Storming normalisées (voir RM04)
- Support des liens internes entre notes (via slug)
- Support des images référencées dans le repo de contenu

### 3.2 Navigation

- **Page d'accueil** : liste des notes récemment modifiées (les 5 dernières)
- **Sidebar arborescente** : notes regroupées par thème (dérivé du chemin de fichier dans le repo content)
- **Page tags** : liste de tous les tags, clic sur un tag → liste des notes associées
- **Recherche full-text** : barre de recherche persistante, recherche côté client sur titre + résumé + contenu
- **Breadcrumb** : fil d'Ariane sur chaque page de note

### 3.3 UX & design

- Design moderne et épuré, respectant les standards d'une application Angular Material bien intégrée
- **Mode sombre** par défaut suivant la préférence système, avec toggle manuel persistant (localStorage)
- **Responsive** : usable sur mobile (consultation), optimisé desktop (usage principal)
- Typographie lisible pour la prose longue
- Animations légères à la transition de page (sobriété, pas de "wow effect")

### 3.4 Ingestion du contenu

- Les notes sont stockées dans un **repo GitHub séparé** (`devnotes-garden-content`)
- À chaque push sur la branche `main` du repo content, le site est rebuild via GitHub Action
- L'app Angular lit les `.md` au build (pas de fetch runtime vers l'API GitHub)
- Un fichier `index.json` est généré au build (liste des notes, métadonnées, index de recherche)

---

## 4. Cas d'usage principaux

### UC-01 — Consulter une note depuis l'accueil

- **Acteur** : lecteur (auteur ou collègue)
- **Déclencheur** : l'utilisateur arrive sur `garden.leplomb.work`
- **Préconditions** : au moins une note publiée dans le repo content
- **Scénario nominal** :
  1. La page d'accueil affiche la liste des 5 dernières notes modifiées avec titre, résumé, date, tags
  2. L'utilisateur clique sur une note
  3. La note s'affiche avec rendu Markdown et diagrammes Mermaid colorés
  4. Le breadcrumb montre `Accueil > [Thème] > [Titre]`
- **Variantes / Erreurs** :
  - Aucune note publiée : message "Aucune note pour le moment"
  - Note introuvable (lien mort) : page 404 custom avec lien retour accueil

### UC-02 — Rechercher une note par mot-clé

- **Acteur** : lecteur
- **Déclencheur** : saisie dans la barre de recherche
- **Préconditions** : l'index de recherche est chargé
- **Scénario nominal** :
  1. L'utilisateur saisit un terme (ex : "bounded context")
  2. Les résultats s'affichent en temps réel (debounce 200ms)
  3. Chaque résultat montre titre, extrait avec highlight du terme, thème, tags
  4. Clic sur un résultat → ouverture de la note
- **Variantes / Erreurs** :
  - Aucun résultat : message "Aucune note ne correspond"
  - Terme < 2 caractères : aucune recherche déclenchée

### UC-03 — Explorer par tag

- **Acteur** : lecteur
- **Déclencheur** : clic sur un tag depuis une note ou la page tags
- **Préconditions** : au moins une note porte ce tag
- **Scénario nominal** :
  1. L'utilisateur accède à la page `/tags/:tagName`
  2. La page liste toutes les notes portant ce tag, triées par date de mise à jour décroissante
  3. Un lien "Tous les tags" permet de revenir à la vue d'ensemble

### UC-04 — Publier une nouvelle note (auteur)

- **Acteur** : auteur
- **Déclencheur** : l'auteur crée/modifie un `.md` dans le repo content
- **Préconditions** : le `.md` respecte le format attendu (RM01 à RM03)
- **Scénario nominal** :
  1. L'auteur écrit sa note en local dans son éditeur Markdown
  2. `git commit` + `git push` sur `main` du repo content
  3. Une GitHub Action est déclenchée côté repo app (via webhook ou cron toutes les 10min)
  4. L'action rebuild le site Angular et déploie sur Azure Static Web Apps
  5. La note est visible en ligne dans les minutes qui suivent
- **Variantes / Erreurs** :
  - Front matter invalide → la note est ignorée au build, un warning est loggé dans l'Action
  - Slug en doublon → la plus récente gagne, warning loggé

### UC-05 — Basculer mode clair / sombre

- **Acteur** : lecteur
- **Déclencheur** : clic sur le toggle mode sombre dans la barre de navigation
- **Préconditions** : aucune
- **Scénario nominal** :
  1. L'utilisateur clique sur l'icône soleil/lune
  2. Le thème bascule immédiatement (transition CSS douce)
  3. Le choix est persisté en localStorage
  4. Au prochain chargement, le choix est restauré
- **Variantes** : au premier chargement, le thème suit `prefers-color-scheme` du système.

---

## 5. Règles métier

### Format des notes

- **RM01** — Chaque note est un fichier `.md` avec front matter YAML obligatoire contenant au minimum : `title`, `slug`, `tags` (liste), `created` (ISO date), `updated` (ISO date), `summary`.
- **RM02** — Le `slug` est unique sur l'ensemble du site. En cas de doublon au build, la note avec le `updated` le plus récent gagne.
- **RM03** — Le thème de la note est dérivé du chemin du fichier dans le repo content : `/notes/ddd/bounded-context.md` → thème `ddd`. Un seul niveau de thème (pas de sous-thèmes en v1).

### Rendu des diagrammes Event Storming

- **RM04** — Le code couleur Event Storming est standardisé et appliqué automatiquement aux nœuds Mermaid selon leur classe CSS :
  - `domainEvent` : **orange** (#FF9800) — événement métier survenu
  - `command` : **bleu ciel** (#03A9F4) — intention utilisateur / commande
  - `actor` : **jaune** (#FFEB3B) — rôle humain déclencheur
  - `policy` : **violet** (#9C27B0) — règle automatique (quand X alors Y)
  - `readModel` : **vert clair** (#8BC34A) — vue / projection
  - `aggregate` : **jaune foncé** (#FBC02D) — cluster d'invariants métier
  - `externalSystem` : **rose** (#E91E63) — système tiers
  - `hotspot` : **rouge** (#F44336) — zone de friction / question ouverte

- **RM05** — Les notes peuvent utiliser ces classes via la syntaxe Mermaid standard `classDef` ou via un bloc `event-storming` custom qui applique le thème automatiquement (détail dans l'étape 2 — architecture).

### Publication

- **RM06** — Une note est considérée comme publiable si elle respecte RM01, contient au moins un paragraphe de contenu après le front matter, et a été relue au moins une fois par l'auteur (règle d'auto-discipline, non techniquement vérifiée).
- **RM07** — Les notes en brouillon sont marquées par `draft: true` dans le front matter et **ne sont pas publiées** en ligne (filtrées au build).

### Navigation

- **RM08** — La page d'accueil affiche exactement les 5 notes avec le `updated` le plus récent.
- **RM09** — La recherche full-text est indexée sur : `title`, `summary`, `tags`, contenu textuel (hors blocs de code et diagrammes).
- **RM10** — La recherche ignore la casse et les accents.

---

## 6. Contraintes techniques

### Stack applicative

- **Angular 21** — standalone components, zoneless change detection, signals, control flow natif (`@if`/`@for`), `inject()`
- **Vitest** — test runner par défaut d'Angular 21, utilisé en **TDD strict** (red/green/refactor)
- **Angular Material 21** — composants UI, thèmes clair/sombre
- **ngx-markdown** — rendu Markdown avec plugins (Prism pour coloration syntaxique)
- **Mermaid** — rendu des diagrammes, avec thème custom Event Storming
- **Fuse.js** — recherche full-text côté client
- **TypeScript strict** — aucune exception

### Architecture code

- Séparation **Domain / Application / Infrastructure** dans l'arborescence (Clean Architecture allégée, pas de DDD tactique)
  - `domain/` : modèles (`Note`, `Tag`, `Theme`, `SearchResult`)
  - `application/` : services orchestrateurs (`NoteService`, `SearchService`, `ThemeService`)
  - `infrastructure/` : accès au `index.json`, parsing du Markdown, thème Mermaid
- Pas de module NgModule, tout en standalone
- Routing avec lazy loading par feature
- Signals pour tout état local et partagé

### Hébergement & déploiement

- **Azure Static Web Apps** (plan gratuit) pour l'hébergement
- **GitHub Actions** pour CI/CD :
  - Repo app : build + test + deploy à chaque push sur `main`
  - Repo content : déclenche un rebuild du repo app via `repository_dispatch`
- Deux repos GitHub publics :
  - `devnotes-garden-app` : code Angular
  - `devnotes-garden-content` : notes `.md`

### Domaine

- URL cible : `garden.leplomb.work` (à confirmer par Loïc, `leplomb.work/garden` possible)
- Certificat HTTPS automatique via Azure Static Web Apps

### Performance

- Bundle initial < 500 Ko gzipped (hors Mermaid qui est lourd — chargé en lazy sur les notes avec diagrammes)
- Time to Interactive < 2s sur desktop 4G simulé
- Note affichée en < 500ms après clic (lecture locale, pas de réseau)

### Qualité

- Couverture de test unitaire **> 80%** sur `domain` et `application`
- Couverture des composants critiques (rendu note, recherche, thème) via tests Vitest
- Commits suivant Conventional Commits
- ESLint + Prettier en pre-commit

---

## 7. Hors périmètre

Tout ce qui suit est explicitement **exclu de la v1** pour protéger le scope :

- Authentification / comptes utilisateurs
- Commentaires, likes, réactions
- Backlinks automatiques entre notes (type Obsidian graph view)
- Interactivité au clic sur les éléments des diagrammes (tooltips, side-panel, etc.)
- Mode édition en ligne / CMS
- Multi-auteurs
- Internationalisation (site en français uniquement)
- Analytics (pas de tracking)
- PWA / mode offline
- Export PDF ou autres formats
- Flux RSS
- Sitemap.xml / SEO avancé
- Pagination (pas nécessaire au volume prévu en v1)
- Système de versions / historique d'une note affiché en ligne (l'historique Git du repo content suffit)
- Schémas interactifs avancés (niveau 2 ou 3 de la discussion initiale)

---

## 8. Critères de succès

Le projet est réussi si à 3 mois du lancement :

1. **L'auteur utilise effectivement le site** pour consulter ses propres notes au moins 1 fois par semaine.
2. **Au moins 8 notes publiées** de qualité (respectant RM06).
3. **Au moins 1 note partagée à un collègue** via URL, avec feedback positif sur la clarté.
4. **Pipeline de publication fluide** : l'auteur publie une nouvelle note en < 5 minutes une fois le Markdown rédigé (pas de friction technique).
5. **Le code sert lui-même d'exemple pédagogique** : l'arborescence Clean Archi allégée, les tests Vitest, et les conventions Angular 21 sont propres au point de pouvoir être référencés dans une note.

Critères techniques :

- Lighthouse Performance > 90
- Lighthouse Accessibility > 95
- Aucune erreur console en production
- Build < 2 minutes en CI
