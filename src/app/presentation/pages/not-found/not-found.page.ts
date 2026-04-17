import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-page">
      <h1>404 — Page introuvable</h1>
      <p>La page que vous cherchez n'existe pas.</p>
      <a routerLink="/">Retour à l'accueil</a>
    </div>
  `,
})
export class NotFoundPage {}
