import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebasePrestamosService } from '../../firebase-prestamos.service';
import { ContactosFacade } from '../../../contactos/contactos.facade';
import { AUTH_PROVIDER } from '../../../../core/interfaces/auth-provider.interface';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { TipoPrestamo } from '../../../../core/models/prestamo.model';

@Component({
  selector: 'app-prestamo-form',
  standalone: true,
  imports: [ReactiveFormsModule, SvgIconComponent, SelectCustomComponent, InputCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/prestamos'])" class="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Préstamos
          </button>
          <span class="text-slate-200 dark:text-slate-700">|</span>
          <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Nuevo Préstamo</h1>
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
          Registrar
        </button>
      </div>

      <div class="max-w-lg mx-auto px-4 py-6">
        <form [formGroup]="form" class="space-y-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-4">
            <!-- Tipo -->
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Tipo de préstamo</p>
              <div class="flex gap-3">
                <button type="button" (click)="form.get('tipo')!.setValue('RECIBIDO')"
                  class="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                  [class.border-primary]="form.get('tipo')!.value === 'RECIBIDO'"
                  [class.bg-primary/10]="form.get('tipo')!.value === 'RECIBIDO'"
                  [class.text-primary]="form.get('tipo')!.value === 'RECIBIDO'"
                  [class.border-slate-200]="form.get('tipo')!.value !== 'RECIBIDO'"
                  [class.text-slate-500]="form.get('tipo')!.value !== 'RECIBIDO'"
                >Recibido (proveedor)</button>
                <button type="button" (click)="form.get('tipo')!.setValue('OTORGADO')"
                  class="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                  [class.border-primary]="form.get('tipo')!.value === 'OTORGADO'"
                  [class.bg-primary/10]="form.get('tipo')!.value === 'OTORGADO'"
                  [class.text-primary]="form.get('tipo')!.value === 'OTORGADO'"
                  [class.border-slate-200]="form.get('tipo')!.value !== 'OTORGADO'"
                  [class.text-slate-500]="form.get('tipo')!.value !== 'OTORGADO'"
                >Otorgado (cliente)</button>
              </div>
              @if (form.get('tipo')!.value === 'RECIBIDO') {
                <p class="text-xs text-amber-600 mt-2">El proveedor nos presta (tiene interés)</p>
              } @else {
                <p class="text-xs text-blue-600 mt-2">Nosotros le prestamos al cliente (sin interés)</p>
              }
            </div>
            <app-select-custom
              formControlName="contactoId"
              label="Contacto"
              [options]="contactoOptions()"
              [required]="true"
            />
            <app-input-custom formControlName="montoOriginal" label="Monto ($)" type="number" [required]="true" />
            @if (form.get('tipo')!.value === 'RECIBIDO') {
              <app-input-custom formControlName="tasaInteresMensual" label="Tasa de interés mensual (%)" type="number" />
            }
            <app-input-custom formControlName="notas" label="Notas" placeholder="Condiciones, observaciones..." />
          </div>
          @if (errorMsg()) {
            <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{{ errorMsg() }}</div>
          }
        </form>
      </div>
    </div>
  `,
})
export class PrestamoFormPage implements OnInit {
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FirebasePrestamosService);
  private readonly contactosFacade = inject(ContactosFacade);
  private readonly authProvider = inject(AUTH_PROVIDER);

  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly contactoOptions = computed(() => [
    { value: '', label: 'Seleccionar contacto' },
    ...this.contactosFacade.contactos().map((c) => ({ value: c.id, label: c.nombre })),
  ]);

  readonly form = this.fb.group({
    tipo: ['RECIBIDO' as TipoPrestamo, [Validators.required]],
    contactoId: ['', [Validators.required]],
    montoOriginal: [null as number | null, [Validators.required, Validators.min(1)]],
    tasaInteresMensual: [0],
    notas: [''],
  });

  ngOnInit(): void {
    this.contactosFacade.init();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set(null);
    const v = this.form.getRawValue();
    const uid = this.authProvider.user()?.uid ?? 'sistema';

    try {
      await this.service.create({
        tipo: v.tipo as TipoPrestamo,
        contactoId: v.contactoId!,
        montoOriginal: v.montoOriginal!,
        saldoPendiente: v.montoOriginal!,
        tasaInteresMensual: v.tipo === 'OTORGADO' ? 0 : (v.tasaInteresMensual ?? 0),
        estado: 'ACTIVO',
        fechaInicio: new Date(),
        fechaUltimoMovimiento: new Date(),
        notas: v.notas || undefined,
        creadoPor: uid,
      });
      this.router.navigate(['/prestamos']);
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
