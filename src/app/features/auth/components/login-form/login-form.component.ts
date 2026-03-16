import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  computed,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { AuthFacade } from '../../auth.facade';
import { CheckboxCustomComponent } from '../../../../shared/components/checkbox-custom/checkbox-custom.component';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputCustomComponent,
    SvgIconComponent,
    CheckboxCustomComponent,
  ],
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  submitted = false;

  private readonly authFacade = inject(AuthFacade);
  private readonly fb = inject(FormBuilder);
  readonly loginError: Signal<string | null> = this.authFacade.error;

  /** Se activa al submit y nunca vuelve a false (componente se destruye al navegar) */
  readonly isSubmitting = signal(false);

  /** Cargando = facade loading O ya submitido exitosamente */
  readonly isLoading = computed(() => this.authFacade.isLoading() || this.isSubmitting());
  readonly isFormDisabled = computed(() => this.isLoading());

  // Main Form
  readonly form: FormGroup;

  constructor() {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      showPassword: new FormControl(false),
    });
  }

  // Enviar formulario
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.isSubmitting.set(true);
    await this.authFacade.login(email, password);

    // Si hubo error, permitir reintentar
    if (this.authFacade.error()) {
      this.isSubmitting.set(false);
    }
    // Si login exitoso, isSubmitting permanece true hasta que el componente se destruye
  }
}
