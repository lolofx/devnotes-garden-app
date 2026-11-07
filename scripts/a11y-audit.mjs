/**
 * Audit d'accessibilité : axe-core (WCAG 2.2 AA + bonnes pratiques) + calcul des contrastes de texte,
 * sur le build de production, en clair/sombre, bureau/mobile (menu mobile ouvert compris).
 *
 * Usage : npm run build && npm run a11y
 * Prérequis : dist/devnotes-garden-app/browser et public/assets/content-index.json (build-content-index).
 * Navigateur : Chromium de Playwright (`npx playwright install chromium`), ou A11Y_CHROMIUM=/chemin/chrome.
 * Code de sortie : 1 s'il reste une violation.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist', 'devnotes-garden-app', 'browser');
const PORT = 4399;
const MIME = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown',
};

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Build introuvable : lancer `npm run build` avant `npm run a11y`.');
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(path.join(DIST, 'assets', 'content-index.json'), 'utf8'));
if (!index.length) {
  console.error('content-index.json est vide : rien à auditer.');
  process.exit(1);
}
const note = index.find((n) => n.tags?.length) ?? index[0];
const PAGES = ['/', `/notes/${note.slug}`, '/tags', `/tags/${note.tags?.[0] ?? 'x'}`, '/page-inconnue'];

const server = http
  .createServer((req, res) => {
    let file = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
    res.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT);

/** Exécuté dans la page : textes dont le contraste est sous AA (4,5:1, ou 3:1 pour le grand texte). */
function lowContrast() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const a = m[1].split(/[ ,/]+/).map(Number);
    return { r: a[0], g: a[1], b: a[2], a: a[3] ?? 1 };
  };
  const lum = (c) => {
    const f = (x) => ((x /= 255) <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const mix = (top, base, alpha) => ({
    r: top.r * alpha + base.r * (1 - alpha),
    g: top.g * alpha + base.g * (1 - alpha),
    b: top.b * alpha + base.b * (1 - alpha),
  });
  const background = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 1) break;
      }
    }
    return layers.reverse().reduce((base, c) => mix(c, base, c.a), { r: 255, g: 255, b: 255 });
  };
  const found = [];
  for (const el of document.querySelectorAll('body *')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || !box.width || !box.height) continue;
    const color = parse(cs.color);
    if (!color) continue;
    const bg = background(el);
    const fg = mix(color, bg, color.a * parseFloat(cs.opacity));
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const px = parseFloat(cs.fontSize);
    const large = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    if (ratio < (large ? 3 : 4.5)) {
      found.push(`contraste ${ratio.toFixed(2)}:1 — ${el.tagName.toLowerCase()} « ${el.textContent.trim().slice(0, 30)} »`);
    }
  }
  return found;
}

const problems = new Map();
const report = (key, detail) => {
  if (!problems.has(key)) problems.set(key, detail);
};

const launchOptions = { headless: true };
if (process.env.A11Y_CHROMIUM) launchOptions.executablePath = process.env.A11Y_CHROMIUM;

for (const scheme of ['light', 'dark']) {
  for (const width of [1440, 390]) {
    const browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
    const page = await context.newPage();
    await page.addInitScript((s) => localStorage.setItem('garden-scheme', s), scheme);

    for (const url of PAGES) {
      await page.goto(`http://localhost:${PORT}${url}`);
      await page.waitForSelector('main', { timeout: 10_000 });
      await page.waitForTimeout(url.startsWith('/notes') ? 4000 : 1500);

      const check = async (label) => {
        const where = `[${scheme} ${width}px] ${url}${label}`;
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .analyze();
        for (const v of axe.violations) {
          for (const n of v.nodes) report(`${v.id} ${n.target.join(' ')}`, `${where} — ${v.help}`);
        }
        for (const text of await page.evaluate(lowContrast)) report(text, where);
      };

      await check('');
      const burger = page.locator('.hamburger');
      if (width < 500 && (await burger.isVisible())) {
        await burger.click();
        await page.waitForTimeout(600);
        await check(' (menu ouvert)');
      }
    }
    await browser.close();
  }
}
server.close();

if (problems.size) {
  console.error(`\n${problems.size} problème(s) d'accessibilité :\n`);
  for (const [key, where] of problems) console.error(`- ${key}\n    ${where}`);
  process.exit(1);
}
console.log('Accessibilité : aucune violation (axe-core + contrastes).');
