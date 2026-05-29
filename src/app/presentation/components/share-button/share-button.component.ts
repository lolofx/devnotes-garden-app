import { Component, ElementRef, input, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-share-button',
  standalone: true,
  styleUrl: './share-button.component.scss',
  template: `
    <button class="share-btn" (click)="share()" aria-label="Partager cette note">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Partager
    </button>

    <dialog #shareDialog>
      <p class="dialog-title">Partager cette note</p>
      <div class="url-row">
        <input readonly [value]="currentUrl" class="url-input" aria-label="URL de la note" />
        <button class="copy-btn" (click)="copyUrl()">
          {{ copied() ? 'Copié !' : 'Copier' }}
        </button>
      </div>
      <button class="close-btn" (click)="closeDialog()">Fermer</button>
    </dialog>
  `,
})
export class ShareButtonComponent {
  readonly title = input.required<string>();
  readonly url = input<string>();

  readonly copied = signal(false);

  private readonly dialogEl = viewChild<ElementRef<HTMLDialogElement>>('shareDialog');

  get currentUrl(): string {
    return this.url() ?? (typeof window !== 'undefined' ? window.location.href : '');
  }

  share(): void {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      void navigator.share({ title: this.title(), url: this.currentUrl });
    } else {
      this.dialogEl()?.nativeElement.showModal();
    }
  }

  copyUrl(): void {
    void navigator.clipboard.writeText(this.currentUrl).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  closeDialog(): void {
    this.dialogEl()?.nativeElement.close();
  }
}
