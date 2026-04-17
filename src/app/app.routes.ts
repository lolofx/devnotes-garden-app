import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'notes/:slug',
    loadComponent: () => import('./presentation/pages/note/note.page').then((m) => m.NotePage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./presentation/pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
