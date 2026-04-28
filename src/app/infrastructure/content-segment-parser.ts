export type ContentSegment =
  | { type: 'markdown'; content: string }
  | { type: 'mermaid'; code: string }
  | { type: 'event-storming'; code: string };

const DIAGRAM_BLOCK = /```(mermaid|event-storming)\n([\s\S]*?)```/g;

export function parseContentSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(DIAGRAM_BLOCK)) {
    const [fullMatch, lang, code] = match;
    const start = match.index ?? 0;

    const before = content.slice(lastIndex, start);
    if (before.trim()) segments.push({ type: 'markdown', content: before });

    segments.push({ type: lang as 'mermaid' | 'event-storming', code: (code ?? '').trimEnd() });
    lastIndex = start + fullMatch.length;
  }

  const remaining = content.slice(lastIndex);
  if (remaining.trim()) segments.push({ type: 'markdown', content: remaining });

  return segments;
}
