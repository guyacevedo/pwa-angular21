import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactosFacade } from '../../contactos.facade';
import { AUTH_PROVIDER } from '../../../../core/interfaces/auth-provider.interface';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import { Contacto, TipoContacto, CIUDADES_DISTRIBUCION } from '../../../../core/models/contacto.model';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [ReactiveFormsModule, SvgIconComponent, InputCustomComponent, SelectCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Volver
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">
            {{ isEditMode() ? 'Editar Contacto' : 'Nuevo Contacto' }}
          </h1>
        </div>
        <button
          (click)="onSubmit()"
          [disabled]="form.invalid || saving()"
          class="flex items-center gap-1.5 px-4 py-1.5 bg-primary disabled:opacity-50 text-white rounded-full text-xs font-bold"
        >
          @if (saving()) {
            <div class="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          } @else {
            <app-svg-icon icon="check" size="14px"></app-svg-icon>
          }
          Guardar
        </button>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-6">
        <form [formGroup]="form" class="space-y-4">
          <!-- Tipo -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Tipo de Contacto</h3>
            <div class="flex gap-3">
              @for (opt of tipoOptions; track opt.value) {
                <button
                  type="button"
                  (click)="form.get('tipo')!.setValue(opt.value)"
                  class="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                  [class.border-primary]="form.get('tipo')!.value === opt.value"
                  [class.bg-primary/10]="form.get('tipo')!.value === opt.value"
                  [class.text-primary]="form.get('tipo')!.value === opt.value"
                  [class.border-slate-200]="form.get('tipo')!.value !== opt.value"
                  [class.dark:border-slate-600]="form.get('tipo')!.value !== opt.value"
                  [class.text-slate-500]="form.get('tipo')!.value !== opt.value"
                >{{ opt.label }}</button>
              }
            </div>
          </div>

          <!-- Información -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Información</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-input-custom formControlName="nombre" label="Nombre / Razón Social" placeholder="Nombre completo" [required]="true" class="sm:col-span-2" />
              <app-input-custom formControlName="telefono" label="Teléfono" placeholder="3001234567" [required]="true" />
              <app-input-custom formControlName="telefonoAlt" label="Teléfono alternativo" placeholder="3001234567" />
              <app-input-custom formControlName="email" label="Correo" placeholder="correo@empresa.com" type="email" />
              <app-input-custom formControlName="nit" label="NIT / Cédula empresa" placeholder="900123456-7" />
              <app-input-custom formControlName="cedula" label="Cédula personal" placeholder="10XXXXXXXXX" />
              <app-select-custom
                formControlName="ciudad"
                label="Ciudad"
                [options]="ciudadOptions"
                placeholder="Seleccionar ciudad"
              />
              <app-input-custom formControlName="direccion" label="Dirección" placeholder="Dirección" class="sm:col-span-2" />
              <app-input-custom formControlName="notas" label="Notas" placeholder="Observaciones adicionales" class="sm:col-span-2" />
            </div>
          </div>

          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{{ errorMsg() }}</div>
          }
        </form>
      </div>
    </div>
  `,
})
export class ContactoFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(ContactosFacade);
  private readonly authProvider = inject(AUTH_PROVIDER);

  readonly saving = this.facade.saving;
  readonly errorMsg = signal<string | null>(null);
  private editId: string | null = null;

  readonly isEditMode = computed(() => !!this.editId);

  readonly tipoOptions: { value: TipoContacto; label: string }[] = [
    { value: 'CLIENTE', label: 'Cliente' },
    { value: 'PROVEEDOR', label: 'Proveedor' },
    { value: 'AMBOS', label: 'Ambos' },
  ];

  readonly ciudadOptions = [
    { value: '', label: 'Sin especificar' },
    ...CIUDADES_DISTRIBUCION.map((c) => ({ value: c, label: c })),
  ];

  readonly form = this.fb.group({
    tipo: ['CLIENTE' as TipoContacto, [Validators.required]],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.required, Validators.minLength(7)]],
    telefonoAlt: [''],
    email: ['', [Validators.email]],
    nit: [''],
    cedula: [''],
    ciudad: [''],
    direccion: [''],
    notas: [''],
  });

  ngOnInit(): void {
    this.facade.init();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.editId = id;
      const contacto = this.facade.contactos().find((c) => c.id === id);
      if (contacto) this.patchForm(contacto);
    }
  }

  private patchForm(c: Contacto): void {
    this.form.patchValue({
      tipo: c.tipo,
      nombre: c.nombre,
      telefono: c.telefono,
      telefonoAlt: c.telefonoAlt ?? '',
      email: c.email ?? '',
      nit: c.nit ?? '',
      cedula: c.cedula ?? '',
      ciudad: c.ciudad ?? '',
      direccion: c.direccion ?? '',
      notas: c.notas ?? '',
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.errorMsg.set(null);
    const v = this.form.getRawValue();
    const uid = this.authProvider.user()?.uid ?? 'sistema';
    try {
      if (this.editId) {
        await this.facade.actualizar(this.editId, {
          tipo: v.tipo as TipoContacto,
          nombre: v.nombre!,
          telefono: v.telefono!,
          telefonoAlt: v.telefonoAlt || undefined,
          email: v.email || undefined,
          nit: v.nit || undefined,
          cedula: v.cedula || undefined,
          ciudad: v.ciudad || undefined,
          direccion: v.direccion || undefined,
          notas: v.notas || undefined,
        });
        this.router.navigate(['/contactos', this.editId]);
      } else {
        const id = await this.facade.crear({
          tipo: v.tipo as TipoContacto,
          nombre: v.nombre!,
          telefono: v.telefono!,
          telefonoAlt: v.telefonoAlt || undefined,
          email: v.email || undefined,
          nit: v.nit || undefined,
          cedula: v.cedula || undefined,
          ciudad: v.ciudad || undefined,
          direccion: v.direccion || undefined,
          notas: v.notas || undefined,
          saldoCartera: 0,
          cavasPendientes: 0,
          canastillasPendientes: 0,
          prestamoPendiente: 0,
          activo: true,
          creadoPor: uid,
        });
        this.router.navigate(['/contactos', id]);
      }
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    }
  }

  goBack(): void {
    this.router.navigate([this.editId ? ['/contactos', this.editId] : ['/contactos']]);
  }
}
