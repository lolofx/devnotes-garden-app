import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ColorSchemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly scheme = signal<'light' | 'dark'>(this.initScheme());

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      document.documentElement.setAttribute('data-theme', this.scheme());
      localStorage.setItem('garden-scheme', this.scheme());
    });
  }

  toggle(): void {
    this.scheme.update((s) => (s === 'light' ? 'dark' : 'light'));
  }

  private initScheme(): 'light' | 'dark' {
    if (!this.isBrowser) return 'light';
    const saved = localStorage.getItem('garden-scheme');
    if (saved === 'light' || saved === 'dark') return saved;
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
