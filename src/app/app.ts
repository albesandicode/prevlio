import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { PhotoStore } from './photo-store';

type NoticeType = 'success' | 'error';

interface Notice {
  id: number;
  type: NoticeType;
  message: string;
}

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly photoStore = inject(PhotoStore);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private nextNoticeId = 0;

  protected readonly photoCount = this.photoStore.count;
  protected readonly photoUrls = this.photoStore.latestFirstUrls;
  protected readonly notices = signal<Notice[]>([]);

  protected openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    // Reset so the same file can be selected again.
    input.value = '';

    if (files.length === 0) {
      return;
    }

    const { added, rejected } = this.photoStore.addFiles(files);
    const notices: Notice[] = [];

    if (added.length > 0) {
      notices.push(this.createNotice('success', addedMessage(added.length)));
    }
    if (rejected.length > 0) {
      notices.push(this.createNotice('error', rejectedMessage(rejected)));
    }

    // New notices replace the previous ones so they do not pile up.
    this.notices.set(notices);
  }

  protected closeNotice(id: number): void {
    this.notices.update((notices) => notices.filter((notice) => notice.id !== id));
  }

  private createNotice(type: NoticeType, message: string): Notice {
    return { id: this.nextNoticeId++, type, message };
  }
}

function addedMessage(count: number): string {
  return count === 1 ? '1 foto añadida correctamente' : `${count} fotos añadidas correctamente`;
}

function rejectedMessage(files: File[]): string {
  return files.length === 1
    ? `«${files[0].name}» no es una imagen y no se ha añadido`
    : `${files.length} archivos no son imágenes y no se han añadido`;
}
