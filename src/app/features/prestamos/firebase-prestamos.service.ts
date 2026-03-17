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
import { Prestamo } from '../../core/models/prestamo.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

@Injectable({ providedIn: 'root' })
export class FirebasePrestamosService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _prestamos = signal<Prestamo[]>([]);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly prestamos = this._prestamos.asReadonly();
  readonly loading = this._loading.asReadonly();

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'prestamos');
    const q = query(ref, orderBy('fechaInicio', 'desc'));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._prestamos.set(
            snap.docs.map((d) => ({
              ...d.data(),
              id: d.id,
              fechaInicio: toDate(d.data()['fechaInicio']),
              fechaUltimoMovimiento: toDate(d.data()['fechaUltimoMovimiento']),
              creadoEn: toDate(d.data()['creadoEn']),
              actualizadoEn: toDate(d.data()['actualizadoEn']),
            } as Prestamo)),
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

  async create(prestamo: Omit<Prestamo, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
    const ref = collection(this.firestore, 'prestamos');
    const docRef = await addDoc(ref, { ...prestamo, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
    return docRef.id;
  }

  async update(id: string, data: Partial<Prestamo>): Promise<void> {
    const ref = doc(this.firestore, 'prestamos', id);
    await updateDoc(ref, { ...data, actualizadoEn: serverTimestamp() });
  }
}
