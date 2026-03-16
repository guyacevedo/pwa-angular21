import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  Signal,
  WritableSignal,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { AuthFacade } from '../../../auth/auth.facade';
import { UserFacade } from '../../user.facade';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { CustomValidators } from '../../../../core/validators/custom-validators';
import { User } from '../../../../core/models';
import { USER_ROLES_LABELS, UserRole } from '../../../../core/types/user-role.type';
import { SelectCustomComponent } from 'src/app/shared/components/select-custom/select-custom.component';
import { AppSuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { AppErrorModalComponent } from '../../../../shared/components/error-modal/error-modal.component';

@Component({
  selector: 'app-modal-form-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputCustomComponent,
    SvgIconComponent,
    SelectCustomComponent,
    AppSuccessModalComponent,
    AppErrorModalComponent,
  ],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden animate-slide-up">

        <!-- Header -->
        <header class="flex items-center justify-between p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800">
          <h2 class="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {{ isEditMode() ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h2>
          <div class="flex items-center gap-2 sm:gap-4">
            <button
              [disabled]="form.invalid || isLoading() || onSubmitStarted()"
              (click)="onSubmit()"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold text-sm transition-colors"
            >
              @if (isLoading() || onSubmitStarted()) {
                <div class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Guardando
              } @else {
                <app-svg-icon icon="check" class="text-white"></app-svg-icon>
                Guardar
              }
            </button>

            @if (isEditMode()) {
              <button
                type="button"
                (click)="confirmDelete.set(true)"
                [disabled]="isLoading() || onSubmitStarted()"
                class="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-bold text-sm transition-colors outline-1 outline-red-200 dark:outline-red-800"
              >
                <app-svg-icon icon="trash" class="text-current"></app-svg-icon>
                <span class="hidden md:inline">Eliminar</span>
              </button>
            }

            <button
              (click)="cancel()"
              [disabled]="isLoading() || onSubmitStarted()"
              class="flex items-center justify-center size-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full transition-colors disabled:opacity-50"
            >
              <app-svg-icon icon="close" size="20px"></app-svg-icon>
            </button>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
          <div class="max-w-3xl mx-auto">
            <form
              [formGroup]="form"
              (ngSubmit)="onSubmit()"
              class="flex flex-col gap-6"
              [class.opacity-60]="isLoading()"
            >
              <!-- Perfil y Foto -->
              <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  <div class="relative group">
                    <div class="size-24 rounded-full overflow-hidden border-4 border-primary/10 relative">
                      <img [src]="profilePictureUrl()" alt="Foto de perfil" class="size-full object-cover" />
                      <label
                        for="profilePictureInput"
                        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <span class="sr-only">Subir foto de perfil</span>
                        <app-svg-icon icon="edit" class="text-white"></app-svg-icon>
                      </label>
                    </div>
                    <input
                      #profilePictureInput
                      id="profilePictureInput"
                      type="file"
                      class="hidden"
                      (change)="onFileSelected($event)"
                      accept="image/*"
                    />
                  </div>
                  <div class="flex-1 text-center sm:text-left">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200">Foto de Perfil</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
                      Sube una foto clara para que tus compañeros puedan reconocerte.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Información Personal -->
              <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                  <div class="size-2 bg-primary rounded-full"></div>
                  Información Personal
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  @if (isLoadingData()) {
                    @for (i of [1, 2, 3, 4]; track i) {
                      <div class="flex flex-col gap-2 animate-pulse">
                        <div class="h-4 bg-slate-200 dark:bg-slate-700 w-24 rounded"></div>
                        <div class="h-12 bg-slate-200 dark:bg-slate-700 w-full rounded-xl"></div>
                      </div>
                    }
                  } @else {
                    <app-input-custom formControlName="firstName" label="Nombres" placeholder="Ej. Juan Andrés" [maxlength]="30" />
                    <app-input-custom formControlName="lastName" label="Apellidos" placeholder="Ej. Pérez García" [maxlength]="30" />
                    <app-input-custom formControlName="dni" label="Cédula / DNI" placeholder="Ej. 1050111xxx" [maxlength]="10" />
                    <app-input-custom formControlName="phone" label="Teléfono" placeholder="Ej. 3001234567" [maxlength]="15" />
                  }
                </div>
              </div>

              <!-- Acceso y Rol -->
              <div class="bg-white dark:bg-slate-800 px-5 py-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                  <div class="size-2 bg-primary rounded-full"></div>
                  Acceso y Selección de Rol
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  @if (isLoadingData()) {
                    @for (i of [1, 2]; track i) {
                      <div class="flex flex-col gap-2 animate-pulse">
                        <div class="h-4 bg-slate-200 dark:bg-slate-700 w-32 rounded"></div>
                        <div class="h-12 bg-slate-200 dark:bg-slate-700 w-full rounded-xl"></div>
                      </div>
                    }
                  } @else {
                    <app-input-custom formControlName="email" label="Correo Electrónico" placeholder="usuario@empresa.com" type="email" />
                    <app-select-custom
                      formControlName="role"
                      label="Rol en la empresa"
                      [options]="rolesOptions()"
                      placeholder="Seleccionar rol"
                      [required]="true"
                    />
                    @if (!isEditMode()) {
                      <app-input-custom formControlName="password" label="Contraseña Temporal" placeholder="Mínimo 8 caracteres" type="password" />
                    }
                  }
                </div>
              </div>

              <!-- Error inline -->
              @if (submitted && registerError()) {
                <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                  <app-svg-icon icon="error" class="text-red-500 shrink-0"></app-svg-icon>
                  <p class="text-sm font-medium">{{ registerError() }}</p>
                </div>
              }
            </form>
          </div>
        </main>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    @if (confirmDelete()) {
      <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4">
          <div class="size-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <app-svg-icon icon="trash" size="28px" class="text-red-500"></app-svg-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">¿Eliminar usuario?</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Esta acción deshabilitará a
            <strong class="text-slate-700 dark:text-slate-200">{{ user()?.firstName }} {{ user()?.lastName }}</strong>.
            Podrás reactivarlo después si es necesario.
          </p>
          <div class="flex gap-3 w-full mt-2">
            <button
              (click)="confirmDelete.set(false)"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="executeDelete()"
              class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Success Modal -->
    <app-success-modal
      [isOpen]="showSuccess()"
      [title]="isEditMode() ? 'Usuario Actualizado' : 'Usuario Creado'"
      [message]="successMessage()"
      icon="check"
      returnToListText="Volver al listado"
      [showPrintButtons]="false"
      [showSecondaryButtons]="false"
      (irAListado)="confirm(true)"
    />

    <!-- Error Modal -->
    <app-error-modal
      [isOpen]="showErrorModal()"
      title="Error al guardar"
      [message]="registerError() ?? 'Ocurrió un error inesperado. Intenta nuevamente.'"
      (reintentar)="retrySubmit()"
      (cancelar)="showErrorModal.set(false)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalFormUserComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly userFacade = inject(UserFacade);
  private readonly cloudinaryService = inject(CloudinaryService);
  private readonly fb = inject(FormBuilder);

  public readonly closed = output<{ role: string }>();

  readonly isLoadingData = signal(false);
  readonly confirmDelete = signal(false);
  readonly showSuccess = signal(false);
  readonly showErrorModal = signal(false);

  readonly roles = Object.entries(USER_ROLES_LABELS).map(([key, label]) => ({
    key: key as UserRole,
    label,
  }));

  user = input<User | null>(null);

  readonly rolesOptions = computed(() => [
    { value: '', label: 'Seleccionar rol' },
    ...this.roles.map((role) => ({ value: role.key, label: role.label })),
  ]);

  readonly isEditMode = computed(() => !!this.user());

  readonly profilePictureUrl: WritableSignal<string> = signal(
    this.cloudinaryService.defaultProfilePictureUrl,
  );
  readonly selectedFile: WritableSignal<File | null> = signal(null);

  submitted = false;

  readonly registerError = computed(() => this.userFacade.error() || this.authFacade.error());

  readonly onSubmitStarted = signal(false);

  readonly isLoading: Signal<boolean> = computed(
    () => this.authFacade.isLoading() || this.userFacade.isLoading() || this.onSubmitStarted(),
  );

  readonly successMessage = computed(() =>
    this.isEditMode()
      ? `Los datos de ${this.user()?.firstName ?? 'el usuario'} han sido actualizados.`
      : 'El nuevo usuario ha sido creado exitosamente.',
  );

  readonly form: FormGroup = this.createForm();

  // Last saved form data for retry
  private lastFormData: (Partial<User> & { password?: string }) | null = null;

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.isLoadingData.set(true);
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          dni: user.dni,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
        });
        this.profilePictureUrl.set(user.profilePictureUrl);
        this.form.get('email')?.disable();
        const passwordControl = this.form.get('password');
        if (passwordControl) {
          passwordControl.setValidators([]);
          passwordControl.updateValueAndValidity();
        }
        this.isLoadingData.set(false);
      }
    });

    effect(() => {
      const loading = this.isLoading();
      if (loading) {
        this.form.disable();
      } else {
        this.form.enable();
        if (this.isEditMode()) {
          this.form.get('email')?.disable();
        }
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.name(2, 30)]],
      lastName: ['', [Validators.required, CustomValidators.name(2, 30)]],
      dni: ['', [Validators.required, CustomValidators.dni()]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        this.isEditMode() ? [] : [Validators.required, CustomValidators.password(8, 50)],
      ],
      phone: ['', CustomValidators.phoneOptional(8, 15)],
      role: ['' as UserRole, [Validators.required]],
      profilePicture: [null],
    });
  }

  cancel() {
    this.closed.emit({ role: 'cancel' });
  }

  confirm(success = true) {
    this.closed.emit({ role: success ? 'confirm' : 'cancel' });
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) return;

    this.onSubmitStarted.set(true);
    this.showErrorModal.set(false);
    const formData = this.form.getRawValue();
    this.lastFormData = formData;

    try {
      if (this.isEditMode()) {
        await this.handleUpdate(formData);
      } else {
        await this.handleCreate(formData);
      }
      this.showSuccess.set(true);
    } catch (error) {
      console.error('Submit error:', error);
      this.showErrorModal.set(true);
    } finally {
      this.onSubmitStarted.set(false);
    }
  }

  async retrySubmit(): Promise<void> {
    this.showErrorModal.set(false);
    if (!this.lastFormData) return;
    this.onSubmitStarted.set(true);
    try {
      if (this.isEditMode()) {
        await this.handleUpdate(this.lastFormData);
      } else {
        await this.handleCreate(this.lastFormData);
      }
      this.showSuccess.set(true);
    } catch (error) {
      console.error('Retry error:', error);
      this.showErrorModal.set(true);
    } finally {
      this.onSubmitStarted.set(false);
    }
  }

  private async handleCreate(formData: Partial<User> & { password?: string }): Promise<void> {
    const { email, password, dni } = formData;
    if (!email || !password || !dni) throw new Error('Faltan campos obligatorios');

    const dniExists = await this.userFacade.dniExists(dni);
    if (dniExists) throw new Error('El DNI ya existe');

    const userUid = await this.authFacade.register(email, password);
    if (!userUid) {
      throw new Error(this.authFacade.error() || 'Error en el registro de autenticación');
    }

    let profilePictureUrl = this.cloudinaryService.defaultProfilePictureUrl;
    if (this.selectedFile()) {
      profilePictureUrl = await this.cloudinaryService.uploadImage(this.selectedFile()!);
    }

    const data = this.getData(formData);
    const submitData: User = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      dni: data.dni || '',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'GUEST',
      id: userUid,
      uid: userUid,
      registrationDate: new Date(),
      lastLogin: new Date(),
      lastLogout: new Date(),
      status: 'ACTIVE' as const,
      profilePictureUrl,
    };

    await this.userFacade.createUser(submitData);
  }

  private async handleUpdate(formData: Partial<User>): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;

    let profilePictureUrl = currentUser.profilePictureUrl;
    if (this.selectedFile()) {
      profilePictureUrl = await this.cloudinaryService.uploadImage(this.selectedFile()!);
    }

    await this.userFacade.updateUser({
      ...this.getData(formData),
      id: currentUser.id,
      profilePictureUrl,
    });
  }

  async executeDelete(): Promise<void> {
    const user = this.user();
    if (!user) return;
    this.confirmDelete.set(false);
    this.onSubmitStarted.set(true);
    try {
      await this.userFacade.deleteUser(user.id);
      this.confirm(true);
    } catch (err) {
      console.error('Delete error:', err);
      this.showErrorModal.set(true);
    } finally {
      this.onSubmitStarted.set(false);
    }
  }

  private getData(formData: Partial<User>): Partial<User> {
    const { firstName, lastName, dni, email, phone, role } = formData;
    return { firstName, lastName, dni, email, phone, role };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.profilePictureUrl.set(URL.createObjectURL(file));
      this.form.patchValue({ profilePicture: file });
    }
  }
}
