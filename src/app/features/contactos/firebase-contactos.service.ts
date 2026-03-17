import { Injectable, inject, NgZone, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Contacto } from '../../core/models/contacto.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

@Injectable({ providedIn: 'root' })
export class FirebaseContactosService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _contactos = signal<Contacto[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private unsubscribe: (() => void) | null = null;

  readonly contactos = this._contactos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly clientes = computed(() =>
    this._contactos().filter((c) => c.tipo === 'CLIENTE' || c.tipo === 'AMBOS'),
  );
  readonly proveedores = computed(() =>
    this._contactos().filter((c) => c.tipo === 'PROVEEDOR' || c.tipo === 'AMBOS'),
  );

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'contactos');
    const q = query(ref, orderBy('nombre'));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(
        q,
        (snap) => {
          this.ngZone.run(() => {
            this._contactos.set(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  ...data,
                  id: d.id,
                  creadoEn: toDate(data['creadoEn']),
                  actualizadoEn: toDate(data['actualizadoEn']),
                } as Contacto;
              }),
            );
            this._loading.set(false);
          });
        },
        (err) => {
          this.ngZone.run(() => {
            this._error.set(err.message);
            this._loading.set(false);
          });
        },
      );
    });
  }

  stopListening(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async create(contacto: Omit<Contacto, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
    const ref = collection(this.firestore, 'contactos');
    const docRef = await addDoc(ref, {
      ...contacto,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Contacto>): Promise<void> {
    const ref = doc(this.firestore, 'contactos', id);
    await updateDoc(ref, { ...data, actualizadoEn: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.firestore, 'contactos', id);
    await deleteDoc(ref);
  }
}
