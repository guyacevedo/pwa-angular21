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
import { FirebaseComprasService } from '../../firebase-compras.service';
import { ContactosFacade } from '../../../contactos/contactos.facade';
import { InventarioFacade } from '../../../inventario/inventario.facade';
import { AUTH_PROVIDER } from '../../../../core/interfaces/auth-provider.interface';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
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
import { ItemCompra } from '../../../../core/models/compra.model';

@Component({
  selector: 'app-compra-form',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, SvgIconComponent, SelectCustomComponent, InputCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/compras'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Compras
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Nueva Compra</h1>
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

          <!-- Proveedor -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <app-select-custom
              formControlName="proveedorId"
              label="Proveedor"
              [options]="proveedorOptions()"
              placeholder="Seleccionar proveedor"
              [required]="true"
            />
            <div class="grid grid-cols-2 gap-4 mt-4">
              <app-select-custom
                formControlName="modalidadPago"
                label="Modalidad de pago"
                [options]="[{value:'CONTADO',label:'Contado'},{value:'CREDITO',label:'Crédito'}]"
                [required]="true"
              />
              <app-input-custom formControlName="flete" label="Flete ($)" type="number" placeholder="0" />
            </div>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <app-input-custom formControlName="descuentos" label="Descuentos ($)" type="number" placeholder="0" />
              <app-input-custom formControlName="aumentos" label="Aumentos ($)" type="number" placeholder="0" />
            </div>
          </div>

          <!-- Agregar productos -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Productos</h3>
              <button type="button" (click)="addItem()" class="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                <app-svg-icon icon="add" size="14px"></app-svg-icon>
                Agregar
              </button>
            </div>

            @if (items.length === 0) {
              <p class="text-sm text-slate-400 text-center py-4">Agrega al menos un producto</p>
            }

            <div formArrayName="items" class="space-y-4">
              @for (item of items.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-bold text-slate-500">Producto {{ i + 1 }}</p>
                    <button type="button" (click)="removeItem(i)" class="text-red-400 hover:text-red-600">
                      <app-svg-icon icon="trash" size="14px"></app-svg-icon>
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <app-select-custom
                      formControlName="especie"
                      label="Especie"
                      [options]="especieOptions"
                      (ngModelChange)="onEspecieChange(i)"
                    />
                    <app-select-custom
                      formControlName="talla"
                      label="Talla"
                      [options]="getTallaOptions(i)"
                    />
                    <app-select-custom
                      formControlName="calidad"
                      label="Calidad"
                      [options]="calidadOptions"
                    />
                    <app-select-custom
                      formControlName="unidad"
                      label="Unidad"
                      [options]="[{value:'KG',label:'Kilogramos'},{value:'UNIDAD',label:'Unidades'}]"
                    />
                    <app-input-custom formControlName="cantidad" label="Cantidad" type="number" />
                    <app-input-custom formControlName="precioUnitario" label="Precio/unidad ($)" type="number" />
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Resumen -->
          @if (items.length > 0) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Resumen</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-500">Subtotal productos</span><span>{{ subtotal() | currency:'COP':'symbol-narrow':'1.0-0' }}</span></div>
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
export class CompraFormPage implements OnInit {
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly comprasService = inject(FirebaseComprasService);
  private readonly contactosFacade = inject(ContactosFacade);
  private readonly inventarioFacade = inject(InventarioFacade);
  private readonly authProvider = inject(AUTH_PROVIDER);

  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly especieOptions = [
    { value: '', label: 'Seleccionar especie' },
    ...ESPECIES_LIST.map((e) => ({ value: e, label: ESPECIE_LABELS[e] })),
  ];

  readonly calidadOptions = [
    { value: '', label: 'Calidad' },
    ...Object.entries(CALIDAD_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ];

  readonly proveedorOptions = computed(() => [
    { value: '', label: 'Seleccionar proveedor' },
    ...this.contactosFacade.proveedores().map((p) => ({ value: p.id, label: p.nombre })),
  ]);

  readonly form = this.fb.group({
    proveedorId: ['', [Validators.required]],
    modalidadPago: ['CONTADO', [Validators.required]],
    flete: [0],
    descuentos: [0],
    aumentos: [0],
    notas: [''],
    items: this.fb.array([]),
  });

  get items(): FormArray { return this.form.get('items') as FormArray; }

  readonly subtotal = computed(() => {
    return this.items.controls.reduce((acc, ctrl) => {
      const c = ctrl.value;
      return acc + (c.cantidad ?? 0) * (c.precioUnitario ?? 0);
    }, 0);
  });

  readonly total = computed(() => {
    const v = this.form.getRawValue();
    return this.subtotal() + (v.flete ?? 0) - (v.descuentos ?? 0) + (v.aumentos ?? 0);
  });

  ngOnInit(): void {
    this.contactosFacade.init();
    this.inventarioFacade.init();
  }

  addItem(): void {
    this.items.push(this.fb.group({
      especie: [''],
      talla: [''],
      calidad: ['FRESCO'],
      unidad: ['KG'],
      cantidad: [null, [Validators.required, Validators.min(0.001)]],
      precioUnitario: [null, [Validators.required, Validators.min(0)]],
      esInsumo: [false],
    }));
  }

  removeItem(i: number): void {
    this.items.removeAt(i);
  }

  onEspecieChange(index: number): void {
    const esp = this.items.at(index).get('especie')!.value as EspeciePez;
    const tallas = TALLAS_POR_ESPECIE[esp] ?? [];
    if (tallas.length > 0) {
      this.items.at(index).get('talla')!.setValue(tallas[0]);
    }
  }

  getTallaOptions(index: number): { value: string; label: string }[] {
    const esp = this.items.at(index)?.get('especie')?.value as EspeciePez;
    if (!esp) return [{ value: '', label: 'Primero seleccione especie' }];
    const tallas = TALLAS_POR_ESPECIE[esp] ?? [];
    return [{ value: '', label: 'Seleccionar talla' }, ...tallas.map((t) => ({ value: t, label: TALLA_LABELS[t] }))];
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.items.length === 0) return;
    this.saving.set(true);
    this.errorMsg.set(null);

    const v = this.form.getRawValue();
    const uid = this.authProvider.user()?.uid ?? 'sistema';

    const items: ItemCompra[] = this.items.controls.map((ctrl) => {
      const c = ctrl.value;
      const subtotal = (c.cantidad ?? 0) * (c.precioUnitario ?? 0);
      return {
        especie: c.especie || undefined,
        talla: c.talla || undefined,
        calidad: c.calidad || undefined,
        esInsumo: false,
        cantidad: c.cantidad ?? 0,
        unidad: c.unidad ?? 'KG',
        precioUnitario: c.precioUnitario ?? 0,
        subtotal,
      } as ItemCompra;
    });

    const subtotalProductos = items.reduce((a, i) => a + i.subtotal, 0);
    const total = subtotalProductos + (v.flete ?? 0) - (v.descuentos ?? 0) + (v.aumentos ?? 0);

    try {
      const id = await this.comprasService.create({
        proveedorId: v.proveedorId!,
        fecha: new Date(),
        items,
        subtotalProductos,
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

      // Actualizar inventario
      for (const item of items) {
        if (!item.esInsumo && item.especie && item.talla && item.calidad) {
          await this.inventarioFacade.ajustarStock(
            item.especie as EspeciePez,
            item.talla as TallaPez,
            item.calidad as CalidadPez,
            item.unidad === 'KG' ? item.cantidad : 0,
            item.precioUnitario,
          );
        }
      }

      this.router.navigate(['/compras', id]);
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
