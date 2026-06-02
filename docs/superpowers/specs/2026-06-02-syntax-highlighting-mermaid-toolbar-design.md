# Design — Coloration syntaxique + Toolbar diagrammes Mermaid

## 1. Coloration syntaxique (Prism.js)

- Prism core + langages (typescript, csharp, sql, javascript, json, yaml, bash, markup, scss) dans `angular.json` scripts
- `provideMarkdown` configuré avec `withHighlighter(PrismHighlighter)` dans `app.config.ts`
- Thème custom dans `styles.scss` via CSS variables existantes — adaptatif dark/light automatique, zéro fichier CSS externe

## 2. Toolbar Mermaid (3 modes + resize)

### Signals ajoutés à `MermaidRendererComponent`
- `isWide = signal(false)` — mode large (CSS uniquement)
- `isFullscreen = signal(false)` — dialog natif ouvert
- `containerHeight = signal(320)` — hauteur en px, modifiable via drag

### Toolbar
Remplace le bouton "Reset zoom" actuel : `⟳ Reset | ⇔ Wide | ⛶ Fullscreen`

### Mode Wide
Classe CSS `.mermaid-renderer--wide` : margin/width négatifs pour casser la colonne 720px et occuper la largeur viewport disponible. Panzoom inchangé (même SVG, même instance).

### Mode Fullscreen
`<dialog>` natif (Échap + focus trap natifs). ViewChild dédié `#fullscreenContainer`. Re-render + nouvelle instance panzoom à l'ouverture, dispose à la fermeture.

### Resize handle
`<div class="resize-handle">` en bas. mousedown → mousemove sur document → met à jour `containerHeight`. Min 200px / max 1200px. Curseur `ns-resize`. Désactivé en fullscreen.

### Panzoom par mode
- Normal : instance existante sur SVG dans container principal
- Wide : même instance (CSS seul)
- Fullscreen : instance dédiée dans le dialog, dispose à la fermeture
