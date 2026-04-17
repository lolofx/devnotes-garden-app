import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_SOURCE = join(ROOT, 'content-source', 'notes');
const ASSETS_CONTENT = join(ROOT, 'src', 'assets', 'content');
const INDEX_OUTPUT = join(ROOT, 'src', 'assets', 'content-index.json');

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

  const index = deduplicated.map(({ content: _c, _sourcePath, ...meta }) => {
    const dest = join(ASSETS_CONTENT, meta.theme, `${meta.slug}.md`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, matter.stringify(content ?? '', meta));
    return meta;
  });

  index.sort((a, b) => b.updated.localeCompare(a.updated));
  writeFileSync(INDEX_OUTPUT, JSON.stringify(index, null, 2));
  console.log(`[ok] ${index.length} note(s) indexée(s) → src/assets/content-index.json`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
