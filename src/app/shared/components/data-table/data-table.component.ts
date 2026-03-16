import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, output, signal, ViewChild } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { IconName } from '../../icons/icon-paths';
import { FormatCurrencyPipe } from '../../pipes/format-currency.pipe';

export type SortDirection = 'asc' | 'desc' | 'none';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'date' | 'badge' | 'custom';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  colSpan?: number; // Para ocupar múltiples columnas en el grid
  badgeColorFunction?: (item: T) => string; // To determine badge color
  badgeTextFunction?: (item: T) => string; // To determine badge text if different from value
  customFormat?: (item: T) => string; // Custom formatting function
  hiddenOnMobile?: boolean; // If true, this column hides and becomes part of the "mobile card" info
  iconFunction?: (item: T) => IconName | undefined; // Function to determine the icon for the cell
  classFunction?: (item: T) => string | undefined; // Function to determine custom CSS classes for the cell
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgClass, DatePipe, SvgIconComponent, FormatCurrencyPipe],
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends { id?: string | number }> {
  @ViewChild('tableTop') tableTop?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      // Reacciona a cambios en los datos (filtros/búsqueda)
      this.data();
      const total = this.totalPages();
      const current = this.currentPage();
      
      // Si la página actual es inválida o los datos han cambiado radicalmente, volvemos a la 1
      if (current > total || current < 1) {
        this.currentPage.set(1);
      }

      // REMOVED: scrollToTop() from here to avoid unwanted jumps on load
    });
  }

  // Inputs
  data = input.required<T[]>();
  columns = input.required<DataTableColumn<T>[]>();
  loading = input<boolean>(false);
  error = input<string | null>(null);

  // Customization Inputs
  emptyIcon = input<IconName>('info');
  emptyMessage = input<string>('No se encontraron registros.');
  actionLabel = input<string>('');
  actionIcon = input<IconName>('touchEye');
  actionText = input<string>('Ver detalle');
  actionVisible = input<boolean>(true);
  actionTrigger = input<'row' | 'button' | 'none'>('button');
  itemsPerPage = input<number>(5);
  totalItemsLabel = input<string>('Total de registros');
  hiddenTextBadgeMob  = input<boolean>(false);

  // Outputs
  actionClick = output<T>();
  retryClick = output<void>();

  // State Signals
  currentPage = signal(1);
  sortConfig = signal<{ key: string; direction: SortDirection }>({
    key: '',
    direction: 'none',
  });

  // Double-tap/click detection
  private lastTapTime = 0;
  private readonly doubleTapThreshold = 550; // ms
  private touchStartX = 0;
  private touchStartY = 0;

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  // Computed Properties
  readonly isActionColumnVisible = computed(() => {
    return this.actionVisible() && this.actionTrigger() !== 'row';
  });

  readonly totalColumns = computed(() => {
    const colsSpan = this.columns().reduce((acc, col) => acc + (col.colSpan || 1), 0);
    return colsSpan + (this.isActionColumnVisible() ? 1 : 0);
  });

  readonly sortedData = computed(() => {
    const dataCopy = [...this.data()];
    const config = this.sortConfig();

    if (config.direction === 'none' || !config.key) {
      return dataCopy;
    }

    dataCopy.sort((a, b) => {
      const valA = this.getNestedValue(a, config.key);
      const valB = this.getNestedValue(b, config.key);

      const aValue = typeof valA === 'string' ? valA.toLowerCase() : valA;
      const bValue = typeof valB === 'string' ? valB.toLowerCase() : valB;

      if (aValue === null || aValue === undefined) return config.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return config.direction === 'asc' ? -1 : 1;

      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return dataCopy;
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.sortedData().length / this.itemsPerPage());
  });

  readonly displayedData = computed(() => {
    const sorted = this.sortedData();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return sorted.slice(startIndex, endIndex);
  });

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const sideWidth = 1; // pages on each side of current
    const pages: (number | string)[] = [];

    if (total <= 1) {
      return [];
    }

    pages.push(1);

    if (current > sideWidth + 2) {
      pages.push('...');
    }

    const startPage = Math.max(2, current - sideWidth);
    const endPage = Math.min(total - 1, current + sideWidth);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (current < total - sideWidth - 1) {
      pages.push('...');
    }

    if (total > 1) {
      pages.push(total);
    }

    return [...new Set(pages)];
  });

  public scrollToTop(): void {
    setTimeout(() => {
      if (this.tableTop?.nativeElement) {
        this.tableTop.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Methods
  onRowClick(item: T): void {
    if (this.actionTrigger() === 'row') {
      // Blur active element to avoid focus remaining in hidden page (Accessibility best practice)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      this.actionClick.emit(item);
    }
  }

  handleInteraction(item: T, event: Event): void {
    if (this.actionTrigger() !== 'row') return;

    const now = Date.now();
    const isTouchEvent = event.type === 'touchend';

    if (isTouchEvent) {
      const touchEvent = event as TouchEvent;
      if (touchEvent.changedTouches.length > 0) {
        const touchX = touchEvent.changedTouches[0].clientX;
        const touchY = touchEvent.changedTouches[0].clientY;
        const deltaX = Math.abs(touchX - this.touchStartX);
        const deltaY = Math.abs(touchY - this.touchStartY);

        // Si hay movimiento de más de 10px, es un scroll y no un tap
        if (deltaX > 10 || deltaY > 10) {
          this.lastTapTime = 0;
          return;
        }
      }

      if (now - this.lastTapTime < this.doubleTapThreshold) {
        // Double tap detected
        this.lastTapTime = 0;
        if (event.cancelable) {
          event.preventDefault();
        }
        this.onRowClick(item);
      } else {
        this.lastTapTime = now;
      }
    } else {
      // dblclick event
      this.onRowClick(item);
    }
  }

  onActionBtnClick(item: T, event: Event): void {
    event.stopPropagation();
    if (this.actionTrigger() === 'button') {
      this.actionClick.emit(item);
    }
  }

  applySort(key: string): void {
    const colConfigs = this.columns().find((c) => c.key === key);
    if (!colConfigs?.sortable) return;

    this.currentPage.set(1);
    const currentConfig = this.sortConfig();
    let newDirection: SortDirection = 'asc';

    if (currentConfig.key === key) {
      if (currentConfig.direction === 'asc') {
        newDirection = 'desc';
      } else if (currentConfig.direction === 'desc') {
        newDirection = 'none';
      }
    }

    this.sortConfig.set({
      key: newDirection === 'none' ? '' : key,
      direction: newDirection,
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.scrollToTop();
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.scrollToTop();
    }
  }

  getNestedValue(item: T, key: string): unknown {
    if (key.includes('.')) {
      return key
        .split('.')
        .reduce((obj: unknown, k) => ((obj as Record<string, unknown>) || {})[k], item);
    }
    return (item as Record<string, unknown>)[key];
  }
}
