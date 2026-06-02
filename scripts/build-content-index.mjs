import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_SOURCE = join(ROOT, 'content-source', 'notes');
const ASSETS_CONTENT = join(ROOT, 'public', 'assets', 'content');
const INDEX_OUTPUT = join(ROOT, 'public', 'assets', 'content-index.json');
const RSS_OUTPUT = join(ROOT, 'public', 'rss.xml');
const SITE_URL = 'https://garden.leplomb.work';

const REQUIRED_FIELDS = ['title', 'slug', 'tags', 'created', 'updated', 'summary'];

export function deriveTheme(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const notesIndex = parts.indexOf('notes');
  return parts[notesIndex + 1] ?? 'uncategorized';
}

export function validateFrontMatter(data) {
  return REQUIRED_FIELDS.filter((field) => data[field] === undefined || data[field] === null).map(
    (field) => `${field} manquant`,
  );
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr) {
  return new Date(dateStr).toUTCString().replace('GMT', '+0000');
}

export function generateRssFeed(notes, siteUrl = SITE_URL) {
  const items = notes
    .map((note) => {
      const url = `${siteUrl}/notes/${note.slug}`;
      return `  <item>
    <title>${escapeXml(note.title)}</title>
    <link>${url}</link>
    <description>${escapeXml(note.summary)}</description>
    <pubDate>${toRfc822(note.updated)}</pubDate>
    <guid>${url}</guid>
  </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>devnotes·garden</title>
    <link>${siteUrl}</link>
    <description>Notes techniques sur le DDD, l'Event Storming, l'architecture logicielle et le BFF.</description>
    <language>fr</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

export function deduplicateSlugs(notes) {
  const map = new Map();
  for (const note of notes) {
    const existing = map.get(note.slug);
    if (!existing || note.updated > existing.updated) {
      if (existing) console.warn(`[warn] slug en doublon "${note.slug}" — la plus récente gagne`);
      map.set(note.slug, note);
    }
  }
  return [...map.values()];
}

function collectMarkdownFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? collectMarkdownFiles(full) : entry.name.endsWith('.md') ? [full] : [];
  });
}

async function main() {
  if (!existsSync(CONTENT_SOURCE)) {
    console.warn('[warn] content-source/notes/ introuvable — index vide généré');
    mkdirSync(ASSETS_CONTENT, { recursive: true });
    writeFileSync(INDEX_OUTPUT, JSON.stringify([], null, 2));
    console.log('[ok] 0 note(s) indexée(s) → public/assets/content-index.json');
    return;
  }

  const files = collectMarkdownFiles(CONTENT_SOURCE);
  const allNotes = [];

  for (const filePath of files) {
    const raw = readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const relPath = relative(join(ROOT, 'content-source'), filePath).replace(/\\/g, '/');
    const errors = validateFrontMatter(data);

    if (errors.length > 0) {
      console.warn(`[warn] ${relPath}: ${errors.join(', ')} — ignoré`);
      continue;
    }

    if (data.draft === true) {
      console.log(`[info] ${relPath}: draft ignoré`);
      continue;
    }

    const theme = deriveTheme(relPath);
    allNotes.push({ ...data, theme, content, _sourcePath: relPath });
  }

  const deduplicated = deduplicateSlugs(allNotes);

  mkdirSync(ASSETS_CONTENT, { recursive: true });

  const index = deduplicated.map(({ content: noteContent, _sourcePath, ...meta }) => {
    const dest = join(ASSETS_CONTENT, meta.theme, `${meta.slug}.md`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, noteContent ?? '');
    return meta;
  });

  index.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  writeFileSync(INDEX_OUTPUT, JSON.stringify(index, null, 2));
  console.log(`[ok] ${index.length} note(s) indexée(s) → public/assets/content-index.json`);

  writeFileSync(RSS_OUTPUT, generateRssFeed(index));
  console.log(`[ok] flux RSS généré → public/rss.xml`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
