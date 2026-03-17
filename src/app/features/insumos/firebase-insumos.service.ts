import { Injectable, inject, NgZone, signal } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Insumo } from '../../core/models/insumo.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

@Injectable({ providedIn: 'root' })
export class FirebaseInsumosService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _insumos = signal<Insumo[]>([]);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly insumos = this._insumos.asReadonly();
  readonly loading = this._loading.asReadonly();

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'insumos');
    const q = query(ref, orderBy('nombre'));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._insumos.set(
            snap.docs.map((d) => ({
              ...d.data(),
              id: d.id,
              ultimaCompra: toDate(d.data()['ultimaCompra']),
              ultimaActualizacion: toDate(d.data()['ultimaActualizacion']),
            } as Insumo)),
          );
          this._loading.set(false);
        });
      });
    });
  }

  stopListening(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async create(insumo: Omit<Insumo, 'id'>): Promise<string> {
    const ref = collection(this.firestore, 'insumos');
    const docRef = await addDoc(ref, { ...insumo, ultimaActualizacion: serverTimestamp() });
    return docRef.id;
  }

  async update(id: string, data: Partial<Insumo>): Promise<void> {
    const ref = doc(this.firestore, 'insumos', id);
    await updateDoc(ref, { ...data, ultimaActualizacion: serverTimestamp() });
  }
}
