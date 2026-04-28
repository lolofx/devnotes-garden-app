import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, from, of } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { type Note } from '../../../domain/note.model';
import { NoteService } from '../../../application/note.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [RouterLink, MatAutocompleteModule, MatInputModule, MatFormFieldModule],
  styleUrl: './search-bar.component.scss',
  template: `
    <mat-form-field appearance="outline" class="search-bar">
      <input
        matInput
        [matAutocomplete]="auto"
        placeholder="Rechercher..."
        (input)="onInput($event)"
      />
      <mat-autocomplete #auto="matAutocomplete">
        @for (note of results(); track note.slug) {
          <mat-option [routerLink]="['/notes', note.slug]">
            {{ note.title }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class SearchBarComponent {
  private readonly noteService = inject(NoteService);

  readonly query = signal('');
  readonly results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(200),
      switchMap((q) =>
        q.length > 1 ? from(this.noteService.searchNotes(q)) : of([] as readonly Note[]),
      ),
    ),
    { initialValue: [] as readonly Note[] },
  );

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
