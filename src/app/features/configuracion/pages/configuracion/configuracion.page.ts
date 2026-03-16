import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { ThemeService } from 'src/app/core/services/theme.service';
import { AuthFacade } from '../../../auth/auth.facade';
import { DialogService } from '../../../../shared/services/dialog/dialog.service';
import { DialogComponent, DialogConfig } from '../../../../shared/components/dialog/dialog.component';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-configuracion',
  imports: [RouterLink, SvgIconComponent],
  template: `
    <main class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <div class="max-w-2xl mx-auto px-4 py-8">

        <!-- Header -->
        <div class="mb-8">
          <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            Ajustes
          </p>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Configuración
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Personaliza la aplicación y administra los datos de tu empresa.
          </p>
        </div>

        <!-- Sección: Apariencia -->
        <section class="mb-6">
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">
            Apariencia
          </p>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <!-- Modo oscuro -->
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-base">
                  🌙
                </div>
                <div>
                  <p class="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Oscuro</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500">Cambiar entre tema claro y oscuro</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="themeService.isDarkMode()"
                (click)="themeService.toggleDarkMode(!themeService.isDarkMode())"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                [class]="themeService.isDarkMode() ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600'"
              >
                <span
                  class="inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform"
                  [style.transform]="themeService.isDarkMode() ? 'translateX(1.375rem)' : 'translateX(0.25rem)'"
                ></span>
              </button>
            </div>
          </div>
        </section>

        <!-- Sección: Empresa (solo ADMIN) -->
        @if (permissions.canManageConfig()) {
        <section class="mb-6">
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">
            Empresa
          </p>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <a
              [routerLink]="'empresa'"
              class="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
            >
              <div class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <app-svg-icon icon="business" size="20px" class="text-blue-600 dark:text-blue-400"></app-svg-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-800 dark:text-slate-200 text-sm">Datos de la Empresa</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 truncate">Razón social, NIT, dirección, facturación</p>
              </div>
              <app-svg-icon icon="arrowRight" size="20px" class="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-primary transition-colors"></app-svg-icon>
            </a>
          </div>
        </section>
        }

        <!-- Sección: Usuarios (solo ADMIN) -->
        @if (permissions.canManageUsers()) {
        <section class="mb-6">
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">
            Usuarios
          </p>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <a
              routerLink="/users"
              class="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
            >
              <div class="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                <app-svg-icon icon="people" size="20px" class="text-violet-600 dark:text-violet-400"></app-svg-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-800 dark:text-slate-200 text-sm">Usuarios y Permisos</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 truncate">Gestión de usuarios, roles y accesos</p>
              </div>
              <app-svg-icon icon="arrowRight" size="20px" class="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-primary transition-colors"></app-svg-icon>
            </a>
          </div>
        </section>
        }

        <!-- Sección: Cuenta -->
        <section class="mb-6">
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">
            Cuenta
          </p>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <a
              routerLink="/users/profile"
              class="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
            >
              <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <app-svg-icon icon="user" size="20px" class="text-emerald-600 dark:text-emerald-400"></app-svg-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-800 dark:text-slate-200 text-sm">Mi Perfil</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 truncate">Foto, nombre, teléfono</p>
              </div>
              <app-svg-icon icon="arrowRight" size="20px" class="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-primary transition-colors"></app-svg-icon>
            </a>
            <button
              type="button"
              (click)="logout()"
              class="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group text-left border-t border-slate-100 dark:border-slate-700"
            >
              <div class="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                <app-svg-icon icon="logout" size="20px" class="text-red-500 dark:text-red-400"></app-svg-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-red-600 dark:text-red-400 text-sm">Cerrar Sesión</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">Salir de la aplicación</p>
              </div>
            </button>
          </div>
        </section>

        <!-- App version -->
        <p class="text-center text-xs text-slate-300 dark:text-slate-600 mt-8">
          v1.0.0 · PWA Angular
        </p>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionPage {
  public themeService = inject(ThemeService);
  private readonly authFacade = inject(AuthFacade);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  readonly permissions = inject(PermissionsService);

  logout() {
    this.dialogService
      .openGeneric<DialogComponent, boolean, DialogConfig, boolean | string>(DialogComponent, {
        title: 'Cerrar Sesión',
        message: '¿Seguro de salir de tu cuenta?',
        confirmText: 'Cerrar Sesión',
        confirmBgColor: 'danger',
        cancelText: 'Cancelar',
        icon: 'logout',
        iconColor: 'text-red-primary',
        iconBgColor: 'bg-red-secondary',
      })
      .subscribe(async (result) => {
        if (result) {
          await this.authFacade.logout();
          this.router.navigate(['/auth/login']);
        }
      });
  }
}
