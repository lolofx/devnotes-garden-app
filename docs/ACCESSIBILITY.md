# Accessibilité

`npm run a11y` lance `scripts/a11y-audit.mjs` sur le build de production : axe-core (WCAG 2.2 AA + bonnes
pratiques) et un calcul des contrastes de texte (AA : 4,5:1, 3:1 pour le grand texte), sur l'accueil, une note,
les tags et la 404, en clair et en sombre, bureau (1440px) et mobile (390px, menu ouvert compris). Code de sortie 1
s'il reste une violation.

```bash
npx playwright install chromium   # une fois
npm run seed:dev && node scripts/build-content-index.mjs   # contenu de test si content-source est absent
npm run build && npm run a11y
```

`A11Y_CHROMIUM=/chemin/chrome` permet d'utiliser un autre navigateur.

## Job CI

À ajouter dans `.github/workflows/ci.yml` (sous `jobs:`) :

```yaml
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - name: Contenu de test
        run: |
          mkdir -p content-source/notes
          cp -r test-fixtures/notes/. content-source/notes/
          node scripts/build-content-index.mjs
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run a11y
```
