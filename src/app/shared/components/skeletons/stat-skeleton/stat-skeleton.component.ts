import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stat-skeleton',
  standalone: true,
  template: `
    <div
      class="bg-gray-200 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-pulse h-24 w-full"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatSkeletonComponent {}
