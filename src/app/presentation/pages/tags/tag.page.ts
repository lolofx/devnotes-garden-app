import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { TagService } from '../../../application/tag.service';
import { NoteCardComponent } from '../../components/note-card/note-card.component';
import { type Note } from '../../../domain/note.model';

const EMPTY_NOTES: readonly Note[] = [];

@Component({
  selector: 'app-tag-page',
  standalone: true,
  imports: [NoteCardComponent],
  template: `
    <div class="tag-page">
      <h1>#{{ tagName() }}</h1>
      @for (note of notes(); track note.slug) {
        <app-note-card [note]="note" />
      } @empty {
        <p>Aucune note pour ce tag.</p>
      }
    </div>
  `,
})
export class TagPage {
  private readonly route = inject(ActivatedRoute);
  private readonly tagService = inject(TagService);

  readonly tagName = toSignal(this.route.paramMap.pipe(map((p) => p.get('tagName') ?? '')), {
    initialValue: '',
  });

  readonly notes = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('tagName') ?? ''),
      switchMap((tag) => from(this.tagService.getNotesByTag(tag))),
    ),
    { initialValue: EMPTY_NOTES },
  );
}
