import { Component, HostListener, inject, signal } from '@angular/core';
import { TocService } from '../../../application/toc.service';

@Component({
  selector: 'app-toc',
  standalone: true,
  styleUrl: './toc.component.scss',
  template: `
    @if (toc.items().length > 0) {
      <div class="toc-label">Sur cette page</div>
      <ul class="toc-list">
        @for (item of toc.items(); track item.id) {
          <li>
            <a
              [href]="'#' + item.id"
              [class.sub]="item.level === 3"
              [class.active]="toc.activeId() === item.id"
              (click)="scrollTo($event, item.id)"
              >{{ item.text }}</a
            >
          </li>
        }
      </ul>
      <div class="toc-progress">
        <div class="toc-progress-label">
          <span>Lecture</span>
          <span>{{ readPct() }}%</span>
        </div>
        <div class="toc-bar"><i [style.width.%]="readPct()"></i></div>
      </div>
    }
  `,
})
export class TocComponent {
  readonly toc = inject(TocService);
  readonly readPct = signal(0);

  @HostListener('window:scroll', [])
  onScroll(): void {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    this.readPct.set(docH > 0 ? Math.min(100, Math.round((window.scrollY / docH) * 100)) : 0);
  }

  scrollTo(e: Event, id: string): void {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 70,
        behavior: 'smooth',
      });
    }
  }
}
