import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FirebaseInsumosService } from '../../firebase-insumos.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { INSUMO_LABELS, Insumo, TipoInsumo } from '../../../../core/models/insumo.model';

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Insumos</h1>
        @if (permissions.canManageInsumos()) {
          <button
            (click)="showForm.set(true)"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold"
          >
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Registrar entrada
          </button>
        }
      </div>

      <!-- Alertas stock bajo -->
      @if (insumosAlerta().length > 0) {
        <div class="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
          <p class="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <app-svg-icon icon="alert" size="14px"></app-svg-icon>
            {{ insumosAlerta().length }} insumo(s) por debajo del punto de reorden
          </p>
        </div>
      }

      <!-- Lista de insumos -->
      <div class="max-w-3xl mx-auto px-4 py-4">
        @if (service.loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2,3,4]; track i) {
              <div class="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (service.insumos().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay insumos registrados</p>
            <p class="text-xs text-slate-400 mt-2">Registra hielo, pita, papel y otros insumos operativos</p>
          </div>
        } @else {
          <div class="space-y-2">
            @for (insumo of service.insumos(); track insumo.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-4"
                   [class.border-amber-200]="insumo.stockActual <= insumo.puntoReorden"
                   [class.dark:border-amber-800]="insumo.stockActual <= insumo.puntoReorden">
                <!-- Ícono tipo -->
                <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span class="text-primary text-xs font-bold">{{ tipoLabel(insumo.tipo).charAt(0) }}</span>
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ insumo.nombre }}</p>
                    @if (insumo.stockActual <= insumo.puntoReorden) {
                      <app-status-badge text="Stock bajo" type="warning" size="sm" />
                    }
                  </div>
                  <p class="text-xs text-slate-400">{{ tipoLabel(insumo.tipo) }} · {{ insumo.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}/{{ insumo.unidad }}</p>
                </div>
                <!-- Stock -->
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ insumo.stockActual | number:'1.0-1' }}</p>
                  <p class="text-xs text-slate-400">{{ insumo.unidad }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class InsumosPage implements OnInit, OnDestroy {
  readonly service = inject(FirebaseInsumosService);
  readonly permissions = inject(PermissionsService);
  readonly showForm = signal(false);

  readonly insumosAlerta = computed(() =>
    this.service.insumos().filter((i) => i.activo && i.stockActual <= i.puntoReorden),
  );

  ngOnInit(): void { this.service.startListening(); }
  ngOnDestroy(): void { this.service.stopListening(); }

  tipoLabel(tipo: TipoInsumo): string { return INSUMO_LABELS[tipo] ?? tipo; }
}
