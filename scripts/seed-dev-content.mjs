/**
 * Seed dev content from test-fixtures/ into content-source/ then rebuild the index.
 * Usage: npm run seed:dev
 */
import { cpSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURES = join(ROOT, 'test-fixtures', 'notes');
const CONTENT_SOURCE = join(ROOT, 'content-source', 'notes');

mkdirSync(CONTENT_SOURCE, { recursive: true });
cpSync(FIXTURES, CONTENT_SOURCE, { recursive: true });
console.log('[seed] test-fixtures → content-source/notes');

await import('./build-content-index.mjs');
