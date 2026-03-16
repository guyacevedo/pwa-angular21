import { Injectable, inject, signal } from '@angular/core';
import { Empresa } from '../../core/models/empresa.model';
import { ConfiguracionService } from '../../core/services/configuracion.service';

/**
 * Facade para la gestión de configuración de empresa.
 * Expone una API pública y delega al servicio interno.
 */
@Injectable({ providedIn: 'root' })
export class ConfigurationFacade {
  private readonly service = inject(ConfiguracionService);
  private readonly _error = signal<string | null>(null);

  // Signals públicas expuestas desde el servicio
  readonly config = this.service.config.asReadonly();
  readonly loading = this.service.loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Guarda la configuración de empresa
   */
  async save(config: Empresa): Promise<void> {
    this._error.set(null);
    try {
      await this.service.saveConfig(config);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar configuración';
      this._error.set(errorMessage);
      throw err;
    }
  }

  /**
   * Recarga la configuración desde Firestore
   */
  async reload(): Promise<void> {
    this._error.set(null);
    try {
      await this.service.loadConfig();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuración';
      this._error.set(errorMessage);
      throw err;
    }
  }
}
