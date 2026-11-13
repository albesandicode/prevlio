import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ApplicationRef } from '@angular/core';
import { PhotoStore } from './photo-store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the empty feed title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('No hay fotos todavía');
  });
});

describe('App photo selection and deletion', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(async () => {
    // jsdom does not implement object URLs, so each file gets a fake URL with its name.
    URL.createObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`);
    URL.revokeObjectURL = vi.fn();

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  // Adds the photos oldest first, so the grid shows them in reverse order.
  async function renderWithPhotos(...names: string[]): Promise<HTMLElement> {
    TestBed.inject(PhotoStore).addFiles(
      names.map((name) => new File([''], name, { type: 'image/jpeg' })),
    );
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function photoButtons(page: HTMLElement): HTMLButtonElement[] {
    return Array.from(page.querySelectorAll<HTMLButtonElement>('.photo-grid-button'));
  }

  function shownUrls(page: HTMLElement): (string | null)[] {
    return photoButtons(page).map((button) => button.querySelector('img')!.getAttribute('src'));
  }

  function trashButton(page: HTMLElement): HTMLButtonElement | null {
    return page.querySelector<HTMLButtonElement>('[aria-label="Eliminar fotos seleccionadas"]');
  }

  async function click(button: HTMLElement): Promise<void> {
    button.click();
    await TestBed.inject(ApplicationRef).whenStable();
  }

  it('should not show the trash when no photo is selected', async () => {
    const page = await renderWithPhotos('a.jpg', 'b.jpg');

    expect(trashButton(page)).toBeNull();
    expect(page.querySelector('.photo-check')).toBeNull();
  });

  it('should select a photo with a check mark and show the trash', async () => {
    const page = await renderWithPhotos('a.jpg', 'b.jpg');
    const [first] = photoButtons(page);

    await click(first);

    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(first.querySelector('.photo-check')?.textContent).toContain('✓');
    expect(trashButton(page)).not.toBeNull();
  });

  it('should deselect a photo when it is pressed again', async () => {
    const page = await renderWithPhotos('a.jpg', 'b.jpg');
    const [first] = photoButtons(page);

    await click(first);
    await click(first);

    expect(first.getAttribute('aria-pressed')).toBe('false');
    expect(first.querySelector('.photo-check')).toBeNull();
    expect(trashButton(page)).toBeNull();
  });

  it('should delete one selected photo and show the notice', async () => {
    const page = await renderWithPhotos('a.jpg', 'b.jpg', 'c.jpg');

    await click(photoButtons(page)[1]);
    await click(trashButton(page)!);

    expect(shownUrls(page)).toEqual(['blob:c.jpg', 'blob:a.jpg']);
    expect(page.querySelector('.notice-success')?.textContent).toContain('Foto eliminada');
    expect(trashButton(page)).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:b.jpg');
  });

  it('should delete several selected photos and keep the order of the rest', async () => {
    const page = await renderWithPhotos('a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg');
    const buttons = photoButtons(page);

    // The grid shows e, d, c, b, a.
    await click(buttons[0]);
    await click(buttons[2]);
    await click(buttons[4]);
    await click(trashButton(page)!);

    expect(shownUrls(page)).toEqual(['blob:d.jpg', 'blob:b.jpg']);
    expect(page.querySelector('.notice-success')?.textContent).toContain('3 fotos eliminadas');
    expect(page.querySelector('.photo-check')).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
  });

  it('should show the empty state after deleting every photo', async () => {
    const page = await renderWithPhotos('a.jpg');

    await click(photoButtons(page)[0]);
    await click(trashButton(page)!);

    expect(page.querySelector('h2')?.textContent).toContain('No hay fotos todavía');
    expect(page.querySelector('.notice-success')?.textContent).toContain('Foto eliminada');
  });
});
