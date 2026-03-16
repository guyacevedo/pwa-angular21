import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-card',
  template: `
    <article class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" [class]="customClass()">
      <header class="border-b border-slate-100 dark:border-slate-700">
        <h2 class="p-4 font-semibold text-slate-800 dark:text-slate-200 text-lg">
          {{ title() }}
        </h2>
      </header>
      <div class="p-4">
        <ng-content></ng-content>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCardComponent {
  title = input.required<string>();
  customClass = input<string>('');
}
