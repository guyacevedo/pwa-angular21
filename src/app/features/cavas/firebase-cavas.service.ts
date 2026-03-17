import { Injectable, inject, NgZone, signal, computed } from '@angular/core';
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
import { Cava, EstadoCava } from '../../core/models/cava.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

@Injectable({ providedIn: 'root' })
export class FirebaseCavasService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _cavas = signal<Cava[]>([]);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly cavas = this._cavas.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly disponibles = computed(() =>
    this._cavas().filter((c) => c.estado === 'DISPONIBLE'),
  );
  readonly enCirculacion = computed(() =>
    this._cavas().filter((c) => c.estado !== 'DISPONIBLE' && c.estado !== 'BAJA'),
  );
  readonly alertaFinVidaUtil = computed(() =>
    this._cavas().filter((c) => c.alertaBajaProxima && c.estado !== 'BAJA'),
  );

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'cavas');
    const q = query(ref, orderBy('codigoFisico'));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._cavas.set(
            snap.docs.map((d) => {
              const data = d.data();
              const viajesRealizados = (data['viajesRealizados'] as number) ?? 0;
              const vidaUtilMax = (data['vidaUtilMax'] as number) ?? 15;
              return {
                ...data,
                id: d.id,
                alertaBajaProxima: viajesRealizados >= vidaUtilMax - 3,
                activaDesde: toDate(data['activaDesde']),
                creadoEn: toDate(data['creadoEn']),
                actualizadoEn: toDate(data['actualizadoEn']),
              } as Cava;
            }),
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

  async create(cava: Omit<Cava, 'id' | 'creadoEn' | 'actualizadoEn' | 'alertaBajaProxima'>): Promise<string> {
    const ref = collection(this.firestore, 'cavas');
    const docRef = await addDoc(ref, {
      ...cava,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<Cava>): Promise<void> {
    const ref = doc(this.firestore, 'cavas', id);
    await updateDoc(ref, { ...data, actualizadoEn: serverTimestamp() });
  }

  async cambiarEstado(id: string, estado: EstadoCava, extra?: Partial<Cava>): Promise<void> {
    const ref = doc(this.firestore, 'cavas', id);
    await updateDoc(ref, { estado, ...extra, actualizadoEn: serverTimestamp() });
  }

  async registrarViaje(id: string): Promise<void> {
    const cava = this._cavas().find((c) => c.id === id);
    if (!cava) return;
    const nuevosViajes = cava.viajesRealizados + 1;
    await this.update(id, { viajesRealizados: nuevosViajes });
  }
}
