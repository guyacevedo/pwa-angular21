import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { ICON_PATHS } from '../../icons/icon-paths';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-entity-card',
  imports: [TitleCasePipe, RouterLink, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [routerLink]="link()"
      class="group h-full flex flex-col bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
      [class.cursor-pointer]="link()"
      [class]="customClass()"
    >
      <!-- Background subtle gradient/glow for premium feel on hover -->
      <div
        class="absolute inset-0 bg-linear-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      ></div>

      <!-- Header: Badges -->
      @if (badgeText() || showEditIndicator()) {
        <div class="flex items- justify-between  relative z-10">
          <!-- Badge -->
          @if (badgeText()) {
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
              [class]="badgeResolvedClass()"
            >
              {{ badgeText() }}
            </span>
          }
          <!-- Edit Indicator Overlay -->
          @if (showEditIndicator() && link()) {
            <div
              class="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <app-svg-icon [icon]="editIcon()" size="14px"></app-svg-icon>
              <span>{{ editLabel() }}</span>
            </div>
          }
        </div>
      }
      <!-- Main Info -->
      <div class="flex-1 flex flex-col relative z-10">
        <!-- Icon Container, subtitle and title -->
        <div class="flex items-center gap-2">
          <!-- Icon Container -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm"
            [class]="iconColoredClasses()"
          >
            <app-svg-icon
              [icon]="icon()"
              [size]="iconSize()"
              [class]="iconSvgClasses()"
            ></app-svg-icon>
          </div>
          <div class="mt-2">
            @if (subtitle()) {
              <p
                class="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-0.5 line-clamp-1"
              >
                {{ subtitle() }}
              </p>
            }
            <p
              class="text-base md:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-2 line-clamp-2"
              [title]="title()"
            >
              {{ title() | titlecase }}
            </p>
          </div>
        </div>
        <!-- Details List -->
        @if (details().length > 0) {
          <div class="space-y-1.5  my-auto">
            @for (detail of details(); track detail.label) {
              <p
                class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
              >
                <app-svg-icon
                  [icon]="detail.icon"
                  size="14px"
                  class="opacity-70 shrink-0"
                ></app-svg-icon>
                <span class="line-clamp-1 truncate"
                  >{{ detail.prefix || '' }}{{ detail.value }}{{ detail.suffix || '' }}</span
                >
              </p>
            }
          </div>
        }

        <!-- Footer Metrics -->
        @if (showMetrics() && metrics().length > 0) {
          <div
            class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 grid gap-2 relative z-10"
            [style.grid-template-columns]="'repeat(' + metrics().length + ', minmax(0, 1fr))'"
          >
            @for (metric of metrics(); track metric.label) {
              <div
                class="flex flex-col truncate"
                [class.items-end]="metric.align === 'end'"
                [class.text-right]="metric.align === 'end'"
              >
                <span
                  class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-0.5 truncate w-full"
                >
                  {{ metric.label }}
                </span>
                <span
                  class="font-semibold text-slate-800 dark:text-slate-100 truncate w-full"
                  [class]="metric.valueClass || ''"
                  [class.text-xs]="!metric.large"
                  [class.text-sm]="metric.large"
                  [class.md:text-base]="metric.large"
                >
                  {{ metric.prefix || '' }}{{ metric.value }}{{ metric.suffix || '' }}
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class EntityCardComponent {
  // === Configuración básica ===
  title = input.required<string>();
  subtitle = input<string>('');
  link = input<string | (string | number)[]>();
  // PENDIENTE: Si falta algún icono necesario, asignar el string 'error' aquí e informaremos el faltante en un comentario para su posterior inclusión.
  // Ejemplo: "Falta icono 'scale', usando 'error' temporalmente"
  icon = input.required<keyof typeof ICON_PATHS>();

  // === Badge de estado ===
  badgeText = input<string>('');
  badgeType = input<'success' | 'warning' | 'danger' | 'info' | 'primary'>('primary');

  // === Detalles adicionales ===
  details = input<
    {
      label: string;
      value: string;
      icon: keyof typeof ICON_PATHS;
      prefix?: string;
      suffix?: string;
    }[]
  >([]);

  // === Métricas en footer ===
  metrics = input<
    {
      label: string;
      value: string | number;
      prefix?: string;
      suffix?: string;
      align?: 'start' | 'end';
      valueClass?: string;
      large?: boolean;
    }[]
  >([]);

  // === Configuración visual ===
  iconSize = input<'20px' | '24px' | '28px'>('24px');
  iconContainerClass = input<string>('');
  iconClass = input<string>(
    'text-primary dark:text-primary-light bg-slate-200 dark:bg-slate-700 size-10 flex items-center justify-center rounded-full',
  );
  customClass = input<string>('');

  // === Comportamiento ===
  showMetrics = input(true);
  showEditIndicator = input(true);
  editLabel = input<string>('Ver Detalles');
  editIcon = input<keyof typeof ICON_PATHS>('visibilityOn');

  // === Clases computadas ===
  readonly badgeResolvedClass = computed(() => {
    const type = this.badgeType();
    const classes = {
      success:
        'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/50',
      warning:
        'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/50',
      danger:
        'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/50',
      info: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50',
      primary:
        'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800/50',
    };
    return classes[type] || classes.primary;
  });

  readonly iconColoredClasses = computed(() => {
    const custom = this.iconContainerClass();
    if (custom) return custom;
    // Premium fallback container class combining color and subtle background
    return 'bg-slate-50 text-slate-600 border border-slate-100 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-700';
  });

  readonly iconSvgClasses = computed(() => {
    // Si iconClass fue modificado pero no es el legacy predeterminado larguísimo, lo respetamos
    const defaultLegacy =
      'text-primary dark:text-primary-light bg-slate-200 dark:bg-slate-700 size-10 flex items-center justify-center rounded-full';
    return this.iconClass() !== defaultLegacy ? this.iconClass() : '';
  });
}
