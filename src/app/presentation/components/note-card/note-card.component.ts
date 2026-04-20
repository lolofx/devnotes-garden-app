import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type Note } from '../../../domain/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="note-card">
      <h3>
        <a [routerLink]="['/notes', note().slug]">{{ note().title }}</a>
      </h3>
      <p class="note-card__summary">{{ note().summary }}</p>
      <div class="note-card__meta">
        <time>{{ note().updated }}</time>
        @for (tag of note().tags; track tag) {
          <span class="note-card__tag">{{ tag }}</span>
        }
      </div>
    </article>
  `,
})
export class NoteCardComponent {
  readonly note = input.required<Note>();
}
