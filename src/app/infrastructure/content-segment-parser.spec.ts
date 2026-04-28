import { describe, it, expect } from 'vitest';
import { parseContentSegments } from './content-segment-parser';

describe('parseContentSegments', () => {
  it('should return a single markdown segment for plain text', () => {
    const result = parseContentSegments('Hello world');
    expect(result).toEqual([{ type: 'markdown', content: 'Hello world' }]);
  });

  it('should extract a mermaid code block as its own segment', () => {
    const input = 'Before\n```mermaid\ngraph LR\n  A-->B\n```\nAfter';
    const result = parseContentSegments(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'markdown', content: 'Before\n' });
    expect(result[1]).toEqual({ type: 'mermaid', code: 'graph LR\n  A-->B' });
    expect(result[2]).toEqual({ type: 'markdown', content: '\nAfter' });
  });

  it('should extract an event-storming code block', () => {
    const input = '```event-storming\nactor User\n```';
    const result = parseContentSegments(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ type: 'event-storming', code: 'actor User' });
  });

  it('should handle multiple mermaid blocks', () => {
    const input = '```mermaid\nA-->B\n```\nText\n```mermaid\nC-->D\n```';
    const result = parseContentSegments(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'mermaid', code: 'A-->B' });
    expect(result[1]).toEqual({ type: 'markdown', content: '\nText\n' });
    expect(result[2]).toEqual({ type: 'mermaid', code: 'C-->D' });
  });

  it('should not extract regular code blocks', () => {
    const input = '```typescript\nconst x = 1;\n```';
    const result = parseContentSegments(input);
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('markdown');
  });

  it('should filter out empty markdown segments', () => {
    const input = '```mermaid\nA-->B\n```';
    const result = parseContentSegments(input);
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('mermaid');
  });
});
