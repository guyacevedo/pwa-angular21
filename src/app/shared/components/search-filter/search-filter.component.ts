import { ChangeDetectionStrategy, Component, input, output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { SelectCustomComponent } from '../select-custom/select-custom.component';

@Component({
  selector: 'app-search-filter',
  imports: [SvgIconComponent, FormsModule, SelectCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-1">
      <!-- Input de búsqueda -->
      <div class="relative w-full lg:w-125">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <app-svg-icon icon="search" size="24px" class="text-slate-600 dark:text-slate-400"></app-svg-icon>
        </div>
        <form role="search" (submit)="$event.preventDefault()" class="w-full">
          <input
            #searchInput
            id="q"
            type="text"
            inputmode="search"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            name="q"
            role="searchbox"
            aria-label="Buscar"
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            [value]="searchTerm()"
            (input)="onSearch($event)"
            [placeholder]="placeholder()"
            class="bg-blue-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900! placeholder-slate-500 dark:text-white! dark:placeholder-slate-400 text-sm rounded-xl focus:outline-none focus:ring-0 focus:border-slate-300 dark:focus:border-slate-500 block w-full ps-10 p-2.5"
          />
        </form>
        @if (searchTerm()) {
          <button
            type="button"
            (click)="clearSearch()"
            (mousedown)="$event.preventDefault()"
            class="absolute inset-y-0 end-0 flex items-center pointer-events-auto mr-4"
          >
            <app-svg-icon
              icon="close"
              size="24px"
              class="text-slate-600 dark:text-slate-400"
            ></app-svg-icon>
          </button>
        }
      </div>

      <!-- Botón de resetear filtros (temporalmente oculto con && false) validar en un futuro si es necesario -->
      @if (showReset() && hasActiveFilters() && false) {
        <div class="lg:w-50 xl:w-70 2xl:w-130 not-lg:pt-4">
          <button
            type="button"
            (click)="resetFilters.emit()"
            class="text-[10px] md:text-sm text-primary hover:text-primary/80 font-bold flex gap-1 w-full lg:ml-4"
          >
            <app-svg-icon icon="close" size="12px"></app-svg-icon>
            Borrar filtros
          </button>
        </div>
      }
      <div class="flex flex-row justify-between">
        <!-- Filtros adicionales -->
        @if (showFilters() && filters().length > 0) {
          <div
            class="mt-2 lg:mt-0 w-max lg:w-100 xl:w-105 2xl:w-187.5 overflow-x-auto custom-scrollbar pb-2"
          >
            @for (filter of filters(); track filter.key) {
              <div>
                @switch (filter.type) {
                  @case ('select') {
                    <div class="max-w-100 flex justify-end">
                      <app-select-custom
                        [name]="filter.key"
                        [label]="filter.label"
                        [options]="getStringOptions(filter.options)"
                        [ngModel]="filter.value"
                        (ngModelChange)="onSelectFilterChange(filter.key, $event)"
                      ></app-select-custom>
                    </div>
                  }
                  @case ('chip') {
                    <div class="flex flex-wrap gap-1 min-w-max justify-end">
                      @for (option of filter.options; track option.value) {
                        <button
                          type="button"
                          [class.border-primary]="filter.value === option.value"
                          [class.text-primary]="filter.value === option.value"
                          [class.bg-primary/10]="filter.value === option.value"
                          [class.border-slate-300]="filter.value !== option.value"
                          [class.text-slate-600]="filter.value !== option.value"
                          [class.dark:border-slate-600]="filter.value !== option.value"
                          [class.dark:text-slate-300]="filter.value !== option.value"
                          (click)="onChipFilterChange(filter.key, option.value)"
                          class="h-10 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer border flex items-center justify-center bg-transparent"
                        >
                          {{ option.label }}
                        </button>
                      }
                    </div>
                  }
                  @case ('checkbox') {
                    <label class="flex items-center gap-2 cursor-pointer justify-end">
                      <input
                        [id]="filter.key"
                        type="checkbox"
                        [checked]="filter.value"
                        (change)="onCheckboxChange(filter.key, $event)"
                        class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span class="text-sm text-slate-700 dark:text-slate-300">{{
                        filter.checkboxLabel
                      }}</span>
                    </label>
                  }
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class SearchFilterComponent {
  // === Input principal ===
  searchTerm = input.required<string>();
  placeholder = input('Buscar...');

  // === Configuración de filtros ===
  filters = input<
    {
      key: string;
      label: string;
      type: 'select' | 'chip' | 'checkbox';
      value: string | number | boolean;
      options?: { label: string; value: string | number }[];
      checkboxLabel?: string;
    }[]
  >([]);

  showFilters = input(true);
  showReset = input(true);

  // === Eventos ===
  searchChange = output<string>();
  filterChange = output<{ key: string; value: string | number | boolean }>();
  resetFilters = output<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // === Métodos de manejo de eventos ===
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  clearSearch() {
    this.searchChange.emit('');
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  onFilterChange(key: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterChange.emit({ key, value });
  }

  onSelectFilterChange(key: string, value: string) {
    this.filterChange.emit({ key, value });
  }

  onChipFilterChange(key: string, value: string | number) {
    this.filterChange.emit({ key, value });
  }

  onCheckboxChange(key: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.filterChange.emit({ key, value: checked });
  }

  // === Utilidades ===
  hasActiveFilters(): boolean {
    return (
      this.searchTerm().length > 0 ||
      this.filters().some((filter) => {
        if (filter.type === 'checkbox') {
          return filter.value === true;
        }
        return filter.value && filter.value !== 'ALL';
      })
    );
  }

  getStringOptions(
    options?: { label: string; value: string | number }[],
  ): { label: string; value: string }[] {
    return (options || []).map((o) => ({ ...o, value: String(o.value) }));
  }
}
