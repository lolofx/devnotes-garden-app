import { Component, OnInit, OutputEmitterRef, inject, output, signal } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, filter, map, startWith } from 'rxjs';
import { ThemeService } from '../../../application/theme.service';
import { NoteService } from '../../../application/note.service';
import { type Theme } from '../../../domain/theme.model';
import { type Note } from '../../../domain/note.model';

const LS_KEY = 'sidebar-expanded-themes';

function getCategoryColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('net') || lower.includes('backend') || lower.includes('csharp'))
    return 'var(--cat-net)';
  if (lower.includes('ddd') || lower.includes('architect')) return 'var(--cat-ddd)';
  if (lower.includes('angular') || lower.includes('frontend')) return 'var(--cat-ng)';
  if (lower.includes('infra') || lower.includes('devops') || lower.includes('cloud'))
    return 'var(--cat-infra)';
  return 'var(--accent)';
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  if (days < 14) return 'la semaine dernière';
  if (days < 30) return `il y a ${Math.floor(days / 7)} sem.`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="brand">
      <a routerLink="/" class="brand-mark" (click)="navClose.emit()">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FAFAF7"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 22V12" />
          <path d="M12 12C12 7 9 4 4 4c0 5 3 8 8 8Z" />
          <path d="M12 12c0-4 3-7 8-7 0 4-3 7-8 7Z" />
        </svg>
      </a>
      <a routerLink="/" class="brand-text" (click)="navClose.emit()">
        <span class="brand-name">Garden</span>
        <span class="brand-sub">leplomb.work</span>
      </a>
    </div>

    <div class="nav-section-label">Catégories</div>
    <nav class="nav-tree">
      @for (theme of themes(); track theme.name) {
        <div class="cat" [class.collapsed]="!expandedThemes().has(theme.name)">
          <button
            class="cat-head"
            (click)="toggleTheme(theme.name)"
            [attr.aria-expanded]="expandedThemes().has(theme.name)"
          >
            <span class="cat-dot" [style.background]="getCategoryColor(theme.name)"></span>
            <span class="cat-name">{{ theme.name }}</span>
            <span class="cat-count">{{ theme.notes.length }}</span>
            <svg
              class="cat-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div class="cat-items">
            <div class="cat-items-inner">
              @for (note of theme.notes; track note.slug) {
                <a
                  class="cat-item"
                  [routerLink]="['/notes', note.slug]"
                  [class.active]="activeSlug() === note.slug"
                  (click)="navClose.emit()"
                  >{{ note.title }}</a
                >
              }
            </div>
          </div>
        </div>
      }
    </nav>

    @if (recentNotes().length > 0) {
      <div class="nav-section-label">Récents</div>
      <div class="recents">
        @for (note of recentNotes(); track note.slug) {
          <a class="recent" [routerLink]="['/notes', note.slug]" (click)="navClose.emit()">
            {{ note.title }}
            <time>{{ getRelativeTime(note.updated) }}</time>
          </a>
        }
      </div>
    }

    <div class="nav-footer">
      <a routerLink="/tags" (click)="navClose.emit()">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          width="14"
          height="14"
        >
          <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l6.59-6.59a1 1 0 0 0 0-1.41L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
        Tags
      </a>
      <a href="/rss.xml" class="rss-link" aria-label="Flux RSS">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          width="14"
          height="14"
        >
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1" />
        </svg>
        RSS
      </a>
    </div>
  `,
  styleUrl: './sidebar-nav.component.scss',
})
export class SidebarNavComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly noteService = inject(NoteService);
  private readonly router = inject(Router);

  readonly navClose: OutputEmitterRef<void> = output<void>();

  readonly themes = toSignal(from(this.themeService.getAllThemes()), {
    initialValue: [] as readonly Theme[],
  });

  readonly recentNotes = toSignal(from(this.noteService.getRecentNotes(4)), {
    initialValue: [] as readonly Note[],
  });

  readonly expandedThemes = signal<Set<string>>(this.loadExpanded());

  readonly activeSlug = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => url.match(/\/notes\/([^/?#]+)/)?.[1] ?? ''),
    ),
    { initialValue: '' },
  );

  ngOnInit(): void {
    if (this.expandedThemes().size === 0) {
      const first = this.themes()[0];
      if (first) {
        this.expandedThemes.set(new Set([first.name]));
      }
    }
  }

  getCategoryColor(name: string): string {
    return getCategoryColor(name);
  }

  getRelativeTime(dateStr: string): string {
    return getRelativeTime(dateStr);
  }

  toggleTheme(name: string): void {
    this.expandedThemes.update((set) => {
      const next = new Set(set);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  private loadExpanded(): Set<string> {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  }
}
