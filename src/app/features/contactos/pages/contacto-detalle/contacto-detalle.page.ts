import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ContactosFacade } from '../../contactos.facade';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TIPO_CONTACTO_LABELS } from '../../../../core/models/contacto.model';

@Component({
  selector: 'app-contacto-detalle',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SvgIconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/contactos'])" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm font-medium">
            <app-svg-icon icon="arrowLeft" size="20px"></app-svg-icon>
            Contactos
          </button>
        </div>
        @if (permissions.canManageContactos() && contacto()) {
          <a [routerLink]="['/contactos', contacto()!.id, 'editar']" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
            <app-svg-icon icon="edit" size="14px"></app-svg-icon>
            Editar
          </a>
        }
      </div>

      @if (facade.loading()) {
        <div class="flex items-center justify-center h-40">
          <div class="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (!contacto()) {
        <div class="text-center py-16 px-4">
          <p class="text-slate-500">Contacto no encontrado</p>
          <a routerLink="/contactos" class="mt-3 inline-block text-primary text-sm font-semibold">Volver a contactos</a>
        </div>
      } @else {
        <div class="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <!-- Perfil -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div class="size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-primary font-bold text-2xl">{{ contacto()!.nombre.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ contacto()!.nombre }}</h2>
              <app-status-badge
                [text]="tipoLabel()"
                [type]="contacto()!.tipo === 'CLIENTE' ? 'primary' : contacto()!.tipo === 'PROVEEDOR' ? 'warning' : 'success'"
                size="md"
              />
            </div>
          </div>

          <!-- Datos -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-slate-400">Teléfono</p>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ contacto()!.telefono }}</p>
              </div>
              @if (contacto()!.telefonoAlt) {
                <div>
                  <p class="text-xs text-slate-400">Tel. alternativo</p>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ contacto()!.telefonoAlt }}</p>
                </div>
              }
              @if (contacto()!.email) {
                <div>
                  <p class="text-xs text-slate-400">Correo</p>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ contacto()!.email }}</p>
                </div>
              }
              @if (contacto()!.ciudad) {
                <div>
                  <p class="text-xs text-slate-400">Ciudad</p>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ contacto()!.ciudad }}</p>
                </div>
              }
              @if (contacto()!.nit) {
                <div>
                  <p class="text-xs text-slate-400">NIT</p>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ contacto()!.nit }}</p>
                </div>
              }
              @if (contacto()!.cedula) {
                <div>
                  <p class="text-xs text-slate-400">Cédula</p>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ contacto()!.cedula }}</p>
                </div>
              }
              @if (contacto()!.direccion) {
                <div class="col-span-2">
                  <p class="text-xs text-slate-400">Dirección</p>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ contacto()!.direccion }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Resumen financiero -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <p class="text-xs text-slate-400 mb-1">Saldo cartera</p>
              <p class="text-lg font-bold" [class.text-red-500]="contacto()!.saldoCartera > 0" [class.text-emerald-500]="contacto()!.saldoCartera <= 0">
                {{ contacto()!.saldoCartera | currency:'COP':'symbol-narrow':'1.0-0' }}
              </p>
              <p class="text-xs text-slate-400 mt-1">{{ contacto()!.saldoCartera > 0 ? 'Debe' : contacto()!.saldoCartera < 0 ? 'A favor' : 'Al día' }}</p>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <p class="text-xs text-slate-400 mb-1">Cavas pendientes</p>
              <p class="text-lg font-bold" [class.text-amber-500]="contacto()!.cavasPendientes > 0" [class.text-slate-700]="contacto()!.cavasPendientes === 0">
                {{ contacto()!.cavasPendientes }}
              </p>
              <p class="text-xs text-slate-400 mt-1">por devolver</p>
            </div>
            @if (contacto()!.prestamoPendiente > 0) {
              <div class="col-span-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
                <p class="text-xs text-amber-600 dark:text-amber-400 mb-1">Préstamo pendiente</p>
                <p class="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {{ contacto()!.prestamoPendiente | currency:'COP':'symbol-narrow':'1.0-0' }}
                </p>
              </div>
            }
          </div>

          @if (contacto()!.notas) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notas</h3>
              <p class="text-sm text-slate-600 dark:text-slate-300">{{ contacto()!.notas }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ContactoDetallePage implements OnInit {
  readonly facade = inject(ContactosFacade);
  readonly permissions = inject(PermissionsService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly id = signal<string>('');

  readonly contacto = computed(() =>
    this.facade.contactos().find((c) => c.id === this.id()),
  );

  readonly tipoLabel = computed(() =>
    this.contacto() ? TIPO_CONTACTO_LABELS[this.contacto()!.tipo] : '',
  );

  ngOnInit(): void {
    this.facade.init();
    this.id.set(this.route.snapshot.paramMap.get('id') ?? '');
  }
}
