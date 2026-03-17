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
import { Venta, AbonoVenta } from '../../core/models/venta.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

function mapVenta(id: string, data: Record<string, unknown>): Venta {
  return {
    ...data,
    id,
    fecha: toDate(data['fecha']),
    creadoEn: toDate(data['creadoEn']),
    actualizadoEn: toDate(data['actualizadoEn']),
  } as Venta;
}

@Injectable({ providedIn: 'root' })
export class FirebaseVentasService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _ventas = signal<Venta[]>([]);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly ventas = this._ventas.asReadonly();
  readonly loading = this._loading.asReadonly();

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'ventas');
    const q = query(ref, orderBy('fecha', 'desc'), limit(200));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._ventas.set(snap.docs.map((d) => mapVenta(d.id, d.data() as Record<string, unknown>)));
          this._loading.set(false);
        });
      });
    });
  }

  stopListening(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async create(venta: Omit<Venta, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
    const ref = collection(this.firestore, 'ventas');
    const docRef = await addDoc(ref, {
      ...venta,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Venta>): Promise<void> {
    const ref = doc(this.firestore, 'ventas', id);
    await updateDoc(ref, { ...data, actualizadoEn: serverTimestamp() });
  }

  async addAbono(abono: Omit<AbonoVenta, 'id'>): Promise<string> {
    const ref = collection(this.firestore, 'abonos-ventas');
    const docRef = await addDoc(ref, { ...abono });
    return docRef.id;
  }
}
