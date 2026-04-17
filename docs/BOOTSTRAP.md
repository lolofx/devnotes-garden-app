# BOOTSTRAP — Prompt de démarrage pour Claude Code

> Copie-colle ce contenu dans ton premier message à Claude Code, après avoir placé `SPEC.md`, `ARCHITECTURE.md`, `ROADMAP.md` et `CLAUDE.md` dans un dossier `docs/` vide.

---

## Premier message à Claude Code

```
Salut Claude Code. Je démarre un nouveau projet perso nommé `devnotes-garden`.

Contexte : digital garden Angular 21 qui affiche des notes Markdown (depuis un repo GitHub séparé) avec un rendu soigné et des diagrammes Mermaid aux couleurs Event Storming.

Tu vas trouver 4 documents dans `./docs/` :
- `SPEC.md` : la spécification fonctionnelle complète (cas d'usage, règles métier, hors périmètre)
- `ARCHITECTURE.md` : l'architecture technique (Clean Archi allégée, structure de dossiers, flux de données, format des notes, rendu Mermaid)
- `ROADMAP.md` : la découpe en 6 phases avec tickets atomiques
- `CLAUDE.md` : les règles projet que tu dois respecter strictement (stack, conventions Angular 21 senior, TDD, TypeScript strict, etc.)

Avant toute action :
1. Lis les 4 documents dans cet ordre : CLAUDE.md → SPEC.md → ARCHITECTURE.md → ROADMAP.md
2. Confirme-moi que tu as bien compris le projet, la stack, et les règles
3. Liste-moi les tickets de la Phase 0 pour qu'on s'aligne sur le plan d'attaque

Ensuite on enchaîne ticket par ticket, en TDD strict (red/green/refactor), sur la Phase 0 — Bootstrap.

Pour chaque ticket :
- Tu commences par me résumer l'objectif et les critères de "done"
- Tu écris d'abord le test qui échoue (quand applicable)
- Tu implémentes le minimum de code pour faire passer le test
- Tu lances `npm run lint && npm run test && npm run build` avant tout commit
- Tu commits en Conventional Commits
- Tu me montres le résultat avant de passer au suivant

Active les MCP servers suivants dès que disponibles :
- Angular MCP Server (pour patterns Angular 21 à jour)
- Context7 (pour doc Mermaid, Vitest, Fuse.js)
- Microsoft Learn (pour Azure Static Web Apps)

Active le skill `frontend-design` dès qu'on touchera à l'UI (Phase 5 surtout, mais aussi composants en Phase 3).

Respect absolu des interdictions listées dans CLAUDE.md : pas de NgModule, pas de *ngIf, pas de @Input() décorateurs, pas de any, pas de code sans test préalable.

Langue : code/commits en anglais, documentation et échanges avec moi en français.

On y va ?
```

---

## Checklist avant de coller le prompt

Dans ton terminal local, dans un nouveau dossier vide :

- [ ] `mkdir devnotes-garden-app && cd devnotes-garden-app`
- [ ] `git init`
- [ ] `mkdir docs`
- [ ] Placer `SPEC.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md` dans `docs/`
- [ ] Copier `CLAUDE.md` aussi à la racine (c'est là que Claude Code le cherche par défaut)
- [ ] Lancer Claude Code depuis ce dossier : `claude`
- [ ] Coller le prompt ci-dessus

---

## Conseils pour la session Claude Code

### Gestion du contexte

Tu sais déjà bien le faire, mais pour mémoire sur ce projet :

- `.claudeignore` à créer dès la Phase 0 : exclure `node_modules`, `dist`, `.angular`, `coverage`, `*.lock`
- Le repo étant petit au départ, pas besoin de limites agressives
- Si tu sens que le contexte se remplit, force un `/compact` entre les phases

### Changement de phase = nouvelle session

Chaque phase est indépendante. Entre deux phases, ouvre une nouvelle session Claude Code propre en rappelant le contexte via un prompt court du style :

```
Nouvelle session. Lis CLAUDE.md et ROADMAP.md. On est à la Phase X, ticket TX.Y. Résume-moi l'objectif et on démarre.
```

### Validation intermédiaire

Ne laisse pas Claude Code enchaîner 5 tickets sans relecture. Après chaque ticket terminé :
- Regarde le diff
- Vérifie que les tests existent et sont pertinents (pas juste là pour la coverage)
- Valide que les critères du ticket sont cochés
- Merge sur main ou demande un ajustement

### Si ça dérape

Si Claude Code commence à sur-ingénier, à créer des abstractions inutiles, ou à ignorer les règles de CLAUDE.md :
- Stoppe-le immédiatement
- Pointe la règle violée du CLAUDE.md
- Demande un rollback
- Si récurrent sur un sujet, enrichis CLAUDE.md avec une règle plus explicite

### Après la Phase 5

Tu auras un site fonctionnel en ligne. Ne lance pas immédiatement les idées "pour plus tard". Laisse vivre le projet, écris quelques notes, utilise-le réellement pendant 2-3 semaines. Les vraies améliorations émergeront de l'usage, pas de la spéculation.

---

## Bonne chance 🌱

Le projet est cadré, la stack est moderne, la discipline TDD va produire du code propre. Tu construis un outil pour toi, qui valorise ton expertise et peut servir à tes collègues. Pas de pression de perfection : publie des notes dès la v1, itère après.
