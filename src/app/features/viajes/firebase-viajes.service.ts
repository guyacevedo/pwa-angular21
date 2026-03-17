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
import { Viaje } from '../../core/models/viaje.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

@Injectable({ providedIn: 'root' })
export class FirebaseViajesService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _viajes = signal<Viaje[]>([]);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly viajes = this._viajes.asReadonly();
  readonly loading = this._loading.asReadonly();

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'viajes');
    const q = query(ref, orderBy('horaSalida', 'desc'), limit(100));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._viajes.set(
            snap.docs.map((d) => ({
              ...d.data(),
              id: d.id,
              horaSalida: toDate(d.data()['horaSalida']),
              horaLlegadaReal: d.data()['horaLlegadaReal'] ? toDate(d.data()['horaLlegadaReal']) : undefined,
              creadoEn: toDate(d.data()['creadoEn']),
              actualizadoEn: toDate(d.data()['actualizadoEn']),
            } as Viaje)),
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

  async create(viaje: Omit<Viaje, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
    const ref = collection(this.firestore, 'viajes');
    const docRef = await addDoc(ref, { ...viaje, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
    return docRef.id;
  }

  async update(id: string, data: Partial<Viaje>): Promise<void> {
    const ref = doc(this.firestore, 'viajes', id);
    await updateDoc(ref, { ...data, actualizadoEn: serverTimestamp() });
  }
}
