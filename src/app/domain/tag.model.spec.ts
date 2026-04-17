import { describe, expect, it } from 'vitest';
import { type Tag } from './tag.model';

describe('Tag', () => {
  it('should have name and noteCount properties', () => {
    const tag: Tag = { name: 'ddd', noteCount: 3 };
    expect(tag.name).toBe('ddd');
    expect(tag.noteCount).toBe(3);
  });
});
