import { Component, inject } from '@angular/core';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NoteService } from '../../../application/note.service';
import { NoteCardComponent } from '../../components/note-card/note-card.component';
import { type Note } from '../../../domain/note.model';

const FALLBACK_NOTES: readonly Note[] = [
  {
    title: 'Contenu en cours de préparation',
    slug: 'coming-soon',
    summary: 'Les notes arriveront bientôt. Le jardin est en train de pousser.',
    content: '',
    tags: ['meta'],
    theme: 'meta',
    created: new Date().toISOString().slice(0, 10),
    updated: new Date().toISOString().slice(0, 10),
    draft: false,
  },
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NoteCardComponent],
  template: `
    <div class="home-page">
      <h1>Notes récentes</h1>
      @for (note of notes() ?? fallback; track note.slug) {
        <app-note-card [note]="note" />
      }
    </div>
  `,
})
export class HomePage {
  private readonly noteService = inject(NoteService);

  readonly notes = toSignal(from(this.noteService.getRecentNotes(5)));
  readonly fallback = FALLBACK_NOTES;
}
