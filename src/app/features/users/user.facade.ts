import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { User } from '../../core/models';
import { AuthFacade } from '../auth/auth.facade';
import { USER_REPOSITORY } from 'src/app/core/interfaces/user.repository';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private userService = inject(USER_REPOSITORY);
  private authFacade = inject(AuthFacade);
  private destroyRef = inject(DestroyRef);

  // Señales privadas (fuente de verdad)
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _users = signal<User[]>([]);
  private unsubscribe: (() => void) | null = null;

  // Señales públicas para interactuar con el servicio de usuarios
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly users = this._users.asReadonly();

  async createUser(user: User): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.userService.createUser(user);
      this._users.update((users) => [...users, user]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando al usuario';
      this._error.set(errorMessage);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async dniExists(dni: string): Promise<boolean> {
    const exists = await this.userService.dniExists(dni);

    if (exists) {
      this._error.set('Ese DNI ya está registrado.');
    } else {
      this._error.set(null);
    }

    return exists;
  }

  async updateUser(updatedData: Partial<User> & { id: string }): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.userService.updateUser(updatedData);

      // Actualización local de la lista de usuarios
      this._users.update((users) =>
        users.map((u) => (u.id === updatedData.id ? { ...u, ...updatedData } : u)),
      );

      // Solo actualiza la señal del usuario autenticado si el usuario actualizado es el usuario autenticado
      if (this.authFacade.user()?.id === updatedData.id) {
        const updatedUser = await this.userService.getUserById(updatedData.id);
        if (updatedUser) {
          //console.log('User updated:', updatedUser);
        } else {
          throw new Error(`No se pudo obtener el usuario actualizado con el ID: ${updatedData.id}`);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el usuario';
      this._error.set(errorMessage);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async getUsersByRole(role: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const users = await this.userService.getUsersByRole(role);
      this._users.set(users);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo usuarios por rol';
      this._error.set(errorMessage);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    this._loading.set(true);
    this._error.set(null);
    try {
      return await this.userService.getUserById(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo usuarios por ID';
      this._error.set(errorMessage);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteUser(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.userService.deactivateUser(id);
      this._users.update((users) => users.filter((u) => u.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando usuario';
      this._error.set(errorMessage);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async getUsers(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Unsubscribe from previous listener if exists
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      // Subscribe to realtime updates of all users (active and inactive)
      this.unsubscribe = this.userService.getAllUsers(
        (users: User[]) => {
          this._users.set(users);
          this._loading.set(false);
        },
        (error: Error) => {
          const errorMessage = error.message || 'Error obteniendo usuarios';
          this._error.set(errorMessage);
          this._loading.set(false);
        },
      );

      // Register cleanup on component destroy
      this.destroyRef.onDestroy(() => {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo usuarios';
      this._error.set(errorMessage);
      this._loading.set(false);
      throw err;
    }
  }
}
