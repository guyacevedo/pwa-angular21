import { Injectable, inject, computed, signal } from '@angular/core';
import { FirebaseInventarioService } from './firebase-inventario.service';
import { ItemInventario } from '../../core/models/inventario.model';
import { EspeciePez, TallaPez, CalidadPez } from '../../core/models/especie.model';

@Injectable({ providedIn: 'root' })
export class InventarioFacade {
  private readonly service = inject(FirebaseInventarioService);

  private readonly _error = signal<string | null>(null);
  private readonly _saving = signal(false);

  readonly items = this.service.items;
  readonly loading = this.service.loading;
  readonly error = computed(() => this._error() || this.service.error());
  readonly saving = this._saving.asReadonly();

  /** Items con alerta de rotación (>2 días) */
  readonly alertasRotacion = computed(() =>
    this.items().filter((i) => i.alertaRotacion && i.stockKg > 0),
  );

  /** Valor total del inventario */
  readonly valorTotalInventario = computed(() =>
    this.items().reduce((acc, i) => acc + i.stockKg * i.precioCompraPromedio, 0),
  );

  init(): void {
    this.service.startListening();
  }

  destroy(): void {
    this.service.stopListening();
  }

  getItem(especie: EspeciePez, talla: TallaPez, calidad: CalidadPez): ItemInventario | undefined {
    const id = this.service.itemId(especie, talla, calidad);
    return this.items().find((i) => i.id === id);
  }

  async ajustarStock(
    especie: EspeciePez,
    talla: TallaPez,
    calidad: CalidadPez,
    deltaKg: number,
    precioCompra?: number,
  ): Promise<void> {
    this._saving.set(true);
    this._error.set(null);
    try {
      const id = this.service.itemId(especie, talla, calidad);
      const existing = this.items().find((i) => i.id === id);
      const nuevoStock = Math.max(0, (existing?.stockKg ?? 0) + deltaKg);
      const precioPromedio = precioCompra ?? existing?.precioCompraPromedio ?? 0;

      await this.service.upsert({
        id,
        especie,
        talla,
        calidad,
        stockKg: nuevoStock,
        stockUnidades: existing?.stockUnidades ?? 0,
        precioCompraPromedio: precioPromedio,
        precioVentaKg: existing?.precioVentaKg ?? 0,
        precioVentaUnidad: existing?.precioVentaUnidad ?? 0,
        fechaUltimoIngreso: deltaKg > 0 ? new Date() : (existing?.fechaUltimoIngreso ?? new Date()),
        ultimaActualizacion: new Date(),
      });
    } catch (e) {
      this._error.set((e as Error).message);
      throw e;
    } finally {
      this._saving.set(false);
    }
  }

  async actualizarPrecio(id: string, precioVentaKg: number, precioVentaUnidad?: number): Promise<void> {
    this._saving.set(true);
    try {
      await this.service.update(id, { precioVentaKg, precioVentaUnidad });
    } catch (e) {
      this._error.set((e as Error).message);
      throw e;
    } finally {
      this._saving.set(false);
    }
  }
}
