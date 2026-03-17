import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FirebaseVentasService } from '../../firebase-ventas.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ContactosFacade } from '../../../contactos/contactos.facade';
import { MODALIDAD_EMPAQUE_LABELS } from '../../../../core/models/venta.model';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Ventas</h1>
        @if (permissions.canManageVentas()) {
          <a routerLink="nueva" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold">
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Nueva venta
          </a>
        }
      </div>

      <!-- Lista -->
      <div class="max-w-4xl mx-auto px-4 py-4">
        @if (service.loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2,3,4]; track i) {
              <div class="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (service.ventas().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay ventas registradas</p>
            @if (permissions.canManageVentas()) {
              <a routerLink="nueva" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold">
                <app-svg-icon icon="add" size="16px"></app-svg-icon>
                Registrar primera venta
              </a>
            }
          </div>
        } @else {
          <div class="space-y-2">
            @for (venta of service.ventas(); track venta.id) {
              <a [routerLink]="[venta.id]" class="flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ clienteNombre(venta.clienteId) }}</p>
                    <app-status-badge
                      [text]="empaqueLabelStr(venta.modalidadEmpaque)"
                      type="neutral"
                      size="sm"
                    />
                    <app-status-badge
                      [text]="venta.estado === 'PAGADA' ? 'Pagada' : venta.estado === 'CREDITO' ? 'Crédito' : 'Anulada'"
                      [type]="venta.estado === 'PAGADA' ? 'success' : venta.estado === 'CREDITO' ? 'warning' : 'danger'"
                      size="sm"
                    />
                  </div>
                  <p class="text-xs text-slate-400">{{ venta.fecha | date:'dd/MM/yyyy' }} · {{ venta.items.length }} producto(s)</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ venta.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  @if (venta.saldoPendiente > 0) {
                    <p class="text-xs text-red-500">Saldo: {{ venta.saldoPendiente | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  }
                </div>
                <app-svg-icon icon="arrowRight" size="16px" class="text-slate-300 shrink-0"></app-svg-icon>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class VentasPage implements OnInit, OnDestroy {
  readonly service = inject(FirebaseVentasService);
  readonly permissions = inject(PermissionsService);
  private readonly contactosFacade = inject(ContactosFacade);

  ngOnInit(): void {
    this.service.startListening();
    this.contactosFacade.init();
  }

  ngOnDestroy(): void {
    this.service.stopListening();
  }

  clienteNombre(id: string): string {
    return this.contactosFacade.contactos().find((c) => c.id === id)?.nombre ?? id;
  }

  empaqueLabelStr(m: string): string {
    return MODALIDAD_EMPAQUE_LABELS[m as keyof typeof MODALIDAD_EMPAQUE_LABELS] ?? m;
  }
}
