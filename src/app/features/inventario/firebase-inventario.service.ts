import { Injectable, inject, NgZone, signal } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { ItemInventario } from '../../core/models/inventario.model';
import { EspeciePez, TallaPez, CalidadPez } from '../../core/models/especie.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

@Injectable({ providedIn: 'root' })
export class FirebaseInventarioService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _items = signal<ItemInventario[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private unsubscribe: (() => void) | null = null;

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'inventario');
    const q = query(ref, orderBy('especie'), orderBy('talla'));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._items.set(
            snap.docs.map((d) => {
              const data = d.data();
              const fechaIngreso = toDate(data['fechaUltimoIngreso']);
              const diasEnBodega = Math.floor(
                (Date.now() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24),
              );
              return {
                ...data,
                id: d.id,
                fechaUltimoIngreso: fechaIngreso,
                ultimaActualizacion: toDate(data['ultimaActualizacion']),
                alertaRotacion: diasEnBodega > 2,
              } as ItemInventario;
            }),
          );
          this._loading.set(false);
        });
      }, (err) => {
        this.ngZone.run(() => {
          this._error.set(err.message);
          this._loading.set(false);
        });
      });
    });
  }

  stopListening(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  itemId(especie: EspeciePez, talla: TallaPez, calidad: CalidadPez): string {
    return `${especie}_${talla}_${calidad}`;
  }

  async upsert(item: Omit<ItemInventario, 'alertaRotacion'>): Promise<void> {
    const ref = doc(this.firestore, 'inventario', item.id);
    await setDoc(ref, { ...item, ultimaActualizacion: serverTimestamp() }, { merge: true });
  }

  async update(id: string, data: Partial<ItemInventario>): Promise<void> {
    const ref = doc(this.firestore, 'inventario', id);
    await updateDoc(ref, { ...data, ultimaActualizacion: serverTimestamp() });
  }
}
