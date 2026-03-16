import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { IconName } from '../../icons/icon-paths';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent],
  template: `
    <div
      class="flex items-start gap-3 p-2 lg:p-4 rounded-xl border transition-all hover:shadow-sm"
      [class.bg-red-50]="tipo() === 'danger'"
      [class.border-red-200]="tipo() === 'danger'"
      [class.dark:bg-red-900/20]="tipo() === 'danger'"
      [class.dark:border-red-800]="tipo() === 'danger'"
      [class.bg-amber-50]="tipo() === 'warning'"
      [class.border-amber-200]="tipo() === 'warning'"
      [class.dark:bg-amber-900/20]="tipo() === 'warning'"
      [class.dark:border-amber-800]="tipo() === 'warning'"
      [class.bg-blue-50]="tipo() === 'info'"
      [class.border-blue-200]="tipo() === 'info'"
      [class.dark:bg-blue-900/20]="tipo() === 'info'"
      [class.dark:border-blue-800]="tipo() === 'info'"
      [class.cursor-pointer]="ruta()"
      [routerLink]="ruta() ? ruta() : null"
    >
      <app-svg-icon
        [icon]="iconName()"
        size="20px"
        class="shrink-0 mt-0.5"
        [class.text-red-500]="tipo() === 'danger'"
        [class.text-amber-500]="tipo() === 'warning'"
        [class.text-blue-500]="tipo() === 'info'"
      ></app-svg-icon>
      <div>
        <p
          class="font-bold text-sm"
          [class.text-red-700]="tipo() === 'danger'"
          [class.dark:text-red-300]="tipo() === 'danger'"
          [class.text-amber-700]="tipo() === 'warning'"
          [class.dark:text-amber-300]="tipo() === 'warning'"
          [class.text-blue-700]="tipo() === 'info'"
          [class.dark:text-blue-300]="tipo() === 'info'"
        >
          {{ titulo() }}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ descripcion() }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertCardComponent {
  titulo = input.required<string>();
  descripcion = input.required<string>();
  tipo = input.required<'danger' | 'warning' | 'info'>();
  ruta = input<string | undefined>(undefined);

  iconName = computed<IconName>(() => {
    switch (this.tipo()) {
      case 'danger':
        return 'error';
      case 'warning':
        return 'alert';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  });
}
