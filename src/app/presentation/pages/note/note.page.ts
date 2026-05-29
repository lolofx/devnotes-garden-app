import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MarkdownComponent } from 'ngx-markdown';
import { NoteService } from '../../../application/note.service';
import { TocService, type TocItem } from '../../../application/toc.service';
import { type Note } from '../../../domain/note.model';
import { parseContentSegments } from '../../../infrastructure/content-segment-parser';
import { rewriteNoteLinks } from '../../../infrastructure/note-link-rewriter';
import { MermaidRendererComponent } from '../../components/mermaid-renderer/mermaid-renderer.component';
import { ShareButtonComponent } from '../../components/share-button/share-button.component';

@Component({
  selector: 'app-note-page',
  standalone: true,
  imports: [MarkdownComponent, MermaidRendererComponent, RouterLink, ShareButtonComponent],
  styleUrl: './note.page.scss',
  template: `
    <div class="note-page">
      @if (loading()) {
        <p class="loading">Chargement…</p>
      } @else if (note()) {
        <article #articleRef>
          <header>
            <div class="header-top">
              <h1>{{ note()!.title }}</h1>
              <app-share-button [title]="note()!.title" />
            </div>
            @if (note()!.summary) {
              <p class="lede">{{ note()!.summary }}</p>
            }
            <div class="article-meta">
              <span
                >Mis à jour le <b>{{ formatDate(note()!.updated) }}</b></span
              >
              <span class="dot-sep"></span>
              <span
                >Catégorie&nbsp;: <b>{{ note()!.theme }}</b></span
              >
            </div>
            @if (note()!.tags.length > 0) {
              <div class="tags">
                @for (tag of note()!.tags; track tag) {
                  <a class="tag" [routerLink]="['/tags', tag]">{{ tag }}</a>
                }
              </div>
            }
          </header>

          @for (segment of segments(); track $index) {
            @if (segment.type === 'markdown') {
              <markdown [data]="segment.content" />
            } @else {
              <app-mermaid-renderer [code]="segment.code" [lang]="segment.type" />
            }
          }
        </article>
      } @else {
        <p>Note introuvable. <a routerLink="/">Retour à l'accueil</a></p>
      }
    </div>
  `,
})
export class NotePage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly noteService = inject(NoteService);
  private readonly tocService = inject(TocService);

  readonly note = signal<Note | undefined>(undefined);
  readonly loading = signal(true);

  readonly articleRef = viewChild<ElementRef<HTMLElement>>('articleRef');

  readonly segments = computed(() =>
    parseContentSegments(rewriteNoteLinks(this.note()?.content ?? '')),
  );

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  private io: IntersectionObserver | null = null;

  constructor() {
    effect(() => {
      const slug = this.slug();
      if (!slug) return;
      this.loading.set(true);
      this.note.set(undefined);
      this.tocService.clear();
      void this.noteService.getNoteBySlug(slug).then((note) => {
        this.note.set(note);
        this.loading.set(false);
        setTimeout(() => this.extractToc(), 80);
      });
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.tocService.clear();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private extractToc(): void {
    const article = this.articleRef()?.nativeElement;
    if (!article) return;

    const headings = article.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    headings.forEach((h) => {
      const el = h as HTMLElement;
      if (!el.id) {
        el.id = (el.textContent ?? '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      items.push({
        id: el.id,
        text: el.textContent ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      });
    });

    this.tocService.setItems(items);
    this.setupScrollSpy(headings);
  }

  private setupScrollSpy(headings: NodeListOf<Element>): void {
    this.io?.disconnect();
    if (headings.length === 0) return;

    this.io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        const first = visible[0];
        if (first) {
          this.tocService.setActiveId(first.target.id);
        }
      },
      { rootMargin: '-10% 0px -70% 0px' },
    );

    headings.forEach((h) => this.io?.observe(h));
  }
}
