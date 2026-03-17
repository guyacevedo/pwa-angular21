import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FirebaseVentasService } from '../../firebase-ventas.service';
import { ContactosFacade } from '../../../contactos/contactos.facade';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ESPECIE_LABELS, TALLA_LABELS } from '../../../../core/models/especie.model';
import { MODALIDAD_EMPAQUE_LABELS } from '../../../../core/models/venta.model';

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button (click)="router.navigate(['/ventas'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
          <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
          Ventas
        </button>
      </div>

      @if (!venta()) {
        <div class="text-center py-16"><p class="text-slate-500">Venta no encontrada</p></div>
      } @else {
        <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <!-- Encabezado -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ clienteNombre() }}</p>
                <p class="text-xs text-slate-400">{{ venta()!.fecha | date:'dd MMMM yyyy' }}</p>
              </div>
              <div class="flex gap-2">
                <app-status-badge [text]="empaqueLabel()" type="neutral" size="sm" />
                <app-status-badge
                  [text]="venta()!.estado === 'PAGADA' ? 'Pagada' : venta()!.estado === 'CREDITO' ? 'Crédito' : 'Anulada'"
                  [type]="venta()!.estado === 'PAGADA' ? 'success' : venta()!.estado === 'CREDITO' ? 'warning' : 'danger'"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <!-- Productos -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Productos</h3>
            <div class="space-y-2">
              @for (item of venta()!.items; track $index) {
                <div class="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <div>
                    <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {{ especieLabel(item.especie) }} {{ tallaLabel(item.talla) }}
                    </p>
                    <p class="text-xs text-slate-400">{{ item.cantidad }} {{ item.unidad }} × {{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  </div>
                  <p class="text-sm font-semibold">{{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Gastos -->
          @if (venta()!.totalGastos > 0) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gastos operativos</h3>
              <div class="space-y-1 text-sm">
                @if (venta()!.gastos.hielo > 0) {
                  <div class="flex justify-between"><span class="text-slate-500">Hielo</span><span>{{ venta()!.gastos.hielo | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
                }
                @if (venta()!.gastos.pita > 0) {
                  <div class="flex justify-between"><span class="text-slate-500">Pita</span><span>{{ venta()!.gastos.pita | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
                }
                @if (venta()!.gastos.otros > 0) {
                  <div class="flex justify-between"><span class="text-slate-500">Otros</span><span>{{ venta()!.gastos.otros | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
                }
              </div>
            </div>
          }

          <!-- Totales -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Subtotal productos</span><span>{{ venta()!.subtotalProductos | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              @if (venta()!.totalGastos > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Gastos</span><span>{{ venta()!.totalGastos | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              @if (venta()!.flete > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Flete</span><span>{{ venta()!.flete | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              @if (venta()!.descuentos > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Descuentos</span><span class="text-emerald-500">-{{ venta()!.descuentos | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              @if (venta()!.aumentos > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Aumentos</span><span class="text-amber-500">+{{ venta()!.aumentos | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              <div class="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700 font-bold text-base">
                <span>Total</span><span class="text-primary">{{ venta()!.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              @if (venta()!.saldoPendiente > 0) {
                <div class="flex justify-between font-semibold text-red-500">
                  <span>Saldo pendiente</span><span>{{ venta()!.saldoPendiente | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class VentaDetallePage implements OnInit {
  readonly service = inject(FirebaseVentasService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contactosFacade = inject(ContactosFacade);
  private readonly id = signal('');

  readonly venta = computed(() => this.service.ventas().find((v) => v.id === this.id()));
  readonly clienteNombre = computed(() =>
    this.contactosFacade.contactos().find((c) => c.id === this.venta()?.clienteId)?.nombre ?? this.venta()?.clienteId ?? '',
  );
  readonly empaqueLabel = computed(() =>
    this.venta() ? MODALIDAD_EMPAQUE_LABELS[this.venta()!.modalidadEmpaque] ?? this.venta()!.modalidadEmpaque : '',
  );

  ngOnInit(): void {
    this.service.startListening();
    this.contactosFacade.init();
    this.id.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  especieLabel(e: string): string { return ESPECIE_LABELS[e as keyof typeof ESPECIE_LABELS] ?? e; }
  tallaLabel(t: string): string { return TALLA_LABELS[t as keyof typeof TALLA_LABELS] ?? t; }
}
