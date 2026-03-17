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
  limit,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Compra, AbonoCompra } from '../../core/models/compra.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

function mapCompra(id: string, data: Record<string, unknown>): Compra {
  return {
    ...data,
    id,
    fecha: toDate(data['fecha']),
    creadoEn: toDate(data['creadoEn']),
    actualizadoEn: toDate(data['actualizadoEn']),
  } as Compra;
}

@Injectable({ providedIn: 'root' })
export class FirebaseComprasService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _compras = signal<Compra[]>([]);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly compras = this._compras.asReadonly();
  readonly loading = this._loading.asReadonly();

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'compras');
    const q = query(ref, orderBy('fecha', 'desc'), limit(200));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._compras.set(snap.docs.map((d) => mapCompra(d.id, d.data() as Record<string, unknown>)));
          this._loading.set(false);
        });
      });
    });
  }

  stopListening(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async create(compra: Omit<Compra, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
    const ref = collection(this.firestore, 'compras');
    const docRef = await addDoc(ref, {
      ...compra,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Compra>): Promise<void> {
    const ref = doc(this.firestore, 'compras', id);
    await updateDoc(ref, { ...data, actualizadoEn: serverTimestamp() });
  }

  async addAbono(abono: Omit<AbonoCompra, 'id'>): Promise<string> {
    const ref = collection(this.firestore, 'abonos-compras');
    const docRef = await addDoc(ref, { ...abono });
    return docRef.id;
  }
}
