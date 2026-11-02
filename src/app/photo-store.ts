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
