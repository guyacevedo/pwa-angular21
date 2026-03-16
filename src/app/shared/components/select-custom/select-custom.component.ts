import {
  ChangeDetectionStrategy,
  Component,
  signal,
  input,
  inject,
  effect,
  viewChild,
  computed,
} from '@angular/core';
import { ControlValueAccessor, ReactiveFormsModule, NgControl, FormsModule } from '@angular/forms';
import { Combobox, ComboboxInput, ComboboxPopupContainer } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { SvgIconComponent } from "../../icons/svg-icon.component";

@Component({
  selector: 'app-select-custom',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Combobox,
    ComboboxInput,
    ComboboxPopupContainer,
    Listbox,
    Option,
    OverlayModule,
    SvgIconComponent
],
  template: `
    <div class="w-full relative">
      <div class="flex flex-wrap items-center pb-2">
        <label
          [for]="name()"
          class="text-third dark:text-white font-medium"
          [class.error-label]="showErrors && errorMessage"
          [class.opacity-50]="isDisabled()"
          [class.pointer-events-none]="isDisabled()"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      </div>

      <div ngCombobox #combobox="ngCombobox" class="w-full flex flex-col" [readonly]="true">
        <div
          #origin
          class="combobox-input-container flex relative items-center rounded bg-white dark:bg-slate-800 text-black dark:text-white border dark:border-slate-700 shadow focus-within:ring-1 focus-within:ring-sky-500"
          [class.border-third]="!showErrors || errorMessage"
          [class.border-red-500]="showErrors && errorMessage"
          [class.opacity-50]="isDisabled()"
          [class.pointer-events-none]="isDisabled()"
        >
          <input
            ngComboboxInput
            [placeholder]="placeholder()"
            [value]="displayValue()"
            [disabled]="isDisabled()"
            class="w-full bg-transparent border-none py-2 px-2 pr-10 rounded placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none text-ellipsis text-base! sm:text-lg! placeholder:text-base! sm:placeholder:text-lg! cursor-pointer"
            readonly
          />
          <span
            class="material-symbols-outlined arrow-icon absolute right-2 opacity-60 transition-transform duration-200 ease-in-out w-6 h-6 text-[24px] grid place-items-center pointer-events-none dark:text-gray-300"
            translate="no"
            aria-hidden="true"
            >arrow_drop_down</span
          >
        </div>

        <ng-template ngComboboxPopupContainer>
          <ng-template
            [cdkConnectedOverlay]="{ origin, usePopover: 'inline', matchWidth: true }"
            [cdkConnectedOverlayOpen]="true"
          >
            <!-- Backdrop para capturar clicks fuera del popup en móviles -->
            <div
              [class.hidden]="!combobox.expanded()"
              class="fixed inset-0 z-40 pointer-events-auto bg-transparent"
              (click)="closePopup($event)"
              (keydown)="closePopup($event)"
              tabindex="-1"
              aria-hidden="true"
            ></div>

            <div
              [class.hidden]="!combobox.expanded()"
              class="p-0 mt-1 w-full border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-inherit z-50 shadow-2xl overflow-hidden block"
            >
              <div
                ngListbox
                selectionMode="explicit"
                [values]="internalSelectedValues()"
                (valuesChange)="onValuesChange($event)"
                class="custom-scrollbar flex flex-col overflow-y-auto max-h-[240px] gap-[2px] p-1 text-black dark:text-white relative z-50"
              >
                @for (opt of options(); track opt.value) {
                  <div
                    ngOption
                    [value]="opt"
                    [label]="opt.label"
                    (click)="applySelection(opt)"
                    (keydown.enter)="applySelection(opt)"
                    tabindex="0"
                    class="group flex items-center cursor-pointer m-px px-3 min-h-9 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/10 data-[active=true]:ring-2 data-[active=true]:ring-inset data-[active=true]:ring-sky-500 aria-selected:text-sky-600 aria-selected:bg-sky-600/10 dark:aria-selected:text-sky-400 dark:aria-selected:bg-sky-400/15"
                  >
                    <span class="flex-1 truncate">{{ opt.label }}</span>
                    <span
                      class="material-symbols-outlined opacity-0 group-aria-selected:opacity-100 w-6 h-6 text-[18px] grid place-items-center pointer-events-none transition-opacity duration-200"
                      translate="no"
                      aria-hidden="true"
                      >check</span
                    >
                  </div>
                }
              </div>
            </div>
          </ng-template>
        </ng-template>
      </div>

      @if (showErrors && errorMessage) {
         <ul
        class="p-0.5 mt-1 bg-red-50 dark:bg-red-900/20 w-full rounded border border-red-200 dark:border-red-800"
      >
           <li class="flex items-center text-sm text-red-600 dark:text-red-400 font-medium pl-1 gap-1"> <app-svg-icon icon="error" size="18px"></app-svg-icon> {{ errorMessage }}</li> 
        </ul>
      }
    </div>
  `,
  styles: `
    @import url('https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined');

    .error-label {
      border-color: #291d21;
      color: #9c254d;
    }

    :host {
      display: block;
      width: 100%;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectCustomComponent implements ControlValueAccessor {
  options = input<{ value: string; label: string }[]>([]);
  label = input<string>('Campo');
  name = input<string>('');
  labelMap = input<Map<string, string>>();
  placeholder = input<string | undefined>('Seleccionar...');
  showValue = input<boolean>(false);
  required = input<boolean>(false);

  combobox = viewChild<Combobox<{ value: string; label: string }>>('combobox');
  listbox = viewChild<Listbox<{ value: string; label: string }>>(Listbox);

  value = signal('');
  hasChanged = false;
  isDisabled = input<boolean>(false);
  control: NgControl | null = null;

  private ngControl = inject(NgControl, { optional: true, self: true });

  displayValue = computed(() => {
    const val = this.value();
    if (val == null || val === '') return '';
    const opts = this.options();
    const matchedOption = opts.find((o) => o.value === val);
    return matchedOption ? matchedOption.label : val;
  });

  internalSelectedValues = computed<{ value: string; label: string }[]>(() => {
    const val = this.value();
    if (val == null || val === '') return [];
    const opts = this.options();
    const matchedOption = opts.find((o) => o.value === val);
    return matchedOption ? [matchedOption] : [];
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.control = this.ngControl;
    }

    // Effect para sincronizar value cuando el control cambia (ej. via setValue desde fuera)
    effect(() => {
      if (this.control?.control) {
        const currentValue = this.control.control.value;
        if (currentValue !== undefined && currentValue !== null && currentValue !== this.value()) {
          this.value.set(currentValue);
        }
      }
    });
  }

  onValuesChange(selections: { value: string; label: string }[]) {
    if (this.combobox()?.expanded() && selections.length > 0) {
      this.applySelection(selections[0]);
    }
  }

  applySelection(selectedOpt: { value: string; label: string }) {
    this.closePopup();
    const emitVal = selectedOpt.value;

    if (this.value() !== emitVal) {
      this.value.set(emitVal);
      this.hasChanged = true;
      this.onChange(emitVal);
      this.onTouched();
    }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_: string) => {
    /* no-op */
  };
  onTouched = () => {
    /* no-op */
  };

  writeValue(obj: string): void {
    if (obj !== undefined && obj !== null) {
      this.value.set(obj);
    } else {
      this.value.set('');
    }
  }

  registerOnChange(fn: (_: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  get showErrors(): boolean {
    return !!(
      this.control?.control?.invalid &&
      (this.control?.control?.touched || this.control?.control?.dirty)
    );
  }

  get errorMessage(): string | null {
    const errors = this.control?.control?.errors;
    if (!errors) return null;
    if (errors['required']) return 'Este campo es obligatorio.';
    return null;
  }
}
