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
import { FirebaseCavasService } from '../../firebase-cavas.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';

@Component({
  selector: 'app-cava-form',
  standalone: true,
  imports: [ReactiveFormsModule, SvgIconComponent, InputCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/cavas'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Cavas
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ isEditMode() ? 'Editar Cava' : 'Registrar Cava' }}</h1>
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

      <div class="max-w-lg mx-auto px-4 py-6">
        <form [formGroup]="form" class="space-y-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <app-input-custom formControlName="codigoFisico" label="Código físico" placeholder="Ej: C-001" [required]="true" />
            <div class="grid grid-cols-2 gap-4">
              <app-input-custom formControlName="capacidadKg" label="Capacidad (kg)" type="number" placeholder="28" [required]="true" />
              <app-input-custom formControlName="vidaUtilMax" label="Vida útil (viajes)" type="number" placeholder="15" [required]="true" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <app-input-custom formControlName="costoCompra" label="Costo compra ($)" type="number" [required]="true" />
              <app-input-custom formControlName="costoPersonalizacion" label="Costo personalización ($)" type="number" />
            </div>
            <app-input-custom formControlName="fleteUso" label="Flete por uso ($)" type="number" placeholder="Costo cobrado por viaje" />
          </div>

          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{{ errorMsg() }}</div>
          }
        </form>
      </div>
    </div>
  `,
})
export class CavaFormPage implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FirebaseCavasService);

  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);
  private editId: string | null = null;

  readonly isEditMode = computed(() => !!this.editId);

  readonly form = this.fb.group({
    codigoFisico: ['', [Validators.required]],
    capacidadKg: [28, [Validators.required, Validators.min(1)]],
    vidaUtilMax: [15, [Validators.required, Validators.min(1)]],
    costoCompra: [0, [Validators.required, Validators.min(0)]],
    costoPersonalizacion: [0],
    fleteUso: [0],
  });

  ngOnInit(): void {
    this.service.startListening();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = id;
      const cava = this.service.cavas().find((c) => c.id === id);
      if (cava) {
        this.form.patchValue({
          codigoFisico: cava.codigoFisico,
          capacidadKg: cava.capacidadKg,
          vidaUtilMax: cava.vidaUtilMax,
          costoCompra: cava.costoCompra,
          costoPersonalizacion: cava.costoPersonalizacion,
          fleteUso: cava.fleteUso,
        });
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set(null);
    const v = this.form.getRawValue();
    try {
      if (this.editId) {
        await this.service.update(this.editId, {
          capacidadKg: v.capacidadKg!,
          vidaUtilMax: v.vidaUtilMax!,
          costoCompra: v.costoCompra!,
          costoPersonalizacion: v.costoPersonalizacion ?? 0,
          fleteUso: v.fleteUso ?? 0,
          costoTotal: (v.costoCompra ?? 0) + (v.costoPersonalizacion ?? 0),
        });
      } else {
        await this.service.create({
          codigoFisico: v.codigoFisico!,
          capacidadKg: v.capacidadKg!,
          vidaUtilMax: v.vidaUtilMax!,
          costoCompra: v.costoCompra!,
          costoPersonalizacion: v.costoPersonalizacion ?? 0,
          costoTotal: (v.costoCompra ?? 0) + (v.costoPersonalizacion ?? 0),
          fleteUso: v.fleteUso ?? 0,
          estado: 'DISPONIBLE',
          viajesRealizados: 0,
          activaDesde: new Date(),
        });
      }
      this.router.navigate(['/cavas']);
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
