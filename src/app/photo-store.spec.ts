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

describe('PhotoStore removePhotos', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    // jsdom does not implement object URLs, so each file gets a fake URL with its name.
    URL.createObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  function storeWithPhotos(...names: string[]): PhotoStore {
    const store = TestBed.inject(PhotoStore);
    store.addFiles(names.map((name) => new File([''], name, { type: 'image/jpeg' })));
    return store;
  }

  it('should remove one photo and keep the order of the rest', () => {
    const store = storeWithPhotos('a.jpg', 'b.jpg', 'c.jpg');

    const removed = store.removePhotos(['blob:b.jpg']);

    expect(removed).toBe(1);
    expect(store.latestFirstUrls()).toEqual(['blob:c.jpg', 'blob:a.jpg']);
  });

  it('should remove several photos and keep the order of the rest', () => {
    const store = storeWithPhotos('a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg');

    const removed = store.removePhotos(['blob:d.jpg', 'blob:a.jpg']);

    expect(removed).toBe(2);
    expect(store.count()).toBe(3);
    expect(store.latestFirstUrls()).toEqual(['blob:e.jpg', 'blob:c.jpg', 'blob:b.jpg']);
  });

  it('should revoke the URL of each removed photo only', () => {
    const store = storeWithPhotos('a.jpg', 'b.jpg', 'c.jpg');
    store.latestFirstUrls();

    store.removePhotos(['blob:a.jpg', 'blob:c.jpg']);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.jpg');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:c.jpg');
  });

  it('should ignore URLs that do not belong to any photo', () => {
    const store = storeWithPhotos('a.jpg');

    expect(store.removePhotos(['blob:unknown.jpg'])).toBe(0);
    expect(store.latestFirstUrls()).toEqual(['blob:a.jpg']);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });
});

describe('PhotoStore moveInFeed', () => {
  const originalCreateObjectURL = URL.createObjectURL;

  beforeEach(() => {
    // jsdom does not implement createObjectURL, so each file gets a fake URL with its name.
    URL.createObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`);
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
  });

  // Adds the photos in reverse so the feed shows them in the given order.
  function storeWithFeed(...names: string[]): PhotoStore {
    const store = TestBed.inject(PhotoStore);
    const files = names.map((name) => new File([''], name, { type: 'image/jpeg' }));
    store.addFiles(files.reverse());
    return store;
  }

  it('should move the photo at position 0 to position 2', () => {
    const store = storeWithFeed('a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg');

    store.moveInFeed(0, 2);

    expect(store.latestFirstUrls()).toEqual([
      'blob:b.jpg',
      'blob:c.jpg',
      'blob:a.jpg',
      'blob:d.jpg',
      'blob:e.jpg',
    ]);
  });

  it('should not move anything when the position does not exist', () => {
    const store = storeWithFeed('a.jpg', 'b.jpg', 'c.jpg');

    store.moveInFeed(0, 99);  

    expect(store.latestFirstUrls()).toEqual([
      'blob:a.jpg',
      'blob:b.jpg',
      'blob:c.jpg',
    ]);
  });
});
