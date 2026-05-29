import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tag-badge',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './tag-badge.component.scss',
  template: `
    <a [routerLink]="['/tags', tag()]" class="tag-badge-link">
      <span class="tag-badge">{{ tag() }}</span>
    </a>
  `,
})
export class TagBadgeComponent {
  readonly tag = input.required<string>();
}
