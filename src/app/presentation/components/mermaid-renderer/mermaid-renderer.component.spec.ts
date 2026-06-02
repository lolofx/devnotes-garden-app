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

  it('should always show toolbar', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.mermaid-renderer__toolbar')).not.toBeNull();
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

  it('should initialize isWide signal to false', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    expect(fixture.componentInstance.isWide()).toBe(false);
  });

  it('should initialize isFullscreen signal to false', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    expect(fixture.componentInstance.isFullscreen()).toBe(false);
  });

  it('should initialize containerHeight signal to 320', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    expect(fixture.componentInstance.containerHeight()).toBe(320);
  });

  it('should toggle isWide when toggleWide() is called', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    expect(fixture.componentInstance.isWide()).toBe(false);
    fixture.componentInstance.toggleWide();
    expect(fixture.componentInstance.isWide()).toBe(true);
    fixture.componentInstance.toggleWide();
    expect(fixture.componentInstance.isWide()).toBe(false);
  });

  it('should apply wide class to wrapper when isWide is true', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    fixture.componentInstance.toggleWide();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.mermaid-renderer--wide')).not.toBeNull();
  });

  it('should set containerHeight within bounds when resize occurs', () => {
    const fixture = TestBed.createComponent(MermaidRendererComponent);
    fixture.componentRef.setInput('code', 'graph LR\n  A-->B');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Simulate resize start at y=100, height=320
    const mousedownEvent = new MouseEvent('mousedown', { clientY: 100 });
    component.onResizeStart(mousedownEvent);

    // Simulate moving up by 200px — new height = 320 - 200 = 120, clamped to 200
    const mousemoveEvent = new MouseEvent('mousemove', { clientY: -100 });
    document.dispatchEvent(mousemoveEvent);
    expect(component.containerHeight()).toBe(200);

    // Simulate mouse up
    document.dispatchEvent(new MouseEvent('mouseup'));
  });
});
