import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventarioFacade } from '../../inventario.facade';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import {
  ESPECIE_LABELS,
  TALLA_LABELS,
  CALIDAD_LABELS,
  ESPECIES_LIST,
  TALLAS_POR_ESPECIE,
  EspeciePez,
  TallaPez,
  CalidadPez,
} from '../../../../core/models/especie.model';

@Component({
  selector: 'app-ajuste-stock',
  standalone: true,
  imports: [ReactiveFormsModule, SvgIconComponent, InputCustomComponent, SelectCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/inventario'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Inventario
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Ajuste de Stock</h1>
        </div>
        <button
          (click)="onSubmit()"
          [disabled]="form.invalid || facade.saving()"
          class="flex items-center gap-1.5 px-4 py-1.5 bg-primary disabled:opacity-50 text-white rounded-full text-xs font-bold"
        >
          @if (facade.saving()) {
            <div class="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          } @else {
            <app-svg-icon icon="check" size="14px"></app-svg-icon>
          }
          Aplicar
        </button>
      </div>

      <div class="max-w-lg mx-auto px-4 py-6">
        <form [formGroup]="form" class="space-y-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <app-select-custom
              formControlName="especie"
              label="Especie"
              [options]="especieOptions"
              placeholder="Seleccionar especie"
              [required]="true"
              (ngModelChange)="onEspecieChange()"
            />
            <app-select-custom
              formControlName="talla"
              label="Talla"
              [options]="tallaOptions()"
              placeholder="Seleccionar talla"
              [required]="true"
            />
            <app-select-custom
              formControlName="calidad"
              label="Calidad"
              [options]="calidadOptions"
              placeholder="Seleccionar calidad"
              [required]="true"
            />
            <!-- Tipo de ajuste -->
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Tipo de ajuste</p>
              <div class="flex gap-2">
                <button type="button" (click)="tipoAjuste.set('ENTRADA')"
                  class="flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors"
                  [class.bg-emerald-500]="tipoAjuste() === 'ENTRADA'"
                  [class.text-white]="tipoAjuste() === 'ENTRADA'"
                  [class.border-emerald-400]="tipoAjuste() === 'ENTRADA'"
                  [class.border-slate-200]="tipoAjuste() !== 'ENTRADA'"
                  [class.text-slate-500]="tipoAjuste() !== 'ENTRADA'"
                >+ Entrada</button>
                <button type="button" (click)="tipoAjuste.set('SALIDA')"
                  class="flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors"
                  [class.bg-red-500]="tipoAjuste() === 'SALIDA'"
                  [class.text-white]="tipoAjuste() === 'SALIDA'"
                  [class.border-red-400]="tipoAjuste() === 'SALIDA'"
                  [class.border-slate-200]="tipoAjuste() !== 'SALIDA'"
                  [class.text-slate-500]="tipoAjuste() !== 'SALIDA'"
                >- Salida</button>
              </div>
            </div>
            <app-input-custom
              formControlName="cantidadKg"
              label="Cantidad (kg)"
              placeholder="Ej: 25.5"
              type="number"
              [required]="true"
            />
            <app-input-custom
              formControlName="precioCompra"
              label="Precio de compra/kg (opcional)"
              placeholder="Actualiza el precio promedio"
              type="number"
            />
          </div>

          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{{ errorMsg() }}</div>
          }
          @if (successMsg()) {
            <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-semibold">{{ successMsg() }}</div>
          }
        </form>
      </div>
    </div>
  `,
})
export class AjusteStockPage {
  readonly facade = inject(InventarioFacade);
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly tipoAjuste = signal<'ENTRADA' | 'SALIDA'>('ENTRADA');
  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);

  readonly especieOptions = [
    { value: '', label: 'Seleccionar especie' },
    ...ESPECIES_LIST.map((e) => ({ value: e, label: ESPECIE_LABELS[e] })),
  ];

  readonly calidadOptions = [
    { value: '', label: 'Seleccionar calidad' },
    { value: 'FRESCO', label: 'Fresco' },
    { value: 'REGULAR', label: 'Regular' },
    { value: 'DESCARTE', label: 'Descarte' },
  ];

  tallaOptions = signal<{ value: string; label: string }[]>([]);

  readonly form = this.fb.group({
    especie: ['', [Validators.required]],
    talla: ['', [Validators.required]],
    calidad: ['', [Validators.required]],
    cantidadKg: [null as number | null, [Validators.required, Validators.min(0.001)]],
    precioCompra: [null as number | null],
  });

  onEspecieChange(): void {
    const especie = this.form.get('especie')!.value as EspeciePez;
    const tallas = TALLAS_POR_ESPECIE[especie] ?? [];
    this.tallaOptions.set([
      { value: '', label: 'Seleccionar talla' },
      ...tallas.map((t) => ({ value: t, label: TALLA_LABELS[t] })),
    ]);
    this.form.get('talla')!.setValue('');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.errorMsg.set(null);
    this.successMsg.set(null);
    const v = this.form.getRawValue();
    const delta = this.tipoAjuste() === 'ENTRADA' ? (v.cantidadKg ?? 0) : -(v.cantidadKg ?? 0);

    try {
      await this.facade.ajustarStock(
        v.especie as EspeciePez,
        v.talla as TallaPez,
        v.calidad as CalidadPez,
        delta,
        v.precioCompra ?? undefined,
      );
      this.successMsg.set(`Stock ajustado: ${this.tipoAjuste() === 'ENTRADA' ? '+' : '-'}${v.cantidadKg} kg`);
      this.form.reset();
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    }
  }
}
