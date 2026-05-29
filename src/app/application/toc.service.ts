import { Injectable, signal } from '@angular/core';

export interface TocItem {
  readonly id: string;
  readonly text: string;
  readonly level: 2 | 3;
}

@Injectable({ providedIn: 'root' })
export class TocService {
  readonly items = signal<readonly TocItem[]>([]);
  readonly activeId = signal<string>('');

  setItems(items: readonly TocItem[]): void {
    this.items.set(items);
  }

  setActiveId(id: string): void {
    this.activeId.set(id);
  }

  clear(): void {
    this.items.set([]);
    this.activeId.set('');
  }
}
