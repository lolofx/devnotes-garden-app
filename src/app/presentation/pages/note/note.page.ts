import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MarkdownComponent } from 'ngx-markdown';
import { NoteService } from '../../../application/note.service';
import { type Note } from '../../../domain/note.model';
import { parseContentSegments } from '../../../infrastructure/content-segment-parser';
import { MermaidRendererComponent } from '../../components/mermaid-renderer/mermaid-renderer.component';

@Component({
  selector: 'app-note-page',
  standalone: true,
  imports: [MarkdownComponent, MermaidRendererComponent, RouterLink],
  styleUrl: './note.page.scss',
  template: `
    <div class="note-page">
      @if (loading()) {
        <p class="loading">Chargement...</p>
      } @else if (note()) {
        <article>
          <header>
            <h1>{{ note()?.title }}</h1>
            <p class="summary">{{ note()?.summary }}</p>
            <div class="tags">
              @for (tag of note()?.tags ?? []; track tag) {
                <a class="tag" [routerLink]="['/tags', tag]">{{ tag }}</a>
              }
            </div>
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
export class NotePage {
  private readonly route = inject(ActivatedRoute);
  private readonly noteService = inject(NoteService);

  readonly note = signal<Note | undefined>(undefined);
  readonly loading = signal(true);

  readonly segments = computed(() => parseContentSegments(this.note()?.content ?? ''));

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  constructor() {
    effect(() => {
      const slug = this.slug();
      if (!slug) return;
      this.loading.set(true);
      this.note.set(undefined);
      void this.noteService.getNoteBySlug(slug).then((note) => {
        this.note.set(note);
        this.loading.set(false);
      });
    });
  }
}
