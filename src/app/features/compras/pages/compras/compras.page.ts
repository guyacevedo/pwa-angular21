import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FirebaseComprasService } from '../../firebase-compras.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ContactosFacade } from '../../../contactos/contactos.facade';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Compras</h1>
        @if (permissions.canManageCompras()) {
          <a routerLink="nueva" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold">
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Nueva compra
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
        } @else if (service.compras().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay compras registradas</p>
            @if (permissions.canManageCompras()) {
              <a routerLink="nueva" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold">
                <app-svg-icon icon="add" size="16px"></app-svg-icon>
                Registrar primera compra
              </a>
            }
          </div>
        } @else {
          <div class="space-y-2">
            @for (compra of service.compras(); track compra.id) {
              <a [routerLink]="[compra.id]" class="flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ proveedorNombre(compra.proveedorId) }}</p>
                    <app-status-badge
                      [text]="compra.estado === 'PAGADA' ? 'Pagada' : compra.estado === 'CREDITO' ? 'Crédito' : 'Anulada'"
                      [type]="compra.estado === 'PAGADA' ? 'success' : compra.estado === 'CREDITO' ? 'warning' : 'danger'"
                      size="sm"
                    />
                  </div>
                  <p class="text-xs text-slate-400">{{ compra.fecha | date:'dd/MM/yyyy' }} · {{ compra.items.length }} ítem(s)</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ compra.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  @if (compra.saldoPendiente > 0) {
                    <p class="text-xs text-red-500">Saldo: {{ compra.saldoPendiente | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
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
export class ComprasPage implements OnInit, OnDestroy {
  readonly service = inject(FirebaseComprasService);
  readonly permissions = inject(PermissionsService);
  private readonly contactosFacade = inject(ContactosFacade);

  ngOnInit(): void {
    this.service.startListening();
    this.contactosFacade.init();
  }

  ngOnDestroy(): void {
    this.service.stopListening();
  }

  proveedorNombre(id: string): string {
    return this.contactosFacade.contactos().find((c) => c.id === id)?.nombre ?? id;
  }
}
