import { describe, expect, it } from 'vitest';
import { isValidSlug } from './note.model';

describe('isValidSlug', () => {
  it('should return true when slug is valid kebab-case', () => {
    expect(isValidSlug('bounded-context-intro')).toBe(true);
  });

  it('should return true when slug has single word', () => {
    expect(isValidSlug('ddd')).toBe(true);
  });

  it('should return false when slug contains uppercase letters', () => {
    expect(isValidSlug('BoundedContext')).toBe(false);
  });

  it('should return false when slug contains spaces', () => {
    expect(isValidSlug('bounded context')).toBe(false);
  });

  it('should return false when slug contains underscores', () => {
    expect(isValidSlug('bounded_context')).toBe(false);
  });

  it('should return false when slug is empty', () => {
    expect(isValidSlug('')).toBe(false);
  });

  it('should return false when slug starts with a hyphen', () => {
    expect(isValidSlug('-bounded-context')).toBe(false);
  });

  it('should return false when slug ends with a hyphen', () => {
    expect(isValidSlug('bounded-context-')).toBe(false);
  });
});
