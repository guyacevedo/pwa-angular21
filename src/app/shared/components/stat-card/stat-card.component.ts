import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { IconName } from '../../icons/icon-paths';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div
      class="flex flex-row items-center gap-2 bg-blue-50 dark:bg-slate-800 p-1 md:p-2 rounded-xl border border-slate-100 dark:border-slate-700 h-full"
    >
      <app-svg-icon
        [icon]="icon()"
        size="32px"
        [class]="iconClass()"
        class="p-1 rounded-full bg-primary/10 shrink-0"
      ></app-svg-icon>

      <div class="flex flex-col overflow-hidden">
        <span
          class="text-[10px] xl:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase truncate"
          title="{{ label() }}"
        >
          {{ label() }}
        </span>
        <p class="text-xs md:text-base xl:text-2xl font-bold truncate leading-tight" [class]="valueClass()">
          {{ value() }}
        </p>
        @if (subValue()) {
          <p class="text-[10px] xl:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
            {{ subValue() }}
          </p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<IconName>();
  iconClass = input<string>('');
  valueClass = input<string>('');
  subValue = input<string>('');
}
