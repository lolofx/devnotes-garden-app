import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ShareButtonComponent } from './share-button.component';

describe('ShareButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareButtonComponent],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ShareButtonComponent);
    fixture.componentRef.setInput('title', 'Ma note');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('share() — when navigator.share is available', () => {
    it('should call navigator.share with title and url when share() is called', () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, share: shareMock });

      const fixture = TestBed.createComponent(ShareButtonComponent);
      fixture.componentRef.setInput('title', 'Ma note');
      fixture.componentRef.setInput('url', 'https://example.com/notes/ma-note');
      fixture.detectChanges();

      fixture.componentInstance.share();

      expect(shareMock).toHaveBeenCalledWith({
        title: 'Ma note',
        url: 'https://example.com/notes/ma-note',
      });
    });
  });

  describe('share() — when navigator.share is not available', () => {
    it('should call showModal on the dialog when share() is called', () => {
      vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn() } });

      const fixture = TestBed.createComponent(ShareButtonComponent);
      fixture.componentRef.setInput('title', 'Ma note');
      fixture.componentRef.setInput('url', 'https://example.com/notes/ma-note');
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
      // jsdom ne supporte pas showModal nativement — on l'ajoute avant d'espionner
      dialog.showModal = vi.fn();
      const showModal = vi.spyOn(dialog, 'showModal');

      fixture.componentInstance.share();

      expect(showModal).toHaveBeenCalled();
    });
  });

  describe('copyUrl()', () => {
    it('should set copied to true when copyUrl() is called', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });

      const fixture = TestBed.createComponent(ShareButtonComponent);
      fixture.componentRef.setInput('title', 'Ma note');
      fixture.componentRef.setInput('url', 'https://example.com/notes/ma-note');
      fixture.detectChanges();

      fixture.componentInstance.copyUrl();
      await Promise.resolve();

      expect(fixture.componentInstance.copied()).toBe(true);
    });

    it('should reset copied to false after 2000ms', async () => {
      vi.useFakeTimers();
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });

      const fixture = TestBed.createComponent(ShareButtonComponent);
      fixture.componentRef.setInput('title', 'Ma note');
      fixture.componentRef.setInput('url', 'https://example.com/notes/ma-note');
      fixture.detectChanges();

      fixture.componentInstance.copyUrl();
      await Promise.resolve();
      expect(fixture.componentInstance.copied()).toBe(true);

      vi.advanceTimersByTime(2000);
      expect(fixture.componentInstance.copied()).toBe(false);
    });

    it('should write the provided url to clipboard when copyUrl() is called', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });

      const fixture = TestBed.createComponent(ShareButtonComponent);
      fixture.componentRef.setInput('title', 'Ma note');
      fixture.componentRef.setInput('url', 'https://example.com/notes/ma-note');
      fixture.detectChanges();

      fixture.componentInstance.copyUrl();
      await Promise.resolve();

      expect(writeText).toHaveBeenCalledWith('https://example.com/notes/ma-note');
    });
  });

  describe('closeDialog()', () => {
    it('should call close on the dialog when closeDialog() is called', () => {
      const fixture = TestBed.createComponent(ShareButtonComponent);
      fixture.componentRef.setInput('title', 'Ma note');
      fixture.componentRef.setInput('url', 'https://example.com/notes/ma-note');
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
      // jsdom ne supporte pas close nativement — on l'ajoute avant d'espionner
      dialog.close = vi.fn();
      const close = vi.spyOn(dialog, 'close');

      fixture.componentInstance.closeDialog();

      expect(close).toHaveBeenCalled();
    });
  });
});
