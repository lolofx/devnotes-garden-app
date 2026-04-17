import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { NoteService } from '../../../application/note.service';
import { type Note } from '../../../domain/note.model';

@Component({
  selector: 'app-note-page',
  standalone: true,
  imports: [MarkdownComponent, RouterLink],
  template: `
    <div class="note-page">
      <nav class="breadcrumb">
        <a routerLink="/">Accueil</a>
        @if (note()) {
          <span> › {{ note()?.theme }}</span>
          <span> › {{ note()?.title }}</span>
        }
      </nav>

      @if (loading()) {
        <p>Chargement...</p>
      } @else if (note()) {
        <article>
          <header>
            <h1>{{ note()?.title }}</h1>
            <p class="summary">{{ note()?.summary }}</p>
            <div class="tags">
              @for (tag of note()?.tags ?? []; track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </div>
          </header>
          <markdown [data]="note()?.content ?? ''" />
        </article>
      } @else {
        <p>Note introuvable. <a routerLink="/">Retour à l'accueil</a></p>
      }
    </div>
  `,
})
export class NotePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly noteService = inject(NoteService);

  readonly note = signal<Note | undefined>(undefined);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const note = await this.noteService.getNoteBySlug(slug);
    this.note.set(note);
    this.loading.set(false);
  }
}
