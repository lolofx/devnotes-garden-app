import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type Note } from '../../../domain/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="note-card">
      <h2>
        <a [routerLink]="['/notes', note().slug]">{{ note().title }}</a>
      </h2>
      <p class="note-card__summary">{{ note().summary }}</p>
      <div class="note-card__meta">
        <time>{{ note().updated }}</time>
        @for (tag of note().tags; track tag) {
          <a [routerLink]="['/tags', tag]" class="note-card__tag">{{ tag }}</a>
        }
      </div>
    </article>
  `,
  styleUrl: './note-card.component.scss',
})
export class NoteCardComponent {
  readonly note = input.required<Note>();
}
