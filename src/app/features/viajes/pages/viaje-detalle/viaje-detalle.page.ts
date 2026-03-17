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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseViajesService } from '../../firebase-viajes.service';
import { FirebaseCavasService } from '../../../cavas/firebase-cavas.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { ESTADO_VIAJE_LABELS, GastoViaje, TipoGastoViaje, TIPO_GASTO_VIAJE_LABELS } from '../../../../core/models/viaje.model';

@Component({
  selector: 'app-viaje-detalle',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, SvgIconComponent, StatusBadgeComponent, SelectCustomComponent, InputCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <button (click)="router.navigate(['/viajes'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
          <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
          Viajes
        </button>
        @if (viaje() && viaje()!.estado === 'EN_TRANSITO') {
          <button
            (click)="cerrarViaje()"
            [disabled]="saving()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 disabled:opacity-50 text-white rounded-full text-xs font-bold"
          >Cerrar viaje</button>
        }
      </div>

      @if (!viaje()) {
        <div class="text-center py-16"><p class="text-slate-500">Viaje no encontrado</p></div>
      } @else {
        <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <!-- Estado -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between mb-3">
              <div>
                <app-status-badge [text]="estadoLabel()" [type]="viaje()!.estado === 'EN_TRANSITO' ? 'warning' : viaje()!.estado === 'FINALIZADO' ? 'success' : 'neutral'" size="md" />
                <p class="text-xs text-slate-400 mt-1">Salida: {{ viaje()!.horaSalida | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <p class="text-sm text-slate-500">{{ viaje()!.ventasIds.length }} venta(s)</p>
            </div>
            <div class="flex flex-wrap gap-2">
              @for (ruta of viaje()!.rutas; track $index) {
                <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs">{{ ruta }}</span>
              }
            </div>
          </div>

          <!-- Gastos -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Gastos del viaje</h3>
              @if (viaje()!.estado === 'EN_TRANSITO') {
                <button type="button" (click)="showGastoForm.set(!showGastoForm())" class="text-xs font-semibold text-primary">
                  {{ showGastoForm() ? 'Cancelar' : '+ Agregar gasto' }}
                </button>
              }
            </div>

            @if (showGastoForm()) {
              <form [formGroup]="gastoForm" (ngSubmit)="addGasto()" class="space-y-3 mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div class="grid grid-cols-2 gap-3">
                  <app-select-custom formControlName="tipo" label="Tipo" [options]="tipoGastoOptions" />
                  <app-input-custom formControlName="monto" label="Monto ($)" type="number" [required]="true" />
                </div>
                <app-input-custom formControlName="descripcion" label="Descripción" placeholder="Opcional" />
                <button type="submit" [disabled]="gastoForm.invalid || saving()" class="w-full py-2 bg-primary disabled:opacity-50 text-white rounded-xl text-sm font-bold">
                  Registrar gasto
                </button>
              </form>
            }

            @if (viaje()!.gastos.length === 0) {
              <p class="text-xs text-slate-400 text-center py-3">Sin gastos registrados</p>
            } @else {
              <div class="space-y-2">
                @for (gasto of viaje()!.gastos; track $index) {
                  <div class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                    <div>
                      <p class="text-sm text-slate-700 dark:text-slate-300">{{ tipoGastoLabel(gasto.tipo) }}</p>
                      @if (gasto.descripcion) { <p class="text-xs text-slate-400">{{ gasto.descripcion }}</p> }
                    </div>
                    <p class="text-sm font-semibold">{{ gasto.monto | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  </div>
                }
                <div class="flex justify-between pt-2 font-bold">
                  <span class="text-slate-600">Total gastos</span>
                  <span class="text-primary">{{ viaje()!.totalGastos | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ViajeDetallePage implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly viajesService = inject(FirebaseViajesService);
  private readonly cavasService = inject(FirebaseCavasService);

  private readonly id = signal('');
  readonly saving = signal(false);
  readonly showGastoForm = signal(false);

  readonly viaje = computed(() => this.viajesService.viajes().find((v) => v.id === this.id()));
  readonly estadoLabel = computed(() =>
    this.viaje() ? ESTADO_VIAJE_LABELS[this.viaje()!.estado] ?? this.viaje()!.estado : '',
  );

  readonly tipoGastoOptions = Object.entries(TIPO_GASTO_VIAJE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  readonly gastoForm = this.fb.group({
    tipo: ['COMBUSTIBLE', [Validators.required]],
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    descripcion: [''],
  });

  ngOnInit(): void {
    this.viajesService.startListening();
    this.id.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  async addGasto(): Promise<void> {
    if (this.gastoForm.invalid || !this.viaje()) return;
    this.saving.set(true);
    const v = this.gastoForm.getRawValue();
    const gasto: GastoViaje = {
      id: Date.now().toString(),
      tipo: v.tipo as TipoGastoViaje,
      monto: v.monto!,
      descripcion: v.descripcion || undefined,
      fecha: new Date(),
    };
    const gastos = [...this.viaje()!.gastos, gasto];
    const totalGastos = gastos.reduce((a, g) => a + g.monto, 0);
    try {
      await this.viajesService.update(this.id(), { gastos, totalGastos });
      this.gastoForm.reset({ tipo: 'COMBUSTIBLE', monto: null, descripcion: '' });
      this.showGastoForm.set(false);
    } catch (e) {
      console.error(e);
    } finally {
      this.saving.set(false);
    }
  }

  async cerrarViaje(): Promise<void> {
    if (!this.viaje()) return;
    this.saving.set(true);
    try {
      // Marcar cavas como disponibles nuevamente
      for (const cavaId of this.viaje()!.cavasIds) {
        await this.cavasService.registrarViaje(cavaId);
        await this.cavasService.cambiarEstado(cavaId, 'DISPONIBLE');
      }
      await this.viajesService.update(this.id(), {
        estado: 'FINALIZADO',
        horaLlegadaReal: new Date(),
        cavasDevueltasIds: this.viaje()!.cavasIds,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.saving.set(false);
    }
  }

  tipoGastoLabel(tipo: string): string { return TIPO_GASTO_VIAJE_LABELS[tipo as TipoGastoViaje] ?? tipo; }
}
