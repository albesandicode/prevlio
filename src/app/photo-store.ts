import { Injectable, computed, signal } from '@angular/core';

export interface AddFilesResult {
  added: File[];
  rejected: File[];
}

// Keeps the selected photos in memory only; they are lost when the app is closed.
@Injectable({ providedIn: 'root' })
export class PhotoStore {
  private readonly photos = signal<File[]>([]);

  readonly count = computed(() => this.photos().length);

  addFiles(files: File[]): AddFilesResult {
    const added = files.filter((file) => isImage(file));
    const rejected = files.filter((file) => !isImage(file));

    if (added.length > 0) {
      this.photos.update((photos) => [...photos, ...added]);
    }

    return { added, rejected };
  }
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}
