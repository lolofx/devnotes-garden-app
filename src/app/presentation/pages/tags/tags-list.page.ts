import { Component, inject } from '@angular/core';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TagService } from '../../../application/tag.service';
import { TagBadgeComponent } from '../../components/tag-badge/tag-badge.component';

@Component({
  selector: 'app-tags-list-page',
  standalone: true,
  imports: [TagBadgeComponent],
  styleUrl: './tags-list.page.scss',
  template: `
    <div class="tags-list-page">
      <h1>Tags</h1>
      <div class="tags-list">
        @for (tag of tags() ?? []; track tag.name) {
          <app-tag-badge [tag]="tag.name" />
          <span class="tag-count">({{ tag.noteCount }})</span>
        }
      </div>
    </div>
  `,
})
export class TagsListPage {
  private readonly tagService = inject(TagService);
  readonly tags = toSignal(from(this.tagService.getAllTags()));
}
