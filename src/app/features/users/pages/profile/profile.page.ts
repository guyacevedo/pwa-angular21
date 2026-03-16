import {
  Component,
  Signal,
  inject,
  computed,
  signal,
  effect,
  WritableSignal,
} from '@angular/core';

import { AuthFacade } from '../../../auth/auth.facade';
import { User } from '../../../../core/models';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../core/validators/custom-validators';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { UserFacade } from '../../user.facade';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { FormHeaderComponent } from 'src/app/shared/components/form-header/form-header.component';
import { CloudinaryService } from 'src/app/core/services/cloudinary.service';
import { AppSuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { AppErrorModalComponent } from '../../../../shared/components/error-modal/error-modal.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { USER_ROLES_LABELS } from '../../../../core/types/user-role.type';
import { USER_STATUS_LABELS } from '../../../../core/types/user-status.type';

interface ProfileFormValue {
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    InputCustomComponent,
    FormHeaderComponent,
    AppSuccessModalComponent,
    AppErrorModalComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-form-header
      title="Mi Perfil"
      [disabled]="form.invalid || isLoading() || !hasChanges()"
      [loading]="isLoading()"
      saveLabel="Guardar Cambios"
      (save)="onSubmit()"
      backUrl="/configuracion"
    ></app-form-header>

    <main class="w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      @if (!user()) {
        <!-- Skeleton -->
        <div class="max-w-2xl mx-auto px-4 mt-8 space-y-4 animate-pulse">
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex items-center gap-5">
            <div class="size-20 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <div class="space-y-2 flex-1">
              <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-28"></div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
            <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-36"></div>
            <div class="grid grid-cols-2 gap-4">
              @for (i of [1,2,3]; track i) {
                <div class="space-y-2">
                  <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div>
                  <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="max-w-2xl mx-auto px-4 mt-6 space-y-4">

          <!-- Avatar Card -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <div class="flex items-center gap-5">
              <!-- Avatar con overlay de edición -->
              <label for="profilePictureInput" class="relative group cursor-pointer shrink-0">
                <div class="size-20 rounded-full overflow-hidden ring-4 ring-primary/10 shadow-sm">
                  <img
                    [src]="profilePictureUrl()"
                    alt="Foto de perfil"
                    class="size-full object-cover object-top"
                  />
                </div>
                <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <app-svg-icon icon="edit" size="20px" class="text-white"></app-svg-icon>
                </div>
                <div class="absolute -bottom-1 -right-1 size-7 bg-primary rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800">
                  <app-svg-icon icon="edit" size="14px" class="text-white"></app-svg-icon>
                </div>
              </label>
              <input id="profilePictureInput" type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*" />

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {{ user()!.firstName }} {{ user()!.lastName }}
                </h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ user()!.email }}</p>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <app-status-badge
                    [text]="roleLabel()"
                    [type]="user()!.role === 'ADMIN' ? 'primary' : 'neutral'"
                    size="sm"
                  />
                  <app-status-badge
                    [text]="statusLabel()"
                    [type]="statusBadgeType()"
                    size="sm"
                  />
                </div>
              </div>
            </div>
            @if (selectedFile()) {
              <p class="mt-3 text-xs text-primary font-medium flex items-center gap-1">
                <app-svg-icon icon="check" size="14px"></app-svg-icon>
                Nueva foto seleccionada — se guardará al hacer clic en "Guardar Cambios"
              </p>
            }
          </div>

          <!-- Datos Personales Card -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <div class="size-1.5 bg-primary rounded-full"></div>
              Datos Personales
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <app-input-custom
                formControlName="firstName"
                label="Nombre"
                placeholder="Ej. Juan Andrés"
                autocomplete="given-name"
                [maxlength]="30"
                [required]="true"
              />
              <app-input-custom
                formControlName="lastName"
                label="Apellidos"
                placeholder="Ej. Pérez García"
                autocomplete="family-name"
                [maxlength]="30"
                [required]="true"
              />
              <app-input-custom
                formControlName="dni"
                label="C.C. / DNI"
                placeholder="Número de documento"
                [maxlength]="10"
                [isDisabled]="true"
                [required]="true"
              />
              <app-input-custom
                formControlName="phone"
                label="Teléfono (opcional)"
                placeholder="Ej. 3001234567"
                type="tel"
                inputMode="tel"
                autocomplete="tel"
                [maxlength]="15"
              />
            </div>
          </div>

          <!-- Cuenta (solo lectura) -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div class="size-1.5 bg-primary rounded-full"></div>
              Información de Cuenta
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Correo</p>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{{ user()!.email }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Rol</p>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ roleLabel() }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Estado</p>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ statusLabel() }}</p>
              </div>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-4">
              Para cambiar el correo o contraseña, contacta al administrador del sistema.
            </p>
          </div>

        </form>
      }
    </main>

    <!-- Success Modal -->
    <app-success-modal
      [isOpen]="showSuccess()"
      title="Perfil Actualizado"
      message="Tus datos han sido guardados correctamente."
      icon="check"
      returnToListText="Cerrar"
      [showPrintButtons]="false"
      [showSecondaryButtons]="false"
      (irAListado)="onSuccessClose()"
    />

    <!-- Error Modal -->
    <app-error-modal
      [isOpen]="showError()"
      title="Error al guardar"
      message="No se pudieron guardar los cambios. Intenta nuevamente."
      (reintentar)="onSubmit()"
      (cancelar)="showError.set(false)"
    />
  `,
})
export class ProfilePage {
  private readonly fb = inject(FormBuilder);
  private readonly userFacade = inject(UserFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly cloudinaryService = inject(CloudinaryService);

  readonly profilePictureUrl: WritableSignal<string> = signal('');
  readonly selectedFile: WritableSignal<File | null> = signal(null);
  readonly showSuccess = signal(false);
  readonly showError = signal(false);

  readonly user: Signal<User | null> = this.authFacade.user;
  readonly isLoading: Signal<boolean> = this.userFacade.isLoading;

  readonly roleLabel = computed(() => USER_ROLES_LABELS[this.user()?.role ?? 'GUEST']);
  readonly statusLabel = computed(() => USER_STATUS_LABELS[this.user()?.status ?? 'INACTIVE']);
  readonly statusBadgeType = computed(() => {
    switch (this.user()?.status) {
      case 'ACTIVE': return 'success' as const;
      case 'INACTIVE': return 'warning' as const;
      case 'DISABLED': return 'danger' as const;
      default: return 'neutral' as const;
    }
  });

  form!: FormGroup;
  private formValue!: Signal<ProfileFormValue>;

  readonly hasChanges = computed(() => this.changedValues());

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.name(2, 30)]],
      lastName: ['', [Validators.required, CustomValidators.name(2, 30)]],
      dni: ['', [Validators.required, CustomValidators.dni(7, 9)]],
      phone: ['', CustomValidators.phoneOptional(8, 15)],
    });

    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.profilePictureUrl.set(
          currentUser.profilePictureUrl || this.cloudinaryService.defaultProfilePictureUrl,
        );
        this.form.patchValue({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          dni: currentUser.dni,
          phone: currentUser.phone,
        });
      }
    });

    this.formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.showError.set(false);

    try {
      const updatedData: Partial<User> & { id: string } = {
        ...this.form.value,
        id: this.user()?.id ?? '',
      };

      if (this.selectedFile()) {
        updatedData.profilePictureUrl = await this.cloudinaryService.uploadImage(this.selectedFile()!);
      }

      await this.userFacade.updateUser(updatedData);
      this.showSuccess.set(true);
    } catch {
      this.showError.set(true);
    }
  }

  onSuccessClose(): void {
    this.showSuccess.set(false);
    this.router.navigate(['/dashboard']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile.set(input.files[0]);
      this.profilePictureUrl.set(URL.createObjectURL(input.files[0]));
    }
  }

  private changedValues(): boolean {
    if (this.selectedFile()) return true;
    const currentUser = this.user();
    const formValue = this.formValue?.();
    if (!currentUser || !formValue) return false;
    return !(
      formValue['firstName'] === currentUser.firstName &&
      formValue['lastName'] === currentUser.lastName &&
      formValue['dni'] === currentUser.dni &&
      formValue['phone'] === currentUser.phone
    );
  }
}
