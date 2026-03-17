import { Injectable, inject, computed, signal } from '@angular/core';
import { FirebaseContactosService } from './firebase-contactos.service';
import { Contacto } from '../../core/models/contacto.model';
import { AUTH_PROVIDER } from '../../core/interfaces/auth-provider.interface';

@Injectable({ providedIn: 'root' })
export class ContactosFacade {
  private readonly service = inject(FirebaseContactosService);
  private readonly authProvider = inject(AUTH_PROVIDER);

  private readonly _error = signal<string | null>(null);
  private readonly _saving = signal(false);

  readonly contactos = this.service.contactos;
  readonly clientes = this.service.clientes;
  readonly proveedores = this.service.proveedores;
  readonly loading = this.service.loading;
  readonly error = computed(() => this._error() || this.service.error());
  readonly saving = this._saving.asReadonly();

  init(): void {
    this.service.startListening();
  }

  destroy(): void {
    this.service.stopListening();
  }

  async crear(data: Omit<Contacto, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<string> {
    this._saving.set(true);
    this._error.set(null);
    try {
      const uid = this.authProvider.user()?.uid ?? 'sistema';
      return await this.service.create({ ...data, creadoPor: uid });
    } catch (e) {
      this._error.set((e as Error).message);
      throw e;
    } finally {
      this._saving.set(false);
    }
  }

  async actualizar(id: string, data: Partial<Contacto>): Promise<void> {
    this._saving.set(true);
    this._error.set(null);
    try {
      await this.service.update(id, data);
    } catch (e) {
      this._error.set((e as Error).message);
      throw e;
    } finally {
      this._saving.set(false);
    }
  }

  async eliminar(id: string): Promise<void> {
    this._saving.set(true);
    this._error.set(null);
    try {
      await this.service.delete(id);
    } catch (e) {
      this._error.set((e as Error).message);
      throw e;
    } finally {
      this._saving.set(false);
    }
  }

  buscar(query: string): Contacto[] {
    const q = query.toLowerCase();
    return this.contactos().filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.telefono.includes(q) ||
        (c.nit ?? '').includes(q) ||
        (c.cedula ?? '').includes(q),
    );
  }
}
