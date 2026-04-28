import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

interface Crumb {
  label: string;
  link: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  notes: 'Notes',
  tags: 'Tags',
};

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './breadcrumb.component.scss',
  template: `
    <nav aria-label="breadcrumb" class="breadcrumb">
      <ol>
        <li><a routerLink="/">Accueil</a></li>
        @for (crumb of crumbs(); track crumb.link) {
          <li>
            <a [routerLink]="crumb.link">{{ crumb.label }}</a>
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed<Crumb[]>(() =>
    this.url()
      .split('/')
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: SEGMENT_LABELS[seg] ?? seg,
        link: '/' + arr.slice(0, i + 1).join('/'),
      })),
  );
}
