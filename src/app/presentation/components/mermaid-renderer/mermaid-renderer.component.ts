import {
  Component,
  input,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  afterNextRender,
  Injector,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EventStormingTransformer } from '../../../infrastructure/event-storming-transformer';

let idCounter = 0;

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 1200;
const DEFAULT_HEIGHT = 320;

interface PanzoomInstance {
  dispose(): void;
  moveTo(x: number, y: number): void;
  zoomAbs(x: number, y: number, scale: number): void;
}

@Component({
  selector: 'app-mermaid-renderer',
  standalone: true,
  styleUrl: './mermaid-renderer.component.scss',
  template: `
    <div class="mermaid-renderer" [class.mermaid-renderer--wide]="isWide()">
      <div #container class="mermaid-renderer__diagram" [style.height.px]="containerHeight()">
        <div class="resize-handle" (mousedown)="onResizeStart($event)"></div>
      </div>

      <div class="mermaid-renderer__toolbar">
        <button
          class="mermaid-renderer__toolbar-btn"
          type="button"
          (click)="resetZoom()"
          aria-label="Réinitialiser le zoom"
        >
          ⟳ Reset
        </button>
        <button
          class="mermaid-renderer__toolbar-btn"
          [class.mermaid-renderer__toolbar-btn--active]="isWide()"
          type="button"
          (click)="toggleWide()"
          aria-label="Mode large"
        >
          ⇔ Wide
        </button>
        <button
          class="mermaid-renderer__toolbar-btn"
          type="button"
          (click)="openFullscreen()"
          aria-label="Plein écran"
        >
          ⛶ Fullscreen
        </button>
      </div>

      @if (renderError()) {
        <pre class="mermaid-renderer__error">{{ renderError() }}</pre>
      }
    </div>

    <dialog #fullscreenDialog class="mermaid-fullscreen">
      <div class="fullscreen-header">
        <button
          class="mermaid-renderer__toolbar-btn"
          type="button"
          (click)="closeFullscreen()"
          aria-label="Fermer le plein écran"
        >
          ✕ Fermer
        </button>
      </div>
      <div #fullscreenContainer class="fullscreen-container"></div>
    </dialog>
  `,
})
export class MermaidRendererComponent implements OnDestroy {
  readonly code = input.required<string>();
  readonly lang = input<'mermaid' | 'event-storming'>('mermaid');

  @ViewChild('container') private readonly containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fullscreenDialog') private readonly dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('fullscreenContainer')
  private readonly fullscreenContainerRef!: ElementRef<HTMLDivElement>;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly transformer = inject(EventStormingTransformer);
  private readonly injector = inject(Injector);

  private panzoomInstance: PanzoomInstance | null = null;
  private panzoomFullscreenInstance: PanzoomInstance | null = null;

  readonly renderError = signal('');
  readonly hasPanzoom = signal(false);
  readonly isWide = signal(false);
  readonly isFullscreen = signal(false);
  readonly containerHeight = signal(DEFAULT_HEIGHT);

  private resizeStartY = 0;
  private resizeStartHeight = 0;
  private readonly boundMouseMove = (e: MouseEvent): void => this.onResizeMove(e);
  private readonly boundMouseUp = (): void => this.onResizeEnd();

  constructor() {
    afterNextRender(() => {
      effect(
        () => {
          void this.renderDiagram(this.code(), this.lang());
        },
        { injector: this.injector },
      );

      this.dialogRef.nativeElement.addEventListener('close', () => this.closeFullscreen());
    });
  }

  ngOnDestroy(): void {
    this.panzoomInstance?.dispose();
    this.panzoomFullscreenInstance?.dispose();
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  resetZoom(): void {
    this.panzoomInstance?.moveTo(0, 0);
    this.panzoomInstance?.zoomAbs(0, 0, 1);
  }

  toggleWide(): void {
    this.isWide.set(!this.isWide());
  }

  async openFullscreen(): Promise<void> {
    this.dialogRef.nativeElement.showModal();
    this.isFullscreen.set(true);
    await this.renderDiagramInContainer(
      this.code(),
      this.lang(),
      this.fullscreenContainerRef.nativeElement,
      true,
    );
  }

  closeFullscreen(): void {
    this.panzoomFullscreenInstance?.dispose();
    this.panzoomFullscreenInstance = null;

    const dialog = this.dialogRef.nativeElement;
    if (dialog.open) {
      dialog.close();
    }

    this.isFullscreen.set(false);

    const container = this.fullscreenContainerRef.nativeElement;
    container.innerHTML = '';
  }

  onResizeStart(event: MouseEvent): void {
    if (this.isFullscreen()) return;
    event.preventDefault();
    this.resizeStartY = event.clientY;
    this.resizeStartHeight = this.containerHeight();
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private onResizeMove(event: MouseEvent): void {
    const delta = event.clientY - this.resizeStartY;
    const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, this.resizeStartHeight + delta));
    this.containerHeight.set(newHeight);
  }

  private onResizeEnd(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  private isTouchDevice(): boolean {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  private async renderDiagram(code: string, lang: 'mermaid' | 'event-storming'): Promise<void> {
    const container = this.containerRef?.nativeElement;
    if (!container) return;

    await this.renderDiagramInContainer(code, lang, container, false);
  }

  private async renderDiagramInContainer(
    code: string,
    lang: 'mermaid' | 'event-storming',
    container: HTMLDivElement,
    isFullscreenTarget: boolean,
  ): Promise<void> {
    const mermaidCode = lang === 'event-storming' ? this.transformer.transform(code) : code;
    const id = `mermaid-${++idCounter}`;

    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#1f1c19',
          primaryTextColor: '#ede7dc',
          primaryBorderColor: '#3a3630',
          lineColor: '#8b8278',
          background: '#161412',
          mainBkg: '#1f1c19',
          nodeBorder: '#3a3630',
          clusterBkg: '#0c0b0a',
          titleColor: '#ede7dc',
          edgeLabelBackground: '#26231e',
        },
      });

      const { svg } = await mermaid.render(id, mermaidCode);
      container.innerHTML = svg;

      if (!isFullscreenTarget) {
        this.renderError.set('');
        this.panzoomInstance?.dispose();
        this.panzoomInstance = null;
        this.hasPanzoom.set(false);
      }

      if (!this.isTouchDevice()) {
        const svgEl = container.querySelector('svg');
        if (svgEl) {
          const panzoom = (await import('panzoom')).default;
          if (isFullscreenTarget) {
            this.panzoomFullscreenInstance = panzoom(svgEl, { smoothScroll: false });
          } else {
            this.panzoomInstance = panzoom(svgEl, { smoothScroll: false });
            this.hasPanzoom.set(true);
          }
        }
      }
    } catch (err) {
      if (!isFullscreenTarget) {
        this.renderError.set(String(err));
      }
    }

    void this.sanitizer;
  }
}
