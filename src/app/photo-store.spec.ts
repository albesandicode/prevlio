import { TestBed } from '@angular/core/testing';
import { PhotoStore } from './photo-store';

describe('PhotoStore', () => {
  const originalCreateObjectURL = URL.createObjectURL;

  beforeEach(() => {
    // jsdom does not implement createObjectURL, so each file gets a fake URL with its name.
    URL.createObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`);
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
  });

  it('should list the most recent photo first', () => {
    const store = TestBed.inject(PhotoStore);
    const older = new File([''], 'older.jpg', { type: 'image/jpeg' });
    const newer = new File([''], 'newer.jpg', { type: 'image/jpeg' });

    store.addFiles([older]);
    store.addFiles([newer]);

    expect(store.latestFirstUrls()).toEqual(['blob:newer.jpg', 'blob:older.jpg']);
  });
});
