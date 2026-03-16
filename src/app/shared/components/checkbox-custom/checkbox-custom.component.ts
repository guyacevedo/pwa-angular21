import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SvgIconComponent } from '../../icons/svg-icon.component';

@Component({
  selector: 'app-checkbox-custom',
  template: `
    <div
      class="flex justify-center items-center cursor-pointer gap-1 mb-1 -mt-1"
      (click)="toggle()"
      (keydown.enter)="toggle()"
      (keydown.space)="toggle()"
      tabindex="0"
      role="checkbox"
      [attr.aria-checked]="checked"
      [attr.aria-label]="label()"
    >
      <app-svg-icon
        [icon]="checked ? 'visibilityOn' : 'visibilityOff'"
        class="text-third dark:text-gray-300"
      />
      <span class="text-sm text-third dark:text-gray-300">{{ label() }}
      @if (required()) {
        <span class="text-red-500">*</span>
      }</span>
    </div>
  `,
  imports: [SvgIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxCustomComponent),
      multi: true,
    },
  ],
})
export class CheckboxCustomComponent implements ControlValueAccessor {
  label = input<string>('');
  checked = false;
  disabled = false;
  required = input<boolean>(false);

  onChange: (value: boolean) => void = () => {
    /* no-op */
  };
  onTouched: () => void = () => {
    /* no-op */
  };

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.onTouched();
    }
  }
}
