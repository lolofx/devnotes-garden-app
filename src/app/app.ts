import { Component } from '@angular/core';
import { MainLayoutComponent } from './presentation/layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
