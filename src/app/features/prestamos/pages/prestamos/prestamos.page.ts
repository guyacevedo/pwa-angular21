import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FirebasePrestamosService } from '../../firebase-prestamos.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ContactosFacade } from '../../../contactos/contactos.facade';
import { TIPO_PRESTAMO_LABELS } from '../../../../core/models/prestamo.model';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Préstamos</h1>
        @if (permissions.canManagePrestamos()) {
          <a routerLink="nuevo" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold">
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Nuevo
          </a>
        }
      </div>

      <div class="max-w-4xl mx-auto px-4 py-4">
        @if (service.loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2,3]; track i) {
              <div class="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (service.prestamos().length === 0) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay préstamos registrados</p>
          </div>
        } @else {
          <div class="space-y-2">
            @for (p of service.prestamos(); track p.id) {
              <div class="flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ contactoNombre(p.contactoId) }}</p>
                    <app-status-badge
                      [text]="tipoLabel(p.tipo)"
                      [type]="p.tipo === 'RECIBIDO' ? 'warning' : 'primary'"
                      size="sm"
                    />
                    <app-status-badge
                      [text]="p.estado === 'ACTIVO' ? 'Activo' : p.estado === 'PAGADO' ? 'Pagado' : 'Anulado'"
                      [type]="p.estado === 'ACTIVO' ? 'success' : p.estado === 'PAGADO' ? 'neutral' : 'danger'"
                      size="sm"
                    />
                  </div>
                  <p class="text-xs text-slate-400">{{ p.fechaInicio | date:'dd/MM/yyyy' }} · Interés: {{ p.tasaInteresMensual }}% mensual</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-xs text-slate-400">Saldo</p>
                  <p class="text-sm font-bold text-red-500">{{ p.saldoPendiente | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class PrestamosPage implements OnInit, OnDestroy {
  readonly service = inject(FirebasePrestamosService);
  readonly permissions = inject(PermissionsService);
  private readonly contactosFacade = inject(ContactosFacade);

  ngOnInit(): void {
    this.service.startListening();
    this.contactosFacade.init();
  }

  ngOnDestroy(): void {
    this.service.stopListening();
  }

  contactoNombre(id: string): string {
    return this.contactosFacade.contactos().find((c) => c.id === id)?.nombre ?? id;
  }

  tipoLabel(tipo: string): string {
    return TIPO_PRESTAMO_LABELS[tipo as keyof typeof TIPO_PRESTAMO_LABELS] ?? tipo;
  }
}
