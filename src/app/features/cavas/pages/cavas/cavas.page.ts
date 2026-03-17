import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FirebaseCavasService } from '../../firebase-cavas.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ESTADO_CAVA_LABELS, EstadoCava } from '../../../../core/models/cava.model';

@Component({
  selector: 'app-cavas',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Cavas</h1>
          <p class="text-xs text-slate-400">{{ service.disponibles().length }} disponibles · {{ service.enCirculacion().length }} en circulación</p>
        </div>
        @if (permissions.canManageCavas()) {
          <a routerLink="nueva" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold">
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Registrar
          </a>
        }
      </div>

      <!-- Alertas fin de vida útil -->
      @if (service.alertaFinVidaUtil().length > 0) {
        <div class="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
          <p class="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <app-svg-icon icon="alert" size="14px"></app-svg-icon>
            {{ service.alertaFinVidaUtil().length }} cava(s) próximas a cumplir su vida útil
          </p>
        </div>
      }

      <!-- Filtros estado -->
      <div class="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto">
        <button
          (click)="filtroEstado.set(null)"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
          [class.bg-primary]="!filtroEstado()" [class.text-white]="!filtroEstado()"
          [class.bg-slate-100]="!!filtroEstado()" [class.dark:bg-slate-800]="!!filtroEstado()" [class.text-slate-600]="!!filtroEstado()"
        >Todas</button>
        @for (estado of estados; track estado.value) {
          <button
            (click)="filtroEstado.set(estado.value)"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
            [class.bg-primary]="filtroEstado() === estado.value" [class.text-white]="filtroEstado() === estado.value"
            [class.bg-slate-100]="filtroEstado() !== estado.value" [class.dark:bg-slate-800]="filtroEstado() !== estado.value" [class.text-slate-600]="filtroEstado() !== estado.value"
          >{{ estado.label }}</button>
        }
      </div>

      <!-- Lista -->
      <div class="max-w-4xl mx-auto px-4 py-4">
        @if (service.loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="h-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (cavasFiltradas().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay cavas registradas</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            @for (cava of cavasFiltradas(); track cava.id) {
              <div class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
                   [class.border-amber-200]="cava.alertaBajaProxima"
                   [class.dark:border-amber-800]="cava.alertaBajaProxima">
                <!-- Código -->
                <div class="size-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ cava.codigoFisico }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <app-status-badge
                      [text]="estadoLabel(cava.estado)"
                      [type]="cava.estado === 'DISPONIBLE' ? 'success' : cava.estado === 'EN_VIAJE' ? 'warning' : cava.estado === 'BAJA' ? 'danger' : 'neutral'"
                      size="sm"
                    />
                    @if (cava.alertaBajaProxima) {
                      <app-svg-icon icon="alert" size="12px" class="text-amber-500"></app-svg-icon>
                    }
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5">{{ cava.viajesRealizados }}/{{ cava.vidaUtilMax }} viajes · {{ cava.capacidadKg }}kg</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class CavasPage implements OnInit, OnDestroy {
  readonly service = inject(FirebaseCavasService);
  readonly permissions = inject(PermissionsService);
  readonly filtroEstado = signal<EstadoCava | null>(null);

  readonly estados = Object.entries(ESTADO_CAVA_LABELS).map(([v, l]) => ({
    value: v as EstadoCava,
    label: l,
  }));

  readonly cavasFiltradas = computed(() => {
    const filtro = this.filtroEstado();
    const list = this.service.cavas();
    return filtro ? list.filter((c) => c.estado === filtro) : list;
  });

  ngOnInit(): void { this.service.startListening(); }
  ngOnDestroy(): void { this.service.stopListening(); }

  estadoLabel(e: EstadoCava): string { return ESTADO_CAVA_LABELS[e] ?? e; }
}
