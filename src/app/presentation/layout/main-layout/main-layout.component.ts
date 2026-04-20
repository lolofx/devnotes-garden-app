import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SidebarNavComponent } from '../../components/sidebar-nav/sidebar-nav.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarNavComponent,
    SearchBarComponent,
    BreadcrumbComponent,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="layout-sidenav"
      >
        <app-sidebar-nav />
      </mat-sidenav>

      <mat-sidenav-content class="layout-content">
        <mat-toolbar class="layout-toolbar">
          @if (isMobile()) {
            <button mat-icon-button (click)="sidenav.toggle()" aria-label="Menu">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="layout-toolbar__title">devnotes-garden</span>
          <span class="layout-toolbar__spacer"></span>
          <app-search-bar />
        </mat-toolbar>

        <main class="layout-main">
          <app-breadcrumb />
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .layout-container {
        height: 100vh;
      }
      .layout-sidenav {
        width: 280px;
      }
      .layout-toolbar__spacer {
        flex: 1;
      }
      .layout-main {
        padding: 1.5rem;
      }
    `,
  ],
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );
}
