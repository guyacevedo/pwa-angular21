import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FirebaseViajesService } from '../../firebase-viajes.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ESTADO_VIAJE_LABELS } from '../../../../core/models/viaje.model';

@Component({
  selector: 'app-viajes',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Viajes</h1>
        @if (permissions.canManageViajes()) {
          <a routerLink="nuevo" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold">
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Nuevo viaje
          </a>
        }
      </div>

      <div class="max-w-4xl mx-auto px-4 py-4">
        @if (service.loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2,3]; track i) {
              <div class="h-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (service.viajes().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay viajes registrados</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (viaje of service.viajes(); track viaje.id) {
              <a [routerLink]="[viaje.id]" class="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <app-status-badge
                      [text]="estadoLabel(viaje.estado)"
                      [type]="viaje.estado === 'EN_TRANSITO' ? 'warning' : viaje.estado === 'FINALIZADO' ? 'success' : viaje.estado === 'CANCELADO' ? 'danger' : 'neutral'"
                      size="sm"
                    />
                    <span class="text-xs text-slate-400">{{ viaje.horaSalida | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <span class="text-xs font-semibold text-slate-500">{{ viaje.cavasIds.length }} cava(s)</span>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  @for (ruta of viaje.rutas; track $index) {
                    <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs">{{ ruta }}</span>
                  }
                </div>
                @if (viaje.totalGastos > 0) {
                  <p class="text-xs text-slate-400 mt-2">Gastos: {{ viaje.totalGastos | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                }
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ViajesPage implements OnInit, OnDestroy {
  readonly service = inject(FirebaseViajesService);
  readonly permissions = inject(PermissionsService);

  ngOnInit(): void { this.service.startListening(); }
  ngOnDestroy(): void { this.service.stopListening(); }

  estadoLabel(e: string): string { return ESTADO_VIAJE_LABELS[e as keyof typeof ESTADO_VIAJE_LABELS] ?? e; }
}
