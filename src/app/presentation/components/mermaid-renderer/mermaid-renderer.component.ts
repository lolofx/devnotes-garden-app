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
    <div class="mermaid-renderer">
      <div #container class="mermaid-renderer__diagram"></div>
      @if (hasPanzoom()) {
        <button
          class="mermaid-renderer__reset"
          type="button"
          (click)="resetZoom()"
          aria-label="Réinitialiser le zoom"
        >
          ⟳ Reset zoom
        </button>
      }
      @if (renderError()) {
        <pre class="mermaid-renderer__error">{{ renderError() }}</pre>
      }
    </div>
  `,
})
export class MermaidRendererComponent implements OnDestroy {
  readonly code = input.required<string>();
  readonly lang = input<'mermaid' | 'event-storming'>('mermaid');

  @ViewChild('container') private readonly containerRef!: ElementRef<HTMLDivElement>;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly transformer = inject(EventStormingTransformer);
  private readonly injector = inject(Injector);
  private panzoomInstance: PanzoomInstance | null = null;
  readonly renderError = signal('');
  readonly hasPanzoom = signal(false);

  constructor() {
    afterNextRender(() => {
      effect(
        () => {
          void this.renderDiagram(this.code(), this.lang());
        },
        { injector: this.injector },
      );
    });
  }

  ngOnDestroy(): void {
    this.panzoomInstance?.dispose();
  }

  resetZoom(): void {
    this.panzoomInstance?.moveTo(0, 0);
    this.panzoomInstance?.zoomAbs(0, 0, 1);
  }

  private isTouchDevice(): boolean {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  private async renderDiagram(code: string, lang: 'mermaid' | 'event-storming'): Promise<void> {
    const container = this.containerRef?.nativeElement;
    if (!container) return;

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
      this.renderError.set('');

      this.panzoomInstance?.dispose();
      this.panzoomInstance = null;
      this.hasPanzoom.set(false);

      if (!this.isTouchDevice()) {
        const svgEl = container.querySelector('svg');
        if (svgEl) {
          const panzoom = (await import('panzoom')).default;
          this.panzoomInstance = panzoom(svgEl, { smoothScroll: false });
          this.hasPanzoom.set(true);
        }
      }
    } catch (err) {
      this.renderError.set(String(err));
    }

    void this.sanitizer;
  }
}
