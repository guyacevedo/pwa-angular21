import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { InventarioFacade } from '../../inventario.facade';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import {
  ESPECIE_LABELS,
  TALLA_LABELS,
  CALIDAD_LABELS,
  ESPECIES_LIST,
  EspeciePez,
} from '../../../../core/models/especie.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Inventario</h1>
          <p class="text-xs text-slate-400">
            Stock valorizado: <span class="font-semibold text-primary">{{ facade.valorTotalInventario() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
          </p>
        </div>
        @if (permissions.canManageInventario()) {
          <a routerLink="ajuste" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold">
            <app-svg-icon icon="edit" size="16px"></app-svg-icon>
            Ajuste
          </a>
        }
      </div>

      <!-- Alertas de rotación -->
      @if (facade.alertasRotacion().length > 0) {
        <div class="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
          <p class="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <app-svg-icon icon="alert" size="14px"></app-svg-icon>
            {{ facade.alertasRotacion().length }} producto(s) requieren rotación (>2 días en bodega)
          </p>
        </div>
      }

      <!-- Filtro por especie -->
      <div class="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
        <div class="flex gap-2 min-w-max">
          <button
            (click)="filtroEspecie.set(null)"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            [class.bg-primary]="!filtroEspecie()"
            [class.text-white]="!filtroEspecie()"
            [class.bg-slate-100]="!!filtroEspecie()"
            [class.dark:bg-slate-800]="!!filtroEspecie()"
            [class.text-slate-600]="!!filtroEspecie()"
          >Todos</button>
          @for (esp of especies; track esp) {
            <button
              (click)="filtroEspecie.set(esp)"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
              [class.bg-primary]="filtroEspecie() === esp"
              [class.text-white]="filtroEspecie() === esp"
              [class.bg-slate-100]="filtroEspecie() !== esp"
              [class.dark:bg-slate-800]="filtroEspecie() !== esp"
              [class.text-slate-600]="filtroEspecie() !== esp"
            >{{ especieLabel(esp) }}</button>
          }
        </div>
      </div>

      <!-- Contenido -->
      <div class="max-w-4xl mx-auto px-4 py-4">
        @if (facade.loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="h-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (itemsFiltrados().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500 dark:text-slate-400">Sin stock para los filtros seleccionados</p>
          </div>
        } @else {
          <div class="space-y-2">
            @for (item of itemsFiltrados(); track item.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3"
                   [class.border-amber-200]="item.alertaRotacion"
                   [class.dark:border-amber-800]="item.alertaRotacion">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {{ especieLabel(item.especie) }}
                    </p>
                    <app-status-badge [text]="tallaLabel(item.talla)" type="neutral" size="sm" />
                    <app-status-badge
                      [text]="calidadLabel(item.calidad)"
                      [type]="item.calidad === 'FRESCO' ? 'success' : item.calidad === 'REGULAR' ? 'warning' : 'danger'"
                      size="sm"
                    />
                    @if (item.alertaRotacion) {
                      <app-svg-icon icon="alert" size="14px" class="text-amber-500"></app-svg-icon>
                    }
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ item.stockKg | number:'1.0-1' }} kg</p>
                  <p class="text-xs text-slate-400">{{ item.precioVentaKg | currency:'COP':'symbol-narrow':'1.0-0' }}/kg</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class InventarioPage implements OnInit, OnDestroy {
  readonly facade = inject(InventarioFacade);
  readonly permissions = inject(PermissionsService);

  readonly filtroEspecie = signal<EspeciePez | null>(null);
  readonly especies = ESPECIES_LIST;

  readonly itemsFiltrados = computed(() => {
    const filtro = this.filtroEspecie();
    const items = this.facade.items().filter((i) => i.stockKg > 0 || i.stockUnidades > 0);
    return filtro ? items.filter((i) => i.especie === filtro) : items;
  });

  ngOnInit(): void { this.facade.init(); }
  ngOnDestroy(): void { this.facade.destroy(); }

  especieLabel(e: EspeciePez): string { return ESPECIE_LABELS[e] ?? e; }
  tallaLabel(t: string): string { return TALLA_LABELS[t as keyof typeof TALLA_LABELS] ?? t; }
  calidadLabel(c: string): string { return CALIDAD_LABELS[c as keyof typeof CALIDAD_LABELS] ?? c; }
}
