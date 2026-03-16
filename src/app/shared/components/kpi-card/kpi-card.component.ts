import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../icons/svg-icon.component';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule, SvgIconComponent],
  template: `
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl p-2 lg:p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
      [class.cursor-pointer]="ruta()"
      [routerLink]="ruta() ? ruta() : null"
    >
      <div class="flex items-start justify-between mb-2">
        <div
          class="w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shrink-0"
          [class]="
            'bg-' +
            color() +
            '-100 dark:bg-' +
            color() +
            '-900/40 text-' +
            color() +
            '-600 dark:text-' +
            color() +
            '-400'
          "
        >
          <app-svg-icon [icon]="$any(icon())" size="18px"></app-svg-icon>
        </div>
        @if (ruta()) {
          <app-svg-icon
            icon="arrowRight"
            size="14px"
            class="text-slate-300 dark:text-slate-600 mt-1"
          ></app-svg-icon>
        }
      </div>
      <p
        class="text-[10px] lg:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5"
      >
        {{ label() }}
      </p>
      <p class="text-base lg:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
        {{ value() }}
      </p>
      <p class="text-[10px] lg:text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ subLabel() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  subLabel = input<string>('');
  icon = input.required<string>();
  color = input<string>('primary');
  ruta = input<string | unknown[] | undefined>(undefined);
}
