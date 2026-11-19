import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { PhotoStore } from './photo-store';

type NoticeType = 'success' | 'error';

interface GridPosition {
  left: number;
  top: number;
}

interface Notice {
  id: number;
  type: NoticeType;
  message: string;
}

@Component({
  selector: 'app-root',
  imports: [CdkDropList, CdkDrag],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly photoStore = inject(PhotoStore);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly photoGrid = viewChild<ElementRef<HTMLUListElement>>('photoGrid');
  // Layout position of each grid item, used to animate the items the CDK moves while sorting.
  private photoPositions = new Map<HTMLElement, GridPosition>();
  private nextNoticeId = 0;
  // Set when a drag starts so the click fired on release does not toggle the selection.
  private ignoreNextClick = false;

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

  protected onPhotoDragStarted(): void {
    this.ignoreNextClick = true;
    this.photoPositions = this.readPhotoPositions();
  }

  // In "mixed" orientation the CDK reorders the DOM instead of using transforms,
  // so the items jump. Each moved item is animated from its old position to the new one.
  protected onPhotoSorted(): void {
    const newPositions = this.readPhotoPositions();

    if (!prefersReducedMotion()) {
      for (const [item, newPosition] of newPositions) {
        const oldPosition = this.photoPositions.get(item);
        if (oldPosition) {
          slideFrom(item, oldPosition, newPosition);
        }
      }
    }

    this.photoPositions = newPositions;
  }

  protected onPhotoDropped(event: CdkDragDrop<string[]>): void {
    this.photoStore.moveInFeed(event.previousIndex, event.currentIndex);
    // If no click follows the release, stop ignoring clicks after this event loop turn.
    setTimeout(() => (this.ignoreNextClick = false));
  }

  // offsetLeft and offsetTop ignore running animations, so they give the final layout position.
  private readPhotoPositions(): Map<HTMLElement, GridPosition> {
    const positions = new Map<HTMLElement, GridPosition>();
    const grid = this.photoGrid()?.nativeElement;

    for (const item of Array.from(grid?.children ?? [])) {
      // Items hidden by the CDK during the drag have no offsetParent and are skipped.
      if (item instanceof HTMLElement && item.offsetParent) {
        positions.set(item, { left: item.offsetLeft, top: item.offsetTop });
      }
    }

    return positions;
  }

  protected toggleSelection(url: string): void {
    if (this.ignoreNextClick) {
      this.ignoreNextClick = false;
      return;
    }

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

const SORT_ANIMATION_MS = 250;

function slideFrom(item: HTMLElement, from: GridPosition, to: GridPosition): void {
  const deltaX = from.left - to.left;
  const deltaY = from.top - to.top;
  if (deltaX === 0 && deltaY === 0) {
    return;
  }

  // A photo that moves again while sliding starts a fresh animation instead of stacking two.
  for (const running of item.getAnimations()) {
    running.cancel();
  }

  // The CDK sorts by the element under the finger. While the photo slides under it,
  // it must not count, or the CDK swaps the photos again and again.
  item.style.pointerEvents = 'none';

  const animation = item.animate(
    [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }],
    { duration: SORT_ANIMATION_MS, easing: 'cubic-bezier(0, 0, 0.2, 1)' },
  );
  animation.onfinish = () => (item.style.pointerEvents = '');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
