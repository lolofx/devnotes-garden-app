import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoteService } from '../../../application/note.service';
import { type Note } from '../../../domain/note.model';

const FALLBACK_NOTE: Note = {
  title: 'Contenu en cours de préparation',
  slug: 'coming-soon',
  summary: 'Les notes arriveront bientôt. Le jardin est en train de pousser.',
  content: `# Bienvenue dans le devnotes-garden 🌱

Le contenu n'est pas encore publié, mais l'infrastructure est en place.

Les premières notes porteront sur :
- **Domain-Driven Design** — modélisation métier, agrégats, contextes délimités
- **Event Storming** — exploration collaborative du domaine
- **Clean Architecture** — découplage et testabilité

Revenez bientôt.`,
  tags: ['meta'],
  theme: 'meta',
  created: new Date().toISOString().slice(0, 10),
  updated: new Date().toISOString().slice(0, 10),
  draft: false,
};

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
        <article class="note-card fallback">
          <h2>{{ fallbackNote.title }}</h2>
          <p>{{ fallbackNote.summary }}</p>
        </article>
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
  readonly fallbackNote = FALLBACK_NOTE;

  async ngOnInit(): Promise<void> {
    const notes = await this.noteService.getRecentNotes(5);
    this.notes.set(notes);
    this.loading.set(false);
  }
}
