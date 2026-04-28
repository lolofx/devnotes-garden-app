import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MermaidRendererComponent } from './mermaid-renderer.component';

const mockDispose = vi.fn();
const mockMoveTo = vi.fn();
const mockZoomAbs = vi.fn();
const mockPanzoom = vi
  .fn()
  .mockReturnValue({ dispose: mockDispose, moveTo: mockMoveTo, zoomAbs: mockZoomAbs });

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg id="test"><text>diagram</text></svg>' }),
  },
}));

vi.mock('panzoom', () => ({ default: mockPanzoom }));

describe('MermaidRendererComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPanzoom.mockReturnValue({ dispose: mockDispose, moveTo: mockMoveTo, zoomAbs: mockZoomAbs });
    TestBed.configureTestingModule({ imports: [MermaidRendererComponent] });
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

  it('should not show reset button before panzoom is initialized', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.mermaid-renderer__reset')).toBeNull();
  });

  it('should not throw when resetZoom() is called without panzoom initialized', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    expect(() => fixture.componentInstance.resetZoom()).not.toThrow();
  });

  it('should not initialize panzoom on touch device', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    expect(mockPanzoom).not.toHaveBeenCalled();
  });
});
