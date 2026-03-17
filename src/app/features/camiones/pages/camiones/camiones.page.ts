import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FirebaseCamionesService } from '../../firebase-camiones.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-camiones',
  standalone: true,
  imports: [RouterLink, DatePipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Camiones</h1>
        @if (permissions.canManageCamiones()) {
          <a routerLink="nuevo" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold">
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Nuevo
          </a>
        }
      </div>

      <!-- Alertas de vencimiento -->
      @if (service.alertasVencimiento().length > 0) {
        <div class="max-w-4xl mx-auto px-4 pt-4 space-y-2">
          @for (alerta of service.alertasVencimiento(); track alerta.camionId + alerta.tipoDocumento) {
            <div
              class="flex items-center gap-3 p-3 rounded-xl border text-sm"
              [class.bg-red-50]="alerta.nivel === 'CRITICO'"
              [class.border-red-200]="alerta.nivel === 'CRITICO'"
              [class.text-red-700]="alerta.nivel === 'CRITICO'"
              [class.bg-amber-50]="alerta.nivel === 'ADVERTENCIA'"
              [class.border-amber-200]="alerta.nivel === 'ADVERTENCIA'"
              [class.text-amber-700]="alerta.nivel === 'ADVERTENCIA'"
              [class.bg-blue-50]="alerta.nivel === 'INFO'"
              [class.border-blue-200]="alerta.nivel === 'INFO'"
              [class.text-blue-700]="alerta.nivel === 'INFO'"
            >
              <app-svg-icon icon="alert" size="16px"></app-svg-icon>
              <span class="font-medium">{{ alerta.placa }}</span>
              <span>{{ alerta.tipoDocumento }} vence en {{ alerta.diasRestantes }} día(s) ({{ alerta.fechaVencimiento | date:'dd/MM/yyyy' }})</span>
            </div>
          }
        </div>
      }

      <div class="max-w-4xl mx-auto px-4 py-4 space-y-3">
        @if (service.loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2]; track i) {
              <div class="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (service.camiones().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay camiones registrados</p>
          </div>
        } @else {
          @for (camion of service.camiones(); track camion.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ camion.placa }}</h2>
                  <p class="text-xs text-slate-500">{{ camion.marca }} {{ camion.modelo }} · {{ camion.anio }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <app-status-badge
                    [text]="camion.activo ? 'Activo' : 'Inactivo'"
                    [type]="camion.activo ? 'success' : 'neutral'"
                    size="sm"
                  />
                  @if (permissions.canManageCamiones()) {
                    <a [routerLink]="[camion.id, 'editar']" class="p-1.5 text-slate-400 hover:text-primary">
                      <app-svg-icon icon="edit" size="16px"></app-svg-icon>
                    </a>
                  }
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                  <p class="text-xs text-slate-400">SOAT</p>
                  <p class="text-xs font-semibold mt-0.5" [class.text-red-600]="isExpiringSoon(camion.vencimientoSoat)" [class.text-slate-700]="!isExpiringSoon(camion.vencimientoSoat)">
                    {{ camion.vencimientoSoat | date:'dd/MM/yy' }}
                  </p>
                </div>
                <div class="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                  <p class="text-xs text-slate-400">Tecno.</p>
                  <p class="text-xs font-semibold mt-0.5" [class.text-red-600]="isExpiringSoon(camion.vencimientoTecnomecanica)" [class.text-slate-700]="!isExpiringSoon(camion.vencimientoTecnomecanica)">
                    {{ camion.vencimientoTecnomecanica | date:'dd/MM/yy' }}
                  </p>
                </div>
                <div class="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                  <p class="text-xs text-slate-400">AUNAP</p>
                  <p class="text-xs font-semibold mt-0.5" [class.text-red-600]="isExpiringSoon(camion.vencimientoAunap)" [class.text-slate-700]="!isExpiringSoon(camion.vencimientoAunap)">
                    {{ camion.vencimientoAunap | date:'dd/MM/yy' }}
                  </p>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class CamionesPage implements OnInit, OnDestroy {
  readonly service = inject(FirebaseCamionesService);
  readonly permissions = inject(PermissionsService);

  ngOnInit(): void { this.service.startListening(); }
  ngOnDestroy(): void { this.service.stopListening(); }

  isExpiringSoon(date: Date): boolean {
    return (date.getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000;
  }
}
