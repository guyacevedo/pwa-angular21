import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
  signal,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { DialogService } from '../../shared/services/dialog/dialog.service';
import { SvgIconComponent } from '../../shared/icons/svg-icon.component';
import { AuthFacade } from '../../features/auth/auth.facade';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { USER_ROLES_LABELS } from '../../core/types/user-role.type';
import { DialogComponent, DialogConfig } from '../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-user-submenu',
  standalone: true,
  imports: [RouterLink, SvgIconComponent],
  template: ` <div class="relative" #menuContainer>
    <!-- Trigger -->
    <button
      (click)="toggleMenu(); $event.stopPropagation()"
      class="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl p-2 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      <div class="flex flex-nowrap gap-2 justify-start items-center min-w-0">
        <div
          class="size-9 rounded-full shadow overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 ring-2 ring-white/20"
        >
          @if (profilePictureUrl()) {
            <img
              [src]="profilePictureUrl()"
              alt="Foto de perfil"
              (load)="isImageLoaded.set(true)"
              [class.opacity-100]="isImageLoaded()"
              [class.opacity-0]="!isImageLoaded()"
              class="size-full object-cover transition-opacity duration-300"
            />
          }
        </div>
        <div class="flex flex-col justify-center min-w-0 overflow-hidden text-left text-white">
          <span class="font-semibold text-sm truncate leading-tight">{{ fullName() }}</span>
          <span class="text-white/60 text-[10px] truncate">{{ role() }}</span>
        </div>
      </div>
      <app-svg-icon
        [icon]="isOpen() ? 'arrowDropUp' : 'arrowDropDown'"
        size="20px"
        class="text-white/50 shrink-0"
      ></app-svg-icon>
    </button>

    <!-- Dropdown -->
    @if (isOpen()) {
      <div
        class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-200 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-slate-900 dark:text-slate-200"
      >
        <!-- User info header -->
        <div
          class="px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3"
        >
          <div class="size-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20">
            <img [src]="profilePictureUrl()" alt="Foto de perfil" class="size-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900 dark:text-white truncate">
              {{ fullName() }}
            </p>
            <p class="text-xs text-slate-600 dark:text-slate-400 truncate">{{ email() }}</p>
            <p class="text-[10px] font-semibold text-primary uppercase tracking-wide mt-0.5">
              {{ role() }}
            </p>
          </div>
        </div>

        <!-- Nav items -->
        <ul class="flex flex-col py-1.5">
          <li>
            <a
              routerLink="/users/profile"
              (click)="isOpen.set(false)"
              class="flex items-center gap-3 px-4 py-2.5 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div
                class="flex items-center justify-center size-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0"
              >
                <app-svg-icon icon="user" size="18px"></app-svg-icon>
              </div>
              <span class="font-medium text-sm">Mi Perfil</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/configuracion"
              (click)="isOpen.set(false)"
              class="flex items-center gap-3 px-4 py-2.5 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div
                class="flex items-center justify-center size-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 shrink-0"
              >
                <app-svg-icon icon="settings" size="18px"></app-svg-icon>
              </div>
              <span class="font-medium text-sm">Configuración</span>
            </a>
          </li>
        </ul>

        <!-- Logout -->
        <div class="border-t border-slate-100 dark:border-slate-700 py-1.5">
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-left"
            (click)="handleLogoutClick()"
          >
            <div
              class="flex items-center justify-center size-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500 shrink-0"
            >
              <app-svg-icon icon="logout" size="18px"></app-svg-icon>
            </div>
            <span class="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSubmenuComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly cloudinaryService = inject(CloudinaryService);

  @ViewChild('menuContainer') menuContainer!: ElementRef;

  readonly isOpen = signal(false);
  readonly user = this.authFacade.user;
  readonly defaultProfilePictureUrl = this.cloudinaryService.defaultProfilePictureUrl;

  readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName ?? ''}`.trim() : 'Usuario';
  });

  readonly role = computed(() => {
    const u = this.user();
    return u ? USER_ROLES_LABELS[u.role] : 'Sin rol';
  });

  readonly email = computed(() => this.user()?.email ?? '');

  readonly profilePictureUrl = computed(() => {
    const user = this.user();
    if (user && user.profilePictureUrl) {
      return this.cloudinaryService.getTransformedUrl(
        user.profilePictureUrl,
        'w_40,h_40,c_fill,g_face,f_webp',
      );
    }
    return this.defaultProfilePictureUrl;
  });

  readonly isImageLoaded = signal(false);

  toggleMenu() {
    this.isOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.isOpen() &&
      this.menuContainer &&
      !this.menuContainer.nativeElement.contains(event.target)
    ) {
      this.isOpen.set(false);
    }
  }

  async handleLogoutClick(): Promise<void> {
    this.isOpen.set(false);
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
          try {
            // Logout first to update auth state
            await this.authFacade.logout();
            // Then navigate to login (guard will redirect if user is null)
            await this.router.navigate(['/auth/login'], { replaceUrl: true });
          } catch (error) {
            console.error('Logout error:', error);
            // Fallback: navigate to login anyway
            this.router.navigate(['/auth/login'], { replaceUrl: true });
          }
        }
      });
  }
}
