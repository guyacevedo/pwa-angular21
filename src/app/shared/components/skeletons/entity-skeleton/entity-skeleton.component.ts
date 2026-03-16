import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-entity-skeleton',
  standalone: true,
  template: `
    <div
      class="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none animate-pulse w-full h-[220px]"
    >
      <div class="flex justify-between items-start mb-4">
        <div class="size-12 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
        <div class="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
      </div>
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-6"></div>
      <div class="flex gap-4 mt-auto">
        <div class="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
        <div class="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntitySkeletonComponent {}
