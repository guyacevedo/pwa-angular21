import { EnvironmentInjector, Injectable, inject, runInInjectionContext, signal } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, Timestamp } from '@angular/fire/firestore';
import { Empresa } from '../models/empresa.model';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  private readonly COLLECTION_NAME = 'configuracion';
  private readonly DOC_ID = 'empresa';

  /** Signal reactiva de la config de empresa — consumible en PdfService y Dashboard */
  readonly config = signal<Empresa | null>(null);
  readonly loading = signal(false);

  constructor() {
    this.loadConfig();
  }

  async loadConfig(): Promise<void> {
    this.loading.set(true);
    try {
      const cfg = await this.getConfig();
      this.config.set(cfg);
    } finally {
      this.loading.set(false);
    }
  }

  async getConfig(): Promise<Empresa | null> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const docRef = doc(this.firestore, this.COLLECTION_NAME, this.DOC_ID);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          return {
            ...data,
            id: snapshot.id,
            updatedAt:
              data['updatedAt'] instanceof Timestamp ? data['updatedAt'].toDate() : undefined,
          } as Empresa;
        }
        return null;
      } catch (error) {
        console.error('Error obteniendo configuración:', error);
        throw error;
      }
    });
  }

  async saveConfig(config: Empresa): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const docRef = doc(this.firestore, this.COLLECTION_NAME, this.DOC_ID);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...data } = config;

        const payload = {
          ...data,
          updatedAt: Timestamp.now(),
        };

        await setDoc(docRef, payload, { merge: true });
        this.config.set({ ...config, updatedAt: new Date() });
      } catch (error) {
        console.error('Error guardando configuración:', error);
        throw error;
      }
    });
  }
}
