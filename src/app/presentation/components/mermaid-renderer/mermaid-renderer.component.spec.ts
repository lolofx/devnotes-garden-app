import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MermaidRendererComponent } from './mermaid-renderer.component';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg id="test"><text>diagram</text></svg>' }),
  },
}));

vi.mock('panzoom', () => ({
  default: vi.fn().mockReturnValue({ dispose: vi.fn() }),
}));

describe('MermaidRendererComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MermaidRendererComponent],
    });
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a container div', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.mermaid-renderer')).not.toBeNull();
  });
});
