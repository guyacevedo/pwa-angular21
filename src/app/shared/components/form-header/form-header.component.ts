import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Location } from '@angular/common';
import { SvgIconComponent } from '../../icons/svg-icon.component';

@Component({
  selector: 'app-form-header',
  imports: [SvgIconComponent],
  template: `
    <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div class="px-4 flex items-center justify-between h-14 relative">
        <div class="flex-none basis-12 flex items-center justify-start">
          @if (showBack()) {
            <button
              type="button"
              (click)="goBack()"
              class="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <app-svg-icon icon="arrowLeft" size="24px"></app-svg-icon>
            </button>
          }
        </div>

        <h1 class="text-lg font-semibold text-gray-800 dark:text-slate-100 absolute left-1/2 -translate-x-1/2 whitespace-nowrap overflow-hidden text-ellipsis">{{ title() }}</h1>
        
        @if (showSave()) {
          <div class="flex-none basis-auto flex items-center justify-end">
            <button
              (click)="save.emit()"
              [disabled]="disabled() || loading()"
              class="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
              @if (loading()) {
                <app-svg-icon icon="refresh" size="16px" class="animate-spin -ml-1 mr-2 text-white"></app-svg-icon>
                Guardando...
              } @else {
                {{ saveLabel() }}
              }
            </button>
          </div>
        } @else {
          <div class="flex-none basis-12"></div>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormHeaderComponent {
  private readonly location = inject(Location);

  title = input.required<string>();
  backUrl = input<string>();
  saveLabel = input<string>('Guardar');
  showSave = input<boolean>(true);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  save = output<void>();

  showBack(): boolean {
    return this.backUrl() !== undefined;
  }

  goBack(): void {
    this.location.back();
  }
}
