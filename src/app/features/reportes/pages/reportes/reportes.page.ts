import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  NgZone,
} from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  Firestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from '@angular/fire/firestore';
import { FirebaseViajesService } from '../../../viajes/firebase-viajes.service';
import { FirebaseCamionesService } from '../../../camiones/firebase-camiones.service';
import { EstadisticasDiarias } from '../../../../core/models/estadisticas.model';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { ESPECIE_LABELS } from '../../../../core/models/especie.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Reportes</h1>
        <button (click)="loadStats()" class="p-2 text-slate-400 hover:text-primary">
          <app-svg-icon icon="refresh" size="18px"></app-svg-icon>
        </button>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-4 space-y-4">
        @if (loading()) {
          <div class="space-y-3 animate-pulse">
            <div class="grid grid-cols-2 gap-3">
              @for (i of [1,2,3,4]; track i) {
                <div class="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
              }
            </div>
          </div>
        } @else {
          <!-- KPIs del día -->
          @if (stats()) {
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Resumen del día</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Ventas del día</p>
                  <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ stats()!.ventasMontoDia | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  <p class="text-xs text-slate-500">{{ stats()!.ventasDia }} transacción(es)</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Compras del día</p>
                  <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ stats()!.comprasMontoDia | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  <p class="text-xs text-slate-500">{{ stats()!.comprasDia }} transacción(es)</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Margen bruto</p>
                  <p class="text-lg font-bold" [class.text-emerald-600]="stats()!.margenBruto >= 0" [class.text-red-600]="stats()!.margenBruto < 0">
                    {{ stats()!.margenBruto | currency:'COP':'symbol-narrow':'1.0-0' }}
                  </p>
                  <p class="text-xs text-slate-500">{{ stats()!.totalKilosProcesados | number:'1.0-0' }} kg procesados</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Inventario valorizado</p>
                  <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ stats()!.inventarioValorizado | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  <p class="text-xs text-slate-500">A precio de compra</p>
                </div>
              </div>
            </div>

            <!-- Cartera -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Cartera</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Por cobrar (clientes)</p>
                  <p class="text-base font-bold text-amber-600">{{ stats()!.carteraTotalClientes | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Por pagar (proveedores)</p>
                  <p class="text-base font-bold text-red-600">{{ stats()!.carteraTotalProveedores | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
              </div>
            </div>

            <!-- Logística -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Logística</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Viajes activos</p>
                  <p class="text-2xl font-bold text-primary">{{ stats()!.viajesActivos }}</p>
                </div>
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <p class="text-xs text-slate-400 mb-1">Cavas en circulación</p>
                  <p class="text-2xl font-bold text-amber-600">{{ stats()!.cavasEnCirculacion }}</p>
                </div>
              </div>
            </div>

            <!-- Top productos -->
            @if (stats()!.top10Productos.length > 0) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Top productos</p>
                <div class="space-y-2">
                  @for (item of stats()!.top10Productos; track $index) {
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-slate-600 dark:text-slate-300">{{ especieLabel(item.especie) }} ({{ item.talla }})</span>
                      <div class="text-right">
                        <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ item.monto | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                        <p class="text-xs text-slate-400">{{ item.kg | number:'1.0-0' }} kg</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Top clientes -->
            @if (stats()!.top10Clientes.length > 0) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Top clientes</p>
                <div class="space-y-2">
                  @for (item of stats()!.top10Clientes; track $index) {
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-slate-600 dark:text-slate-300">{{ item.nombre }}</span>
                      <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ item.monto | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          } @else {
            <div class="text-center py-16">
              <p class="text-slate-500">No hay datos estadísticos disponibles</p>
              <p class="text-xs text-slate-400 mt-1">Las estadísticas se generan automáticamente</p>
            </div>
          }

          <!-- Alertas de camiones -->
          @if (camionesService.alertasVencimiento().length > 0) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Alertas de documentos</p>
              <div class="space-y-2">
                @for (alerta of camionesService.alertasVencimiento(); track alerta.camionId + alerta.tipoDocumento) {
                  <div class="flex items-center justify-between p-2 rounded-xl"
                    [class.bg-red-50]="alerta.nivel === 'CRITICO'"
                    [class.bg-amber-50]="alerta.nivel === 'ADVERTENCIA'"
                    [class.bg-blue-50]="alerta.nivel === 'INFO'"
                  >
                    <span class="text-xs font-medium"
                      [class.text-red-700]="alerta.nivel === 'CRITICO'"
                      [class.text-amber-700]="alerta.nivel === 'ADVERTENCIA'"
                      [class.text-blue-700]="alerta.nivel === 'INFO'"
                    >{{ alerta.placa }} · {{ alerta.tipoDocumento }}</span>
                    <span class="text-xs" [class.text-red-600]="alerta.nivel === 'CRITICO'" [class.text-amber-600]="alerta.nivel === 'ADVERTENCIA'" [class.text-blue-600]="alerta.nivel === 'INFO'">
                      {{ alerta.diasRestantes }} días
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Viajes recientes -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Viajes recientes</p>
            @if (viajesService.viajes().length === 0) {
              <p class="text-xs text-slate-400 text-center py-3">Sin viajes</p>
            } @else {
              <div class="space-y-2">
                @for (viaje of viajesService.viajes().slice(0, 5); track viaje.id) {
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded-full text-white text-[10px] font-bold"
                        [class.bg-amber-500]="viaje.estado === 'EN_TRANSITO'"
                        [class.bg-emerald-500]="viaje.estado === 'FINALIZADO'"
                        [class.bg-slate-400]="viaje.estado === 'CANCELADO'"
                      >{{ viaje.estado }}</span>
                      <span class="text-slate-600 dark:text-slate-300">{{ viaje.rutas.join(' · ') }}</span>
                    </div>
                    <span class="text-slate-400">{{ viaje.horaSalida | date:'dd/MM' }}</span>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ReportesPage implements OnInit {
  private readonly firestore = inject(Firestore);
  readonly viajesService = inject(FirebaseViajesService);
  readonly camionesService = inject(FirebaseCamionesService);

  readonly loading = signal(false);
  readonly stats = signal<EstadisticasDiarias | null>(null);

  ngOnInit(): void {
    this.viajesService.startListening();
    this.camionesService.startListening();
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.loading.set(true);
    try {
      const ref = collection(this.firestore, 'estadisticas');
      const q = query(ref, orderBy('fecha', 'desc'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        this.stats.set(snap.docs[0].data() as EstadisticasDiarias);
      } else {
        this.stats.set(null);
      }
    } catch {
      this.stats.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  especieLabel(especie: string): string {
    return ESPECIE_LABELS[especie as keyof typeof ESPECIE_LABELS] ?? especie;
  }
}
