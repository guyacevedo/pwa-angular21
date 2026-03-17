import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { AUTH_PROVIDER } from '../../../../core/interfaces/auth-provider.interface';
import { NominaDiaria, LiquidacionEmpleado } from '../../../../core/models/nomina.model';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';

@Component({
  selector: 'app-nomina',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, SvgIconComponent, InputCustomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Nómina Diaria</h1>
        <button
          (click)="showForm.set(!showForm())"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold"
        >
          <app-svg-icon icon="add" size="16px"></app-svg-icon>
          Liquidar día
        </button>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <!-- Formulario de liquidación -->
        @if (showForm()) {
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Nueva liquidación</h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Datos generales del día -->
              <div class="grid grid-cols-2 gap-3">
                <app-input-custom formControlName="totalKilosProcesados" label="Total kg procesados" type="number" [required]="true" />
                <app-input-custom formControlName="numEmpleadosBodega" label="Nº empleados" type="number" [required]="true" />
              </div>

              <!-- Resumen de cálculo -->
              <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-500">Base por empleado</span>
                  <span class="font-semibold">{{ 20000 | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-500">Kg por empleado</span>
                  <span class="font-semibold">{{ kgPorEmpleado() | number:'1.1-1' }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-500">Bono producción por empleado</span>
                  <span class="font-semibold text-emerald-600">{{ bonoProduccion() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between text-xs border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
                  <span class="font-bold text-slate-700 dark:text-slate-300">Total por empleado</span>
                  <span class="font-bold text-primary">{{ totalPorEmpleado() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
              </div>

              <!-- Empleados -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Empleados</p>
                  <button type="button" (click)="addEmpleado()" class="text-xs font-semibold text-primary">+ Agregar</button>
                </div>
                <div formArrayName="empleados" class="space-y-2">
                  @for (ctrl of empleadosArray.controls; track $index) {
                    <div [formGroupName]="$index" class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                      <input
                        formControlName="nombre"
                        placeholder="Nombre empleado"
                        class="flex-1 text-sm bg-transparent border-0 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                      />
                      <input
                        formControlName="otrosBonos"
                        type="number"
                        placeholder="Bonos extra"
                        class="w-24 text-sm bg-transparent border-0 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 text-right"
                      />
                      <button type="button" (click)="removeEmpleado($index)" class="text-slate-400 hover:text-red-500">
                        <app-svg-icon icon="close" size="14px"></app-svg-icon>
                      </button>
                    </div>
                  }
                </div>
              </div>

              <app-input-custom formControlName="notas" label="Notas" placeholder="Observaciones opcionales" />

              @if (errorMsg()) {
                <div class="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">{{ errorMsg() }}</div>
              }

              <div class="flex gap-2">
                <button type="button" (click)="showForm.set(false)" class="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 rounded-xl text-sm font-bold">
                  Cancelar
                </button>
                <button type="submit" [disabled]="form.invalid || saving()" class="flex-1 py-2 bg-primary disabled:opacity-50 text-white rounded-xl text-sm font-bold">
                  @if (saving()) { Guardando... } @else { Registrar }
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Historial -->
        @if (loading()) {
          <div class="space-y-2 animate-pulse">
            @for (i of [1,2,3]; track i) {
              <div class="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (nominas().length === 0 && !showForm()) {
          <div class="text-center py-16">
            <p class="text-slate-500">No hay liquidaciones registradas</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (nomina of nominas(); track nomina.id) {
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ nomina.fecha | date:'EEEE dd/MM/yyyy':'':'es' }}</p>
                  <p class="text-sm font-bold text-primary">{{ nomina.totalNomina | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
                <div class="flex items-center gap-4 text-xs text-slate-500">
                  <span>{{ nomina.totalKilosProcesados }} kg</span>
                  <span>{{ nomina.numEmpleadosBodega }} empleados</span>
                  <span>{{ nomina.empleados.length }} liquidados</span>
                </div>
                @if (nomina.notas) {
                  <p class="text-xs text-slate-400 mt-1">{{ nomina.notas }}</p>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class NominaPage implements OnInit, OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);
  private readonly fb = inject(FormBuilder);
  private readonly authProvider = inject(AUTH_PROVIDER);

  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly nominas = signal<NominaDiaria[]>([]);
  private unsubscribe: (() => void) | null = null;

  readonly kgPorEmpleado = computed(() => {
    const kg = this.form?.get('totalKilosProcesados')?.value ?? 0;
    const n = this.form?.get('numEmpleadosBodega')?.value ?? 1;
    return n > 0 ? kg / n : 0;
  });

  readonly bonoProduccion = computed(() => Math.round(this.kgPorEmpleado() * 5000));
  readonly totalPorEmpleado = computed(() => 20000 + this.bonoProduccion());

  readonly form = this.fb.group({
    totalKilosProcesados: [null as number | null, [Validators.required, Validators.min(0)]],
    numEmpleadosBodega: [null as number | null, [Validators.required, Validators.min(1)]],
    notas: [''],
    empleados: this.fb.array([]),
  });

  get empleadosArray(): FormArray { return this.form.get('empleados') as FormArray; }

  ngOnInit(): void {
    this.loading.set(true);
    const ref = collection(this.firestore, 'nominas');
    const q = query(ref, orderBy('fecha', 'desc'), limit(30));
    this.ngZone.runOutsideAngular(() => {
      this.unsubscribe = onSnapshot(q, (snap) => {
        this.ngZone.run(() => {
          this.nominas.set(snap.docs.map((d) => ({
            ...d.data(),
            id: d.id,
            fecha: d.data()['fecha'] instanceof Timestamp ? d.data()['fecha'].toDate() : new Date(d.data()['fecha']),
            liquidadoEn: d.data()['liquidadoEn'] instanceof Timestamp ? d.data()['liquidadoEn'].toDate() : new Date(),
          } as NominaDiaria)));
          this.loading.set(false);
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }

  addEmpleado(): void {
    this.empleadosArray.push(this.fb.group({
      nombre: ['', Validators.required],
      otrosBonos: [0],
      deducciones: [0],
    }));
  }

  removeEmpleado(i: number): void {
    this.empleadosArray.removeAt(i);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set(null);
    const v = this.form.getRawValue();
    const kg = v.totalKilosProcesados ?? 0;
    const n = v.numEmpleadosBodega ?? 1;
    const bonoPorEmpleado = Math.round((kg / n) * 5000);

    const empleados: LiquidacionEmpleado[] = (v.empleados as { nombre: string; otrosBonos: number; deducciones: number }[]).map((e) => ({
      empleadoId: '',
      nombre: e.nombre,
      baseDiaria: 20000,
      kilosAsignados: kg / n,
      bonoProduccion: bonoPorEmpleado,
      otrosBonos: e.otrosBonos ?? 0,
      deducciones: e.deducciones ?? 0,
      totalDiario: 20000 + bonoPorEmpleado + (e.otrosBonos ?? 0) - (e.deducciones ?? 0),
      pagado: false,
    }));

    const totalNomina = empleados.reduce((acc, e) => acc + e.totalDiario, 0);
    const uid = this.authProvider.user()?.uid ?? 'sistema';

    try {
      await addDoc(collection(this.firestore, 'nominas'), {
        fecha: new Date(),
        totalKilosProcesados: kg,
        numEmpleadosBodega: n,
        basePorEmpleado: 20000,
        bonoPorKg: 5000,
        empleados,
        totalNomina,
        notas: v.notas || null,
        liquidadoPor: uid,
        liquidadoEn: serverTimestamp(),
      });
      this.form.reset({ totalKilosProcesados: null, numEmpleadosBodega: null, notas: '' });
      while (this.empleadosArray.length) this.empleadosArray.removeAt(0);
      this.showForm.set(false);
    } catch (e) {
      this.errorMsg.set((e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
