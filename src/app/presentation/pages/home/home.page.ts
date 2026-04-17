import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoteService } from '../../../application/note.service';
import { type Note } from '../../../domain/note.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-page">
      <h1>devnotes-garden</h1>
      <p>Notes d'architecture logicielle — DDD, Event Storming, Clean Architecture.</p>

      <h2>Notes récentes</h2>
      @if (loading()) {
        <p>Chargement...</p>
      } @else if (notes().length === 0) {
        <p>Aucune note pour le moment.</p>
      } @else {
        <ul>
          @for (note of notes(); track note.slug) {
            <li>
              <a [routerLink]="['/notes', note.slug]">{{ note.title }}</a>
              <span> — {{ note.summary }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class HomePage implements OnInit {
  private readonly noteService = inject(NoteService);

  readonly notes = signal<readonly Note[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    const notes = await this.noteService.getRecentNotes(5);
    this.notes.set(notes);
    this.loading.set(false);
  }
}
