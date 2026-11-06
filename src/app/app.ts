import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
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
  protected readonly selectedUrls = signal<ReadonlySet<string>>(new Set());
  protected readonly hasSelection = computed(() => this.selectedUrls().size > 0);

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

  protected isSelected(url: string): boolean {
    return this.selectedUrls().has(url);
  }

  protected toggleSelection(url: string): void {
    // A new Set is created so the signal notices the change.
    this.selectedUrls.update((selected) => {
      const next = new Set(selected);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }

  protected deleteSelected(): void {
    const removedCount = this.photoStore.removePhotos([...this.selectedUrls()]);
    this.selectedUrls.set(new Set());

    if (removedCount > 0) {
      this.notices.set([this.createNotice('success', deletedMessage(removedCount))]);
    }
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

function deletedMessage(count: number): string {
  return count === 1 ? 'Foto eliminada' : `${count} fotos eliminadas`;
}

function rejectedMessage(files: File[]): string {
  return files.length === 1
    ? `«${files[0].name}» no es una imagen y no se ha añadido`
    : `${files.length} archivos no son imágenes y no se han añadido`;
}
