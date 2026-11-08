import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SidebarNavComponent } from '../../components/sidebar-nav/sidebar-nav.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { TocComponent } from '../../components/toc/toc.component';
import { ColorSchemeService } from '../../../application/color-scheme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarNavComponent, BreadcrumbComponent, TocComponent],
  styleUrl: './main-layout.component.scss',
  template: `
    <a class="skip-link" href="#contenu" (click)="skipToContent($event)">Aller au contenu</a>

    <div class="scrim" [class.show]="navOpen()" (click)="closeNav()" role="presentation"></div>

    <div class="app" [class.nav-open]="navOpen()">
      <aside
        class="sidebar"
        id="sidebar"
        aria-label="Menu latéral"
        [attr.inert]="sidebarInert() ? '' : null"
      >
        <app-sidebar-nav (navClose)="closeNav()" />
      </aside>

      <main class="main" id="contenu" tabindex="-1">
        <div class="topbar" [class.scrolled]="scrolled()">
          <button
            class="icon-btn hamburger"
            (click)="openNav()"
            aria-label="Ouvrir la navigation"
            aria-controls="sidebar"
            [attr.aria-expanded]="navOpen()"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <button
            class="icon-btn tablet-toggle"
            (click)="toggleNav()"
            aria-label="Afficher ou masquer la navigation"
            aria-controls="sidebar"
            [attr.aria-expanded]="navOpen()"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span class="topbar-spacer"></span>
          <button
            class="icon-btn"
            (click)="colorScheme.toggle()"
            [attr.aria-label]="
              colorScheme.scheme() === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'
            "
          >
            @if (colorScheme.scheme() === 'dark') {
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path
                  d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                />
              </svg>
            } @else {
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            }
          </button>
        </div>
        <div class="main-inner">
          <app-breadcrumb />
          <router-outlet />
        </div>
      </main>

      <aside class="toc-col" aria-label="Sommaire de la page">
        <app-toc />
      </aside>
    </div>
  `,
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly colorScheme = inject(ColorSchemeService);
  readonly navOpen = signal(false);
  readonly scrolled = signal(false);

  readonly isTabletOrSmaller = toSignal(
    this.breakpointObserver.observe('(max-width: 1279px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  /** Hors écran (tablette et mobile) tant que le menu est fermé : ni focus clavier, ni lecteur d'écran. */
  readonly sidebarInert = computed(() => this.isTabletOrSmaller() && !this.navOpen());

  openNav(): void {
    this.navOpen.set(true);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  toggleNav(): void {
    this.navOpen.update((v) => !v);
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    document.getElementById('contenu')?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.navOpen()) this.closeNav();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
}
