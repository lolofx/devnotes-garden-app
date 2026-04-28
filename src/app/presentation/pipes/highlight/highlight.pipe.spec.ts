import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { HighlightPipe } from './highlight.pipe';

function setupPipe(): HighlightPipe {
  TestBed.configureTestingModule({});
  const sanitizer = TestBed.inject(DomSanitizer);
  vi.spyOn(sanitizer, 'bypassSecurityTrustHtml').mockImplementation((html) => html as SafeHtml);
  return TestBed.runInInjectionContext(() => new HighlightPipe());
}

describe('HighlightPipe', () => {
  it('should wrap matching text in mark tags', () => {
    const pipe = setupPipe();
    const result = pipe.transform('DDD Aggregates', 'DDD') as string;
    expect(result).toBe('<mark>DDD</mark> Aggregates');
  });

  it('should be case-insensitive', () => {
    const pipe = setupPipe();
    const result = pipe.transform('DDD Aggregates', 'ddd') as string;
    expect(result).toBe('<mark>DDD</mark> Aggregates');
  });

  it('should return original text when query is empty', () => {
    const pipe = setupPipe();
    const result = pipe.transform('Some text', '') as string;
    expect(result).toBe('Some text');
  });

  it('should return original text when query is whitespace only', () => {
    const pipe = setupPipe();
    const result = pipe.transform('Some text', '   ') as string;
    expect(result).toBe('Some text');
  });

  it('should escape special regex characters in query', () => {
    const pipe = setupPipe();
    const result = pipe.transform('price: $100', '$100') as string;
    expect(result).toBe('price: <mark>$100</mark>');
  });

  it('should highlight all occurrences', () => {
    const pipe = setupPipe();
    const result = pipe.transform('DDD and more DDD', 'DDD') as string;
    expect(result).toBe('<mark>DDD</mark> and more <mark>DDD</mark>');
  });
});
