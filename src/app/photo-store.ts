import { Injectable, computed, signal } from '@angular/core';

export interface AddFilesResult {
  added: File[];
  rejected: File[];
}

// Keeps the selected photos in memory only; they are lost when the app is closed.
@Injectable({ providedIn: 'root' })
export class PhotoStore {
  private readonly photos = signal<File[]>([]);
  private readonly photoUrls = new Map<File, string>();

  readonly count = computed(() => this.photos().length);

  // Most recent first, as Instagram shows the feed.
  readonly latestFirstUrls = computed(() =>
    this.photos()
      .map((file) => this.urlFor(file))
      .reverse(),
  );

  addFiles(files: File[]): AddFilesResult {
    const added = files.filter((file) => isImage(file));
    const rejected = files.filter((file) => !isImage(file));

    if (added.length > 0) {
      this.photos.update((photos) => [...photos, ...added]);
    }

    return { added, rejected };
  }

  // Removes the photos shown with the given URLs and releases their object URLs.
  // The remaining photos keep their order. Returns how many photos were removed.
  removePhotos(urls: string[]): number {
    const urlsToRemove = new Set(urls);
    const removed = this.photos().filter((file) => urlsToRemove.has(this.urlFor(file)));

    if (removed.length === 0) {
      return 0;
    }

    this.photos.update((photos) => photos.filter((file) => !removed.includes(file)));

    for (const file of removed) {
      URL.revokeObjectURL(this.urlFor(file));
      this.photoUrls.delete(file);
    }

    return removed.length;
  }

  // Creates the URL only once per file so the <img> elements keep the same src.
  private urlFor(file: File): string {
    let url = this.photoUrls.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this.photoUrls.set(file, url);
    }
    return url;
  }
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}
