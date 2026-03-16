import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  signal,
  computed,
  viewChild,
  untracked,
  effect,
} from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Combobox, ComboboxInput, ComboboxPopupContainer } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { SvgIconComponent } from '../../icons/svg-icon.component';

@Component({
  selector: 'app-combobox-custom',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    SvgIconComponent,
    Combobox,
    ComboboxInput,
    ComboboxPopupContainer,
    Listbox,
    Option,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full relative">
      <div class="flex flex-wrap items-center pb-2">
        <label
          [for]="name()"
          [class.error-label]="showErrors && errorMessages.length > 0"
          class="text-third dark:text-white font-medium"
          >{{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      </div>

      <div
        ngCombobox
        #combobox="ngCombobox"
        class="relative w-full flex flex-col"
        [readonly]="true"
      >
        <div
          class="combobox-input-container flex relative items-center rounded bg-white dark:bg-slate-800 text-black dark:text-white border border-third dark:border-slate-700 shadow focus-within:ring-1 focus-within:ring-sky-500"
          [class.error-input]="showErrors && errorMessages.length > 0"
          [class.opacity-50]="isDisabled"
          [class.pointer-events-none]="isDisabled"
        >
          <input
            ngComboboxInput
            [placeholder]="placeholder()"
            [value]="displayValue()"
            [disabled]="isDisabled"
            class="w-full bg-transparent border-none py-2 px-2 pr-10 rounded placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none text-ellipsis text-[10px]! sm:text-base! placeholder:text-[10px]! sm:placeholder:text-base! cursor-pointer"
            readonly
          />
          <span
            class="material-symbols-outlined arrow-icon absolute right-4 opacity-60 transition-transform duration-200 ease-in-out w-6 h-6 text-[24px] grid place-items-center pointer-events-none dark:text-gray-300"
            translate="no"
            aria-hidden="true"
            >arrow_drop_down</span
          >
        </div>

        <ng-template ngComboboxPopupContainer>
          <!-- Backdrop invisible para capturar clicks fuera -->
          <div
            [class.hidden]="!combobox.expanded()"
            class="fixed inset-0 z-40"
            (click)="closePopup($event)"
            (keydown)="closePopup($event)"
            tabindex="-1"
            aria-hidden="true"
          ></div>

          <div
            [class.hidden]="!combobox.expanded()"
            class="absolute left-0 right-auto top-full bottom-auto p-0 mt-1 w-full border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-inherit z-50 shadow-2xl overflow-hidden block"
          >
            <div
              ngCombobox
              #innerCombobox="ngCombobox"
              filterMode="manual"
              [alwaysExpanded]="true"
              class="bg-white dark:bg-slate-800 w-full rounded-md flex flex-col relative z-50"
            >
              <div class="flex relative items-center border-b border-third dark:border-slate-700">
                <span
                  class="material-symbols-outlined absolute px-2 opacity-60 w-6 h-6 text-[20px] grid place-items-center pointer-events-none dark:text-gray-400"
                  translate="no"
                  aria-hidden="true"
                  >search</span
                >
                <input
                  ngComboboxInput
                  class="w-full bg-transparent text-black dark:text-white border-0 py-3 pl-10 pr-2 focus:outline-none text-sm"
                  [placeholder]="searchPlaceholder()"
                  [(value)]="searchString"
                />
              </div>
              <ng-template ngComboboxPopupContainer>
                @if (filteredOptions().length === 0) {
                  <div class="text-sm text-gray-500 p-3 dark:text-gray-400">Sin resultados</div>
                }
                <div
                  ngListbox
                  selectionMode="explicit"
                  [values]="internalSelectedValues()"
                  (valuesChange)="onValuesChange($event)"
                  class="custom-scrollbar flex flex-col overflow-y-auto max-h-[240px] gap-[2px] p-1 text-black dark:text-white"
                >
                  @for (option of filteredOptions(); track getOptionValue(option)) {
                    <div
                      ngOption
                      [value]="option"
                      [label]="getOptionLabel(option)"
                      (click)="applySelection(option)"
                      (keydown.enter)="applySelection(option)"
                      tabindex="0"
                      class="group flex items-center cursor-pointer m-px px-3 min-h-9 rounded-md text-[10px] sm:text-base! hover:bg-black/5 dark:hover:bg-white/10 data-[active=true]:ring-2 data-[active=true]:ring-inset data-[active=true]:ring-sky-500 aria-selected:text-sky-600 aria-selected:bg-sky-600/10 dark:aria-selected:text-sky-400 dark:aria-selected:bg-sky-400/15"
                    >
                      <span class="flex-1 truncate">{{ getOptionLabel(option) }}</span>
                      <span
                        class="material-symbols-outlined opacity-0 group-aria-selected:opacity-100 w-6 h-6 text-[18px] grid place-items-center pointer-events-none transition-opacity duration-200"
                        translate="no"
                        aria-hidden="true"
                        >check</span
                      >
                    </div>
                  }
                </div>
              </ng-template>
            </div>
          </div>
        </ng-template>
      </div>

      @if (showErrors && errorMessages.length > 0) {
        <ul class="p-0.5 bg-red-secondary w-full rounded mt-1">
          <li
            class="flex flex-wrap justify-start items-center text-sm text-red-primary font-medium pl-1 gap-1"
          >
            <app-svg-icon icon="error" size="18px"></app-svg-icon>
            {{ errorMessages[0] }}
          </li>
        </ul>
      }
    </div>
  `,
  styles: `
    @import url('https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined');

    :host {
      display: block;
      width: 100%;
    }

    .error-label {
      border-color: #291d21;
      color: #9c254d;
    }

    .error-input {
      border-color: #9c254d !important;
    }

    [ngComboboxInput][aria-expanded='true'] + .arrow-icon {
      transform: rotate(180deg);
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 4px;
    }

    :host-context(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #475569;
    }
  `,
})
export class ComboboxCustomComponent implements ControlValueAccessor {
  label = input<string>('Seleccione');
  name = input<string>('');
  placeholder = input<string>('Seleccionar una opción...');
  searchPlaceholder = input<string>('Buscar...');

  required = input<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options = input<any[]>([]);

  bindLabel = input<string>(''); // Propiedad a mostrar (si hay objetos)
  bindValue = input<string>(''); // Propiedad a emitir como valor devuelto (si hay objetos)
  noShowErrors = input<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  combobox = viewChild<Combobox<any>>('combobox');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listbox = viewChild<Listbox<any>>(Listbox);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value = signal<any>(null); // Valor seleccionado actualmente
  searchString = signal<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  internalSelectedValues = computed<any[]>(() => {
    // Forzar recalculaciones cuando cambia la búsqueda/listado visible
    // Esto previene que ngListbox pierda el rastro del "check" verde al re-renderizar las opciones
    this.filteredOptions();

    const obj = this.value();
    const opts = this.options();
    const valKey = this.bindValue();

    if (obj != null && obj !== '') {
      const matched = valKey ? opts.find((o) => o[valKey] === obj) : opts.find((o) => o === obj);
      return matched ? [matched] : [];
    }
    return [];
  });

  isDisabled = false;
  control: NgControl | null = null;
  private ngControl = inject(NgControl, { optional: true, self: true });

  filteredOptions = computed(() => {
    const search = this.searchString().toLowerCase().trim();
    const opts = this.options();
    if (!search) return opts;

    return opts.filter((opt) => {
      const labelStr = this.getOptionLabel(opt).toLowerCase();
      return labelStr.includes(search);
    });
  });

  displayValue = computed(() => {
    const val = this.value();
    if (val == null || val === '') return '';
    const opts = this.options();
    const boundVal = this.bindValue();

    if (!boundVal) return val;

    const matchedOption = opts.find((o) => o[boundVal] === val);
    return matchedOption ? this.getOptionLabel(matchedOption) : val;
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.control = this.ngControl;
    }

    // Reposicionamiento y revisión de foco al abrir o filtrar
    effect(() => {
      const isExpanded = this.combobox()?.expanded();
      this.filteredOptions(); // reaccionar a cambios en filtros

      untracked(() => {
        if (isExpanded) {
          setTimeout(() => {
            if (this.combobox()?.expanded()) {
              // Restaurar foco al elemento seleccionado si la búsqueda se vacía (o al abrir)
              if (!this.searchString()) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const lb = this.listbox() as any;
                if (lb && lb._pattern) {
                  const itemsSignal = lb.items;
                  const optionsPattern = typeof itemsSignal === 'function' ? itemsSignal() : [];
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const selected = optionsPattern.find((i: any) => i.selected && i.selected());

                  if (selected && lb._pattern.inputs?.activeItem) {
                    lb._pattern.inputs.activeItem.set(selected);
                  }
                }
              }

              this.listbox()?.scrollActiveItemIntoView();
            }
          });
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValuesChange(selections: any[]) {
    // Solo reaccionamos a selecciones nuevas (evitamos que se cierre al filtrar buscando letras que vacíen la lista)
    if (this.combobox()?.expanded() && selections.length > 0) {
      this.applySelection(selections[0]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applySelection(selectedObj: any) {
    this.closePopup();
    const emitVal = this.getOptionValue(selectedObj);

    if (this.value() !== emitVal) {
      this.value.set(emitVal);
      this.onChange(emitVal);
      this.onTouched();
    }

    // Asíncrono para sobreescribir el commit automático del ngCombobox interno
    setTimeout(() => {
      this.searchString.set('');
    });
  }

  closePopup(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const htmlCombobox = this.combobox();
    if (htmlCombobox) {
      htmlCombobox.close();
      const nativeInput =
        htmlCombobox.inputElement() ?? htmlCombobox.element.querySelector('input');
      if (nativeInput && typeof nativeInput.blur === 'function') {
        nativeInput.blur();
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOptionLabel(option: any): string {
    const labelKey = this.bindLabel();
    return labelKey && option ? String(option[labelKey]) : String(option);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOptionValue(option: any): any {
    const valueKey = this.bindValue();
    return valueKey && option ? option[valueKey] : option;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(obj: any): void {
    this.value.set(obj);
    this.searchString.set('');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: (val: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  onChange = (_v: any) => {
    // no-op
  };
  onTouched = () => {
    // no-op
  };

  get errorMessages(): string[] {
    const errors = this.control?.control?.errors;
    if (!errors) return [];

    const messages: string[] = [];
    if (errors['required']) messages.push('Este campo es obligatorio.');
    if (errors['minlength'])
      messages.push(`Mínimo ${errors['minlength'].requiredLength} caracteres.`);
    if (errors['maxlength'])
      messages.push(`Máximo ${errors['maxlength'].requiredLength} caracteres.`);
    if (errors['min']) messages.push(`Mínimo ${errors['min'].min}.`);
    if (errors['max']) messages.push(`Máximo ${errors['max'].max}.`);
    if (errors['pattern']) messages.push('Formato inválido.');
    if (errors['email']) messages.push('Correo electrónico inválido.');

    return messages;
  }

  get showErrors(): boolean {
    if (this.noShowErrors()) return false;
    const control = this.control?.control;
    if (!control || !control.errors) return false;
    return !!(control.touched || control.dirty);
  }
}
