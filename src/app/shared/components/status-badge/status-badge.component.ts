import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      class="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border"
      [class]="badgeClass()"
    >
      {{ text() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  text = input.required<string>();
  type = input<'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  outline = input(false);

  readonly badgeClass = computed(() => {
    const type = this.type();
    const size = this.size();
    const outline = this.outline();

    // Clases base
    const baseClasses = 'font-bold uppercase tracking-wider';

    // Clases de tamaño
    const sizeClasses = {
      sm: 'text-[10px] px-2 py-0.5',
      md: 'text-xs px-2.5 py-0.5',
      lg: 'text-sm px-3 py-1',
    };

    // Clases de color (outline vs filled)
    const colorClasses = {
      success: outline
        ? 'text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-700'
        : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800',
      warning: outline
        ? 'text-orange-700 border-orange-200 dark:text-orange-300 dark:border-orange-700'
        : 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800',
      danger: outline
        ? 'text-red-700 border-red-200 dark:text-red-300 dark:border-red-700'
        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
      info: outline
        ? 'text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-700'
        : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
      primary: outline
        ? 'text-primary border-primary/30 dark:text-primary dark:border-primary/50'
        : 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30',
      neutral: outline
        ? 'text-slate-700 border-slate-200 dark:text-slate-300 dark:border-slate-700'
        : 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };

    return `${baseClasses} ${sizeClasses[size]} ${colorClasses[type]}`;
  });
}
