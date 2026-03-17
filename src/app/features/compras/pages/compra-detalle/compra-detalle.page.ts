import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FirebaseComprasService } from '../../firebase-compras.service';
import { ContactosFacade } from '../../../contactos/contactos.facade';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ESPECIE_LABELS, TALLA_LABELS } from '../../../../core/models/especie.model';

@Component({
  selector: 'app-compra-detalle',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button (click)="router.navigate(['/compras'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
          <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
          Compras
        </button>
      </div>

      @if (!compra()) {
        <div class="text-center py-16"><p class="text-slate-500">Compra no encontrada</p></div>
      } @else {
        <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <!-- Resumen -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ proveedorNombre() }}</p>
                <p class="text-xs text-slate-400">{{ compra()!.fecha | date:'dd MMMM yyyy' }}</p>
              </div>
              <app-status-badge
                [text]="compra()!.estado === 'PAGADA' ? 'Pagada' : compra()!.estado === 'CREDITO' ? 'Crédito' : 'Anulada'"
                [type]="compra()!.estado === 'PAGADA' ? 'success' : compra()!.estado === 'CREDITO' ? 'warning' : 'danger'"
                size="md"
              />
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Productos comprados</h3>
            <div class="space-y-2">
              @for (item of compra()!.items; track $index) {
                <div class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <div>
                    <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {{ item.esInsumo ? (item.nombreInsumo ?? 'Insumo') : ((item.especie ? especieLabel(item.especie) : '') + ' ' + (item.talla ? tallaLabel(item.talla) : '')) }}
                    </p>
                    <p class="text-xs text-slate-400">{{ item.cantidad }} {{ item.unidad }} × {{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  </div>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Totales -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Totales</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Subtotal</span><span class="font-medium">{{ compra()!.subtotalProductos | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              @if (compra()!.flete > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Flete</span><span class="font-medium">{{ compra()!.flete | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              @if (compra()!.descuentos > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Descuentos</span><span class="font-medium text-emerald-500">-{{ compra()!.descuentos | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              @if (compra()!.aumentos > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Aumentos</span><span class="font-medium text-amber-500">+{{ compra()!.aumentos | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              @if (compra()!.prestamoDescontado > 0) {
                <div class="flex justify-between"><span class="text-slate-500">Préstamo descontado</span><span class="font-medium text-blue-500">-{{ compra()!.prestamoDescontado | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
              }
              <div class="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                <span class="font-bold text-slate-700 dark:text-slate-200">Total</span>
                <span class="font-bold text-primary text-base">{{ compra()!.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              @if (compra()!.saldoPendiente > 0) {
                <div class="flex justify-between">
                  <span class="font-semibold text-red-500">Saldo pendiente</span>
                  <span class="font-bold text-red-500">{{ compra()!.saldoPendiente | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CompraDetallePage implements OnInit {
  readonly service = inject(FirebaseComprasService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contactosFacade = inject(ContactosFacade);

  private readonly id = signal('');

  readonly compra = computed(() =>
    this.service.compras().find((c) => c.id === this.id()),
  );

  readonly proveedorNombre = computed(() =>
    this.contactosFacade.contactos().find((c) => c.id === this.compra()?.proveedorId)?.nombre ?? this.compra()?.proveedorId ?? '',
  );

  ngOnInit(): void {
    this.service.startListening();
    this.contactosFacade.init();
    this.id.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  especieLabel(e: string): string { return ESPECIE_LABELS[e as keyof typeof ESPECIE_LABELS] ?? e; }
  tallaLabel(t: string): string { return TALLA_LABELS[t as keyof typeof TALLA_LABELS] ?? t; }
}
