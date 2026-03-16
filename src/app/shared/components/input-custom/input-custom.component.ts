import { Component, ChangeDetectionStrategy, input, inject, signal, computed } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { IconName } from '../../icons/icon-paths';

@Component({
  selector: 'app-input-custom',
  imports: [ReactiveFormsModule, SvgIconComponent],
  template: `<div class="w-full">
    <div class="flex flex-wrap items-center pb-2">
      <label
        [for]="name()"
        [class.error-label]="showErrors && errorMessages.length > 0"
        class="text-third dark:text-white font-medium"
        [class.opacity-50]="isDisabled()"
        [class.pointer-events-none]="isDisabled()"
        >{{ label() }}
        @if (required()) {
          <span class="text-red-500">*</span>
        }
      </label>
    </div>

    <!-- Input Group with Icon -->
    <div
      class="flex items-center w-full bg-white dark:bg-slate-800 border transition-all duration-200 rounded overflow-hidden shadow focus-within:ring-2 focus-within:ring-third/20 focus-within:border-third"
      [class.border-third]="!showErrors || errorMessages.length === 0"
      [class.border-red-500]="showErrors && errorMessages.length > 0"
      [class.opacity-50]="isDisabled()"
    >
      @if (maskIcon()) {
        <div
          class="flex items-center justify-center pl-3 pr-2  text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-700 h-10"
        >
          <app-svg-icon
            [icon]="maskIcon()!"
            [size]="maskIconSize()"
            [class.-mr-1]="maskIconSize() === '20px'"
            [class.-mr-4]="maskIconSize() === '36px'"
            [class.-mr-2]="maskIconSize() === '24px'"
          ></app-svg-icon>
        </div>
      }

      <input
      lang="es"
        [type]="mask() ? 'text' : type()"
        [placeholder]="placeholder()"
        [autocomplete]="autocomplete()"
        [name]="name()"
        [id]="name()"
        [value]="displayValue()"
        [disabled]="isDisabled()"
        [attr.minlength]="minlength()"
        [attr.maxlength]="maxlength()"
        [min]="min()"
        [max]="max()"
        [inputMode]="inputMode()"
        (input)="handleInput($event)"
        (focus)="handleFocus()"
        (blur)="handleBlur()"
        class="w-full bg-transparent text-slate-900! dark:text-white! border-none py-2 px-3 text-base sm:text-lg! placeholder:text-gray-500! dark:placeholder:text-slate-400! focus:outline-none"
      />
    </div>

    @if (showErrors && errorMessages.length > 0) {
      <ul
        class="p-0.5 mt-1 bg-red-50 dark:bg-red-900/20 w-full rounded border border-red-200 dark:border-red-800"
      >
        <li class="flex items-center text-sm text-red-600 dark:text-red-400 font-medium pl-1 gap-1">
          <app-svg-icon icon="error" size="18px"></app-svg-icon>
          {{ errorMessages[0] }}
        </li>
      </ul>
    }
  </div> `,
  styles: `
    .error-label {
      border-color: #291d21;
      color: #9c254d;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCustomComponent implements ControlValueAccessor {
  // Señales para inputs
  label = input<string>('Campo');
  type = input<string>('text');
  inputMode = input<'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search'>('text');
  placeholder = input<string>('');
  autocomplete = input<string>('off');
  name = input<string>('');
  minlength = input<number>();
  maxlength = input<number>();
  min = input<number | string>();
  max = input<number | string>();
  noShowErrors = input<boolean>(false);
  mask = input<'currency' | 'weight-kg' | 'weight-g' | 'units' | null>(null);
  maskIconSize = input<'20px' | '36px' | '24px'>('20px');
  required = input<boolean>(false);

  maskIcon = computed<IconName | null>(() => {
    const activeMask = this.mask();
    if (!activeMask) return null;
    switch (activeMask) {
      case 'currency':
        return 'cash';
      case 'weight-kg':
      case 'weight-g':
        return 'scale';
      case 'units':
        return 'unit';
      default:
        return 'error';
    }
  });

  value = signal<string | number | null>('');
  displayValue = signal<string>('');
  focused = signal<boolean>(false);
  isDisabled = input<boolean>(false);
  control: NgControl | null = null;
  private ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.control = this.ngControl;
    }
  }

  writeValue(obj: string | number | null): void {
    this.value.set(obj);
    this.displayValue.set(this.formatValue(obj, false));
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_v: string | number | null) => {
    // no-op
  };
  onTouched = () => {
    /* no-op */
  };

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectionStart = inputElement.selectionStart || 0;
    const valueBefore = inputElement.value;

    let inputValue = inputElement.value;

    // 1. Process for numeric masks: remove thousand separators before parsing
    if (this.mask() || this.inputMode() === 'decimal' || this.inputMode() === 'numeric') {
      // Special case for weight-kg: convert comma to dot (mobile friendly)
      if (this.mask() === 'weight-kg') {
        inputValue = inputValue.replace(/,/g, '.');
      }

      // Remove only thousand separators (commas in US locale)
      // Normalize European commas to dots if needed (though here comma is for thousands)
      let normalized = inputValue.replace(/,/g, '');

      // Ensure only one dot
      const parts = normalized.split('.');
      if (parts.length > 2) {
        normalized = parts[0] + '.' + parts.slice(1).join('');
      }

      // Filter out everything except digits, one dot, and one leading minus
      normalized = normalized.replace(/[^0-9.-]/g, '');
      if (normalized.lastIndexOf('-') > 0) {
        normalized = '-' + normalized.replace(/-/g, '');
      }

      inputValue = normalized;
    }

    // 2. Parse and update model
    const parsedValue = this.mask() ? this.parseValue(inputValue) : inputValue;
    this.value.set(parsedValue);

    // 3. Format strictly for display
    const formattedForTyping = this.formatValue(parsedValue, true, inputValue);
    this.displayValue.set(formattedForTyping);

    // 4. Notify listeners
    this.onChange(parsedValue);

    // 5. Restore cursor position
    // We base the new position on the 'content' characters (everything except commas)
    let textBeforeCaret = valueBefore.substring(0, selectionStart);
    if (this.mask() === 'weight-kg') {
      textBeforeCaret = textBeforeCaret.replace(/,/g, '.');
    }
    const contentBefore = textBeforeCaret.replace(/,/g, '');

    setTimeout(() => {
      let newPos = 0;
      let contentFound = '';
      while (newPos < formattedForTyping.length && contentFound.length < contentBefore.length) {
        if (formattedForTyping[newPos] !== ',') {
          contentFound += formattedForTyping[newPos];
        }
        newPos++;
      }
      inputElement.setSelectionRange(newPos, newPos);
    });
  }

  handleFocus() {
    this.focused.set(true);
    // When focusing, keep the current model value but show it formatted as typing (separators only)
    this.displayValue.set(this.formatValue(this.value(), true));
  }

  handleBlur() {
    this.focused.set(false);
    // On blur, round correctly based on mask
    let finalValue = this.value();

    if (finalValue !== null && finalValue !== '' && typeof finalValue === 'number') {
      if (this.mask() === 'currency') {
        finalValue = Math.round((finalValue + Number.EPSILON) * 100) / 100;
      } else if (this.mask() === 'weight-kg') {
        finalValue = Math.round((finalValue + Number.EPSILON) * 100) / 100;
      } else if (this.mask() === 'units') {
        finalValue = Math.round(finalValue);
      }
    }

    this.value.set(finalValue);
    this.displayValue.set(this.formatValue(finalValue, false));
    this.onChange(finalValue);
    this.onTouched();
  }

  formatValue(val: string | number | null, isFocused: boolean, typingRaw?: string): string {
    if (val === null || val === undefined || val === '') return typingRaw ?? '';
    if (!this.mask()) return String(val);

    const num = Number(val);
    if (isNaN(num)) return typingRaw ?? String(val);

    // If focused, we want separators but NO symbols, and we want to preserve typed decimals
    if (isFocused) {
      // If typingRaw is provided, it's the most accurate representation of what the user is currently editing
      let raw = typingRaw !== undefined ? typingRaw : String(val);
      raw = raw.replace(/,/g, ''); // Unmask integer part to re-mask correctly

      const parts = raw.split('.');
      const integerPart = parts[0];

      let formattedInt = integerPart;
      if (integerPart && integerPart !== '-') {
        const n = Number(integerPart);
        if (!isNaN(n)) {
          formattedInt = n.toLocaleString('en-US');
        }
      }

      if (parts.length > 1) {
        return formattedInt + '.' + parts[1];
      }
      return formattedInt;
    }

    switch (this.mask()) {
      case 'currency':
        return (
          '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
      case 'weight-kg':
        return (
          num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
          ' Kg'
        );
      case 'weight-g':
        return (
          num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' g'
        );
      case 'units':
        return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      default:
        return String(val);
    }
  }

  parseValue(val: string): number | null {
    if (!val || val === '-' || val === '.' || val === '-.') return null;

    // Remove thousand separators before parsing
    const clean = val.replace(/,/g, '');
    const num = Number(clean);
    return isNaN(num) ? null : num;
  }

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
    if (errors['invalidName']) messages.push('Solo letras. 2-30 caracteres.');
    if (errors['invalidDni']) messages.push('Solo números. 7-9 dígitos.');
    if (errors['invalidPassword']) messages.push('Mínimo una letra y un número.');
    if (errors['tooYoung']) messages.push('Edad inválida (mín. 18 años).');
    if (errors['tooOld']) messages.push('Edad inválida (máx. 150 años).');
    if (errors['invalidPhone']) messages.push('Solo números. 8-15 dígitos.');
    if (errors['invalidSerialCava'])
      messages.push('Formato inválido. Formato: [A-Z]-[0000-9999]. (Ej: C-0000)');
    if (errors['invalidCostoCompra'])
      messages.push('Formato inválido. Solo números entre 1000 y 50000.');
    if (errors['invalidCostoPersonalizacion'])
      messages.push('Formato inválido. Solo números entre 1000 y 50000.');
    if (errors['invalidViajesRealizados'])
      messages.push('Formato inválido. Solo números entre 0 y 20.');
    if (errors['invalidVidaUtilCava'])
      messages.push('Formato inválido. Solo números entre 1 y 100.');

    return messages;
  }

  get showErrors(): boolean {
    if (this.noShowErrors()) return false;
    const control = this.control?.control;
    if (!control || !control.errors) return false;
    return !!(control.touched || control.dirty);
  }
}
