import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseCamionesService } from '../../firebase-camiones.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';

@Component({
  selector: 'app-camion-form',
  standalone: true,
  imports: [ReactiveFormsModule, SvgIconComponent, InputCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/camiones'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Camiones
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ isEdit() ? 'Editar camión' : 'Nuevo camión' }}</h1>
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
          Guardar
        </button>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-6">
        <form [formGroup]="form" class="space-y-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Datos del vehículo</h2>
            <div class="grid grid-cols-2 gap-3">
              <app-input-custom formControlName="placa" label="Placa" [required]="true" placeholder="ABC123" />
              <app-input-custom formControlName="marca" label="Marca" [required]="true" placeholder="Chevrolet" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <app-input-custom formControlName="modelo" label="Modelo" [required]="true" placeholder="NPR" />
              <app-input-custom formControlName="anio" label="Año" type="number" [required]="true" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <app-input-custom formControlName="color" label="Color" placeholder="Blanco" />
              <app-input-custom formControlName="tipoFurgon" label="Tipo furgón" placeholder="Isotérmico" />
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Documentos y vencimientos</h2>
            <div class="grid grid-cols-1 gap-3">
              <app-input-custom formControlName="vencimientoSoat" label="Vencimiento SOAT" type="date" [required]="true" />
              <app-input-custom formControlName="vencimientoTecnomecanica" label="Vencimiento Tecnomecánica" type="date" [required]="true" />
              <app-input-custom formControlName="vencimientoAunap" label="Vencimiento AUNAP" type="date" [required]="true" />
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado</h2>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" formControlName="activo" class="size-4 rounded" />
              <span class="text-sm text-slate-700 dark:text-slate-300">Camión activo</span>
            </label>
            <app-input-custom formControlName="notas" label="Notas" placeholder="Observaciones opcionales" />
          </div>

          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{{ errorMsg() }}</div>
          }
        </form>
      </div>
    </div>
  `,
})
export class CamionFormPage implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FirebaseCamionesService);

  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);
  private readonly editId = signal<string | null>(null);
  readonly isEdit = computed(() => !!this.editId());

  readonly form = this.fb.group({
    placa: ['', [Validators.required]],
    marca: ['', [Validators.required]],
    modelo: ['', [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    color: [''],
    tipoFurgon: [''],
    choferId: [''],
    vencimientoSoat: ['', [Validators.required]],
    vencimientoTecnomecanica: ['', [Validators.required]],
    vencimientoAunap: ['', [Validators.required]],
    activo: [true],
    notas: [''],
  });

  ngOnInit(): void {
    this.service.startListening();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      const camion = this.service.camiones().find((c) => c.id === id);
      if (camion) {
        this.form.patchValue({
          placa: camion.placa,
          marca: camion.marca,
          modelo: camion.modelo,
          anio: camion.anio,
          color: camion.color ?? '',
          tipoFurgon: camion.tipoFurgon ?? '',
          choferId: camion.choferId,
          vencimientoSoat: this.toDateInput(camion.vencimientoSoat),
          vencimientoTecnomecanica: this.toDateInput(camion.vencimientoTecnomecanica),
          vencimientoAunap: this.toDateInput(camion.vencimientoAunap),
          activo: camion.activo,
          notas: camion.notas ?? '',
        });
      }
    }
  }

  private toDateInput(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set(null);
    const v = this.form.getRawValue();
    const data = {
      placa: v.placa!.toUpperCase(),
      marca: v.marca!,
      modelo: v.modelo!,
      anio: v.anio!,
      color: v.color || undefined,
      tipoFurgon: v.tipoFurgon || undefined,
      choferId: v.choferId ?? '',
      vencimientoSoat: new Date(v.vencimientoSoat!),
      vencimientoTecnomecanica: new Date(v.vencimientoTecnomecanica!),
      vencimientoAunap: new Date(v.vencimientoAunap!),
      activo: v.activo ?? true,
      notas: v.notas || undefined,
    };
    try {
      if (this.editId()) {
        await this.service.update(this.editId()!, data);
      } else {
        await this.service.create(data);
      }
      this.router.navigate(['/camiones']);
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
