import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { ThemeService } from '../../../application/theme.service';
import { type Theme } from '../../../domain/theme.model';

const LS_KEY = 'sidebar-expanded-themes';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="sidebar-nav">
      <a routerLink="/" class="sidebar-nav__home">devnotes·garden</a>
      <ul class="sidebar-nav__themes">
        @for (theme of themes(); track theme.name) {
          <li class="sidebar-nav__theme">
            <button
              class="sidebar-nav__theme-toggle"
              (click)="toggleTheme(theme.name)"
              [attr.aria-expanded]="expandedThemes().has(theme.name)"
            >
              {{ theme.name }}
            </button>
            @if (expandedThemes().has(theme.name)) {
              <ul class="sidebar-nav__notes">
                @for (note of theme.notes; track note.slug) {
                  <li>
                    <a [routerLink]="['/notes', note.slug]">{{ note.title }}</a>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
      <div class="sidebar-nav__footer">
        <a routerLink="/tags"> <span>#</span> Tags </a>
      </div>
    </nav>
  `,
  styleUrl: './sidebar-nav.component.scss',
})
export class SidebarNavComponent implements OnInit {
  private readonly themeService = inject(ThemeService);

  readonly themes = toSignal(from(this.themeService.getAllThemes()), {
    initialValue: [] as readonly Theme[],
  });

  readonly expandedThemes = signal<Set<string>>(this.loadExpanded());

  ngOnInit(): void {
    if (this.expandedThemes().size === 0) {
      const first = this.themes()[0];
      if (first) {
        this.expandedThemes.set(new Set([first.name]));
      }
    }
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
