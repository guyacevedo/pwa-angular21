import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { IconName } from '../../icons/icon-paths';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div
      class="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 w-full"
    >
      <app-svg-icon
        [icon]="icon()"
        size="64px"
        class="opacity-20 mb-4"
        [class]="iconClass()"
      ></app-svg-icon>
      <p class="text-lg font-medium text-center px-4">{{ message() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  icon = input<IconName>('info');
  message = input.required<string>();
  iconClass = input<string>('');
}
