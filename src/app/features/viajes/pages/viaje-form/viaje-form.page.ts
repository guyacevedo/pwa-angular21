import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseViajesService } from '../../firebase-viajes.service';
import { FirebaseCamionesService } from '../../../camiones/firebase-camiones.service';
import { FirebaseVentasService } from '../../../ventas/firebase-ventas.service';
import { AUTH_PROVIDER } from '../../../../core/interfaces/auth-provider.interface';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import { CIUDADES_DISTRIBUCION } from '../../../../core/models/contacto.model';

@Component({
  selector: 'app-viaje-form',
  standalone: true,
  imports: [ReactiveFormsModule, SvgIconComponent, SelectCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/viajes'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Viajes
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Nuevo Viaje</h1>
        </div>
        <button
          (click)="onSubmit()"
          [disabled]="form.invalid || saving()"
          class="flex items-center gap-1.5 px-4 py-1.5 bg-primary disabled:opacity-50 text-white rounded-full text-xs font-bold"
        >
          @if (saving()) {
            <div class="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          } @else {
            <app-svg-icon icon="check" size="14px"></app-svg-icon>
          }
          Crear viaje
        </button>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <form [formGroup]="form" class="space-y-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <app-select-custom
              formControlName="camionId"
              label="Camión"
              [options]="camionOptions()"
              [required]="true"
            />
            <!-- Rutas -->
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Rutas de destino</p>
              <div class="flex flex-wrap gap-2">
                @for (ciudad of ciudades; track ciudad) {
                  <button
                    type="button"
                    (click)="toggleRuta(ciudad)"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
                    [class.bg-primary]="rutasSeleccionadas().includes(ciudad)"
                    [class.text-white]="rutasSeleccionadas().includes(ciudad)"
                    [class.border-primary]="rutasSeleccionadas().includes(ciudad)"
                    [class.border-slate-200]="!rutasSeleccionadas().includes(ciudad)"
                    [class.text-slate-500]="!rutasSeleccionadas().includes(ciudad)"
                  >{{ ciudad }}</button>
                }
              </div>
            </div>
            <!-- Ventas a incluir -->
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Ventas a incluir (opcional)</p>
              @if (ventasService.ventas().filter(v => v.estado === 'PAGADA' || v.estado === 'CREDITO').length === 0) {
                <p class="text-xs text-slate-400">No hay ventas registradas</p>
              } @else {
                <div class="space-y-1 max-h-48 overflow-y-auto">
                  @for (venta of ventasService.ventas(); track venta.id) {
                    @if (venta.estado !== 'ANULADA') {
                      <label class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                        <input type="checkbox" (change)="toggleVenta(venta.id, $event)" class="rounded" />
                        <span class="text-xs text-slate-600 dark:text-slate-300">{{ venta.id.slice(0, 8) }} · {{ venta.cavasIds.length }} cava(s)</span>
                      </label>
                    }
                  }
                </div>
              }
            </div>
          </div>

          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{{ errorMsg() }}</div>
          }
        </form>
      </div>
    </div>
  `,
})
export class ViajeFormPage implements OnInit {
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly viajesService = inject(FirebaseViajesService);
  readonly camionesService = inject(FirebaseCamionesService);
  readonly ventasService = inject(FirebaseVentasService);
  private readonly authProvider = inject(AUTH_PROVIDER);

  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly rutasSeleccionadas = signal<string[]>([]);
  readonly ventasSeleccionadas = signal<string[]>([]);

  readonly ciudades = CIUDADES_DISTRIBUCION.filter((c) => c !== 'Otra');

  readonly camionOptions = computed(() => [
    { value: '', label: 'Seleccionar camión' },
    ...this.camionesService.camiones()
      .filter((c) => c.activo)
      .map((c) => ({ value: c.id, label: `${c.placa} - ${c.marca} ${c.modelo}` })),
  ]);

  readonly form = this.fb.group({
    camionId: ['', [Validators.required]],
    notas: [''],
  });

  ngOnInit(): void {
    this.camionesService.startListening();
    this.ventasService.startListening();
  }

  toggleRuta(ciudad: string): void {
    this.rutasSeleccionadas.update((list) =>
      list.includes(ciudad) ? list.filter((r) => r !== ciudad) : [...list, ciudad],
    );
  }

  toggleVenta(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.ventasSeleccionadas.update((list) =>
      checked ? [...list, id] : list.filter((v) => v !== id),
    );
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set(null);
    const v = this.form.getRawValue();
    const uid = this.authProvider.user()?.uid ?? 'sistema';
    const camion = this.camionesService.camiones().find((c) => c.id === v.camionId);

    try {
      const id = await this.viajesService.create({
        camionId: v.camionId!,
        choferId: camion?.choferId ?? '',
        ventasIds: this.ventasSeleccionadas(),
        cavasIds: [],
        canastillasIds: [],
        rutas: this.rutasSeleccionadas(),
        horaSalida: new Date(),
        gastos: [],
        totalGastos: 0,
        estado: 'EN_TRANSITO',
        cavasDevueltasIds: [],
        canastillasDevueltas: 0,
        notas: v.notas || undefined,
        creadoPor: uid,
      });
      this.router.navigate(['/viajes', id]);
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
