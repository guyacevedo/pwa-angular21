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
import { Camion, AlertaVencimientoCamion } from '../../core/models/camion.model';

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

const DIAS_ALERTA = 30;

@Injectable({ providedIn: 'root' })
export class FirebaseCamionesService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private readonly _camiones = signal<Camion[]>([]);
  private readonly _loading = signal(false);
  private unsubscribe: (() => void) | null = null;

  readonly camiones = this._camiones.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly alertasVencimiento = computed<AlertaVencimientoCamion[]>(() => {
    const ahora = Date.now();
    const alertas: AlertaVencimientoCamion[] = [];
    for (const c of this._camiones()) {
      const docs: { tipo: AlertaVencimientoCamion['tipoDocumento']; fecha: Date }[] = [
        { tipo: 'SOAT', fecha: c.vencimientoSoat },
        { tipo: 'TECNOMECANICA', fecha: c.vencimientoTecnomecanica },
        { tipo: 'AUNAP', fecha: c.vencimientoAunap },
      ];
      for (const d of docs) {
        const dias = Math.ceil((d.fecha.getTime() - ahora) / (1000 * 60 * 60 * 24));
        if (dias <= DIAS_ALERTA) {
          alertas.push({
            camionId: c.id,
            placa: c.placa,
            tipoDocumento: d.tipo,
            fechaVencimiento: d.fecha,
            diasRestantes: dias,
            nivel: dias < 7 ? 'CRITICO' : dias < 15 ? 'ADVERTENCIA' : 'INFO',
          });
        }
      }
    }
    return alertas;
  });

  startListening(): void {
    if (this.unsubscribe) return;
    this._loading.set(true);
    const ref = collection(this.firestore, 'camiones');
    const q = query(ref, orderBy('placa'));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this._camiones.set(
            snap.docs.map((d) => ({
              ...d.data(),
              id: d.id,
              vencimientoSoat: toDate(d.data()['vencimientoSoat']),
              vencimientoTecnomecanica: toDate(d.data()['vencimientoTecnomecanica']),
              vencimientoAunap: toDate(d.data()['vencimientoAunap']),
              creadoEn: toDate(d.data()['creadoEn']),
              actualizadoEn: toDate(d.data()['actualizadoEn']),
            } as Camion)),
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

  async create(camion: Omit<Camion, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
    const ref = collection(this.firestore, 'camiones');
    const docRef = await addDoc(ref, { ...camion, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
    return docRef.id;
  }

  async update(id: string, data: Partial<Camion>): Promise<void> {
    const ref = doc(this.firestore, 'camiones', id);
    await updateDoc(ref, { ...data, actualizadoEn: serverTimestamp() });
  }
}
