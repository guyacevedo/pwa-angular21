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
import { CurrencyPipe } from '@angular/common';
import { FirebaseVentasService } from '../../firebase-ventas.service';
import { ContactosFacade } from '../../../contactos/contactos.facade';
import { InventarioFacade } from '../../../inventario/inventario.facade';
import { FirebaseCavasService } from '../../../cavas/firebase-cavas.service';
import { AUTH_PROVIDER } from '../../../../core/interfaces/auth-provider.interface';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import {
  ESPECIE_LABELS, TALLA_LABELS, CALIDAD_LABELS,
  ESPECIES_LIST, TALLAS_POR_ESPECIE,
  EspeciePez, TallaPez, CalidadPez,
} from '../../../../core/models/especie.model';
import { ItemVenta, GastosVenta, ModalidadEmpaque, MODALIDAD_EMPAQUE_LABELS } from '../../../../core/models/venta.model';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, SvgIconComponent, SelectCustomComponent, InputCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/ventas'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Ventas
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Nueva Venta</h1>
        </div>
        <button
          (click)="onSubmit()"
          [disabled]="form.invalid || saving() || items.length === 0"
          class="flex items-center gap-1.5 px-4 py-1.5 bg-primary disabled:opacity-50 text-white rounded-full text-xs font-bold"
        >
          @if (saving()) {
            <div class="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          } @else {
            <app-svg-icon icon="check" size="14px"></app-svg-icon>
          }
          Registrar
        </button>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <form [formGroup]="form" class="space-y-4">

          <!-- Cliente y configuración -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <app-select-custom formControlName="clienteId" label="Cliente" [options]="clienteOptions()" [required]="true" />
            <div class="grid grid-cols-2 gap-4">
              <app-select-custom formControlName="modalidadPago" label="Pago" [options]="[{value:'CONTADO',label:'Contado'},{value:'CREDITO',label:'Crédito'}]" [required]="true" />
              <app-select-custom formControlName="modalidadEmpaque" label="Empaque" [options]="empaqueOptions" [required]="true" />
            </div>
          </div>

          <!-- Cavas (si aplica) -->
          @if (form.get('modalidadEmpaque')!.value === 'CAVA' || form.get('modalidadEmpaque')!.value === 'MIXTO') {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Cavas disponibles</h3>
              <div class="flex flex-wrap gap-2">
                @for (cava of cavasService.disponibles(); track cava.id) {
                  <button
                    type="button"
                    (click)="toggleCava(cava.id)"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
                    [class.bg-primary]="cavaSeleccionadas().includes(cava.id)"
                    [class.text-white]="cavaSeleccionadas().includes(cava.id)"
                    [class.border-primary]="cavaSeleccionadas().includes(cava.id)"
                    [class.border-slate-200]="!cavaSeleccionadas().includes(cava.id)"
                    [class.text-slate-500]="!cavaSeleccionadas().includes(cava.id)"
                  >{{ cava.codigoFisico }} ({{ cava.capacidadKg }}kg)</button>
                }
              </div>
            </div>
          }

          <!-- Gastos -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Gastos operativos</h3>
            <div class="grid grid-cols-3 gap-3">
              <app-input-custom formControlName="gastoHielo" label="Hielo ($)" type="number" placeholder="0" />
              <app-input-custom formControlName="gastoPita" label="Pita ($)" type="number" placeholder="0" />
              <app-input-custom formControlName="gastoOtros" label="Otros ($)" type="number" placeholder="0" />
            </div>
            <div class="grid grid-cols-3 gap-3 mt-3">
              <app-input-custom formControlName="flete" label="Flete ($)" type="number" placeholder="0" />
              <app-input-custom formControlName="descuentos" label="Descuentos ($)" type="number" placeholder="0" />
              <app-input-custom formControlName="aumentos" label="Aumentos ($)" type="number" placeholder="0" />
            </div>
          </div>

          <!-- Productos -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Productos</h3>
              <button type="button" (click)="addItem()" class="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                <app-svg-icon icon="add" size="14px"></app-svg-icon>
                Agregar
              </button>
            </div>

            <div formArrayName="items" class="space-y-4">
              @for (item of items.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                  <div class="flex justify-between items-center">
                    <p class="text-xs font-bold text-slate-500">Producto {{ i + 1 }}</p>
                    <button type="button" (click)="removeItem(i)" class="text-red-400 hover:text-red-600">
                      <app-svg-icon icon="trash" size="14px"></app-svg-icon>
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <app-select-custom formControlName="especie" label="Especie" [options]="especieOptions" (ngModelChange)="onEspecieChange(i)" />
                    <app-select-custom formControlName="talla" label="Talla" [options]="getTallaOptions(i)" />
                    <app-select-custom formControlName="unidad" label="Unidad" [options]="[{value:'KG',label:'Kg'},{value:'UNIDAD',label:'Unidad'}]" />
                    <app-input-custom formControlName="cantidad" label="Cantidad" type="number" />
                    <app-input-custom formControlName="precioUnitario" label="Precio/unidad ($)" type="number" class="col-span-2" />
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Resumen -->
          @if (items.length > 0) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-500">Subtotal productos</span><span>{{ subtotal() | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Gastos</span><span>{{ totalGastos() | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
                <div class="flex justify-between font-bold text-base border-t border-slate-100 dark:border-slate-700 pt-2">
                  <span>Total</span><span class="text-primary">{{ total() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
              </div>
            </div>
          }

          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{{ errorMsg() }}</div>
          }
        </form>
      </div>
    </div>
  `,
})
export class VentaFormPage implements OnInit {
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly ventasService = inject(FirebaseVentasService);
  readonly cavasService = inject(FirebaseCavasService);
  private readonly contactosFacade = inject(ContactosFacade);
  private readonly inventarioFacade = inject(InventarioFacade);
  private readonly authProvider = inject(AUTH_PROVIDER);

  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly cavaSeleccionadas = signal<string[]>([]);

  readonly especieOptions = [
    { value: '', label: 'Seleccionar especie' },
    ...ESPECIES_LIST.map((e) => ({ value: e, label: ESPECIE_LABELS[e] })),
  ];

  readonly empaqueOptions = Object.entries(MODALIDAD_EMPAQUE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  readonly clienteOptions = computed(() => [
    { value: '', label: 'Seleccionar cliente' },
    ...this.contactosFacade.clientes().map((c) => ({ value: c.id, label: c.nombre })),
  ]);

  readonly form = this.fb.group({
    clienteId: ['', [Validators.required]],
    modalidadPago: ['CONTADO'],
    modalidadEmpaque: ['BOLSA'],
    gastoHielo: [0],
    gastoPita: [0],
    gastoOtros: [0],
    flete: [0],
    descuentos: [0],
    aumentos: [0],
    notas: [''],
    items: this.fb.array([]),
  });

  get items(): FormArray { return this.form.get('items') as FormArray; }

  readonly subtotal = computed(() =>
    this.items.controls.reduce((acc, c) => acc + ((c.value.cantidad ?? 0) * (c.value.precioUnitario ?? 0)), 0),
  );
  readonly totalGastos = computed(() => {
    const v = this.form.getRawValue();
    return (v.gastoHielo ?? 0) + (v.gastoPita ?? 0) + (v.gastoOtros ?? 0);
  });
  readonly total = computed(() => {
    const v = this.form.getRawValue();
    return this.subtotal() + this.totalGastos() + (v.flete ?? 0) - (v.descuentos ?? 0) + (v.aumentos ?? 0);
  });

  ngOnInit(): void {
    this.contactosFacade.init();
    this.inventarioFacade.init();
    this.cavasService.startListening();
  }

  addItem(): void {
    this.items.push(this.fb.group({
      especie: [''],
      talla: [''],
      unidad: ['KG'],
      cantidad: [null, [Validators.required, Validators.min(0.001)]],
      precioUnitario: [null, [Validators.required, Validators.min(0)]],
    }));
  }

  removeItem(i: number): void { this.items.removeAt(i); }

  onEspecieChange(i: number): void {
    const esp = this.items.at(i).get('especie')!.value as EspeciePez;
    const tallas = TALLAS_POR_ESPECIE[esp] ?? [];
    if (tallas.length > 0) this.items.at(i).get('talla')!.setValue(tallas[0]);
  }

  getTallaOptions(i: number): { value: string; label: string }[] {
    const esp = this.items.at(i)?.get('especie')?.value as EspeciePez;
    if (!esp) return [{ value: '', label: 'Seleccione especie primero' }];
    return [{ value: '', label: 'Talla' }, ...(TALLAS_POR_ESPECIE[esp] ?? []).map((t) => ({ value: t, label: TALLA_LABELS[t] }))];
  }

  toggleCava(id: string): void {
    this.cavaSeleccionadas.update((list) =>
      list.includes(id) ? list.filter((c) => c !== id) : [...list, id],
    );
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.items.length === 0) return;
    this.saving.set(true);
    this.errorMsg.set(null);
    const v = this.form.getRawValue();
    const uid = this.authProvider.user()?.uid ?? 'sistema';

    const items: ItemVenta[] = this.items.controls.map((ctrl) => {
      const c = ctrl.value;
      return {
        especie: c.especie as EspeciePez,
        talla: c.talla as TallaPez,
        cantidad: c.cantidad ?? 0,
        unidad: c.unidad ?? 'KG',
        precioUnitario: c.precioUnitario ?? 0,
        subtotal: (c.cantidad ?? 0) * (c.precioUnitario ?? 0),
      } as ItemVenta;
    });

    const gastos: GastosVenta = {
      hielo: v.gastoHielo ?? 0,
      pita: v.gastoPita ?? 0,
      otros: v.gastoOtros ?? 0,
    };
    const totalGastos = gastos.hielo + gastos.pita + gastos.otros;
    const subtotalProductos = items.reduce((a, i) => a + i.subtotal, 0);
    const total = subtotalProductos + totalGastos + (v.flete ?? 0) - (v.descuentos ?? 0) + (v.aumentos ?? 0);

    try {
      const id = await this.ventasService.create({
        clienteId: v.clienteId!,
        fecha: new Date(),
        items,
        modalidadEmpaque: v.modalidadEmpaque as ModalidadEmpaque,
        cavasIds: this.cavaSeleccionadas(),
        canastillasIds: [],
        subtotalProductos,
        gastos,
        totalGastos,
        flete: v.flete ?? 0,
        descuentos: v.descuentos ?? 0,
        aumentos: v.aumentos ?? 0,
        total,
        modalidadPago: v.modalidadPago as 'CONTADO' | 'CREDITO',
        saldoPendiente: v.modalidadPago === 'CREDITO' ? total : 0,
        prestamoDescontado: 0,
        estado: v.modalidadPago === 'CREDITO' ? 'CREDITO' : 'PAGADA',
        notas: v.notas || undefined,
        creadoPor: uid,
      });

      // Reducir stock vendido
      for (const item of items) {
        if (item.especie && item.talla) {
          const calidad = this.inventarioFacade.getItem(item.especie, item.talla, 'FRESCO')?.calidad ?? 'FRESCO';
          const delta = item.unidad === 'KG' ? -item.cantidad : 0;
          if (delta < 0) {
            await this.inventarioFacade.ajustarStock(item.especie, item.talla, calidad as CalidadPez, delta);
          }
        }
      }

      // Marcar cavas en uso
      for (const cavaId of this.cavaSeleccionadas()) {
        await this.cavasService.cambiarEstado(cavaId, 'PENDIENTE_RETORNO', {
          clienteActualId: v.clienteId!,
          ventaActualId: id,
        });
      }

      this.router.navigate(['/ventas', id]);
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
