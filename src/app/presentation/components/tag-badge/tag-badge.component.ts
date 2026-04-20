import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-tag-badge',
  standalone: true,
  imports: [RouterLink, MatChipsModule],
  template: `
    <a [routerLink]="['/tags', tag()]" class="tag-badge-link">
      <mat-chip>{{ tag() }}</mat-chip>
    </a>
  `,
})
export class TagBadgeComponent {
  readonly tag = input.required<string>();
}
