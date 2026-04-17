# devnotes-garden

> Digital garden personnel — notes d'architecture logicielle avec diagrammes Event Storming.

[![Angular](https://img.shields.io/badge/Angular-21-red?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## Présentation

`devnotes-garden` est un digital garden hébergé sur Azure Static Web Apps qui affiche des notes Markdown sur l'architecture logicielle avancée : DDD, Event Storming, BFF, Clean Architecture, CQRS.

**Fonctionnalités clés :**
- Rendu Markdown avec coloration syntaxique (Prism)
- Diagrammes Mermaid au code couleur Event Storming normalisé
- Recherche full-text côté client (Fuse.js)
- Navigation par thème, tags et recherche
- Mode sombre / clair persistant
- Responsive — optimisé desktop, utilisable mobile

## Stack

- **Angular 21** — standalone, zoneless, signals, control flow natif
- **Vitest** — TDD strict (red/green/refactor)
- **Angular Material 21** — composants UI
- **ngx-markdown + Mermaid** — rendu contenu
- **Fuse.js** — recherche full-text
- **Azure Static Web Apps** — hébergement

## Repos

| Repo | Rôle |
|------|------|
| `devnotes-garden-app` (ce repo) | Code Angular |
| [`devnotes-garden-content`](https://github.com/lolofx/devnotes-garden-content) | Notes Markdown |

## Architecture

Clean Architecture allégée : `domain` → `application` → `infrastructure/presentation`.
Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour le détail.

## Développement local

```bash
npm install
npm run start
```

Tests :

```bash
npm run test
npm run test:coverage
```

## Déploiement

Automatique via GitHub Actions à chaque push sur `main`.
Le repo content déclenche un rebuild via `repository_dispatch`.

## Licence

MIT — voir [LICENSE](LICENSE).
