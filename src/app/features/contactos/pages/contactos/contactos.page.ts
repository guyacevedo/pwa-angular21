import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactosFacade } from '../../contactos.facade';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Contacto, TIPO_CONTACTO_LABELS } from '../../../../core/models/contacto.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [RouterLink, FormsModule, SvgIconComponent, StatusBadgeComponent, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-20">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
        <h1 class="text-sm font-bold text-slate-800 dark:text-slate-100">Contactos</h1>
        @if (permissions.canManageContactos()) {
          <a
            routerLink="nuevo"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold"
          >
            <app-svg-icon icon="add" size="16px"></app-svg-icon>
            Nuevo
          </a>
        }
      </div>

      <!-- Search & Filters -->
      <div class="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-2">
        <div class="flex-1 relative">
          <app-svg-icon icon="search" size="16px" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></app-svg-icon>
          <input
            type="search"
            [(ngModel)]="searchText"
            (ngModelChange)="onSearch($event)"
            placeholder="Buscar por nombre, teléfono, NIT..."
            class="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div class="flex gap-1">
          @for (f of filtros; track f.value) {
            <button
              (click)="filtroActivo.set(f.value)"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              [class.bg-primary]="filtroActivo() === f.value"
              [class.text-white]="filtroActivo() === f.value"
              [class.bg-slate-100]="filtroActivo() !== f.value"
              [class.dark:bg-slate-800]="filtroActivo() !== f.value"
              [class.text-slate-600]="filtroActivo() !== f.value"
            >{{ f.label }}</button>
          }
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-4xl mx-auto px-4 py-4">
        @if (facade.loading()) {
          <div class="space-y-3 animate-pulse">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="h-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"></div>
            }
          </div>
        } @else if (contactosFiltrados().length === 0) {
          <div class="text-center py-16">
            <app-svg-icon icon="people" size="48px" class="text-slate-300 dark:text-slate-600 mx-auto mb-3"></app-svg-icon>
            <p class="text-slate-500 dark:text-slate-400 font-medium">
              {{ searchText ? 'Sin resultados para "' + searchText + '"' : 'No hay contactos registrados' }}
            </p>
            @if (!searchText && permissions.canManageContactos()) {
              <a routerLink="nuevo" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold">
                <app-svg-icon icon="add" size="16px"></app-svg-icon>
                Agregar primer contacto
              </a>
            }
          </div>
        } @else {
          <div class="space-y-2">
            @for (c of contactosFiltrados(); track c.id) {
              <a
                [routerLink]="[c.id]"
                class="flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/30 transition-colors"
              >
                <!-- Avatar inicial -->
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span class="text-primary font-bold text-lg">{{ c.nombre.charAt(0).toUpperCase() }}</span>
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{{ c.nombre }}</p>
                    <app-status-badge
                      [text]="tipoLabel(c)"
                      [type]="c.tipo === 'CLIENTE' ? 'primary' : c.tipo === 'PROVEEDOR' ? 'warning' : 'success'"
                      size="sm"
                    />
                  </div>
                  <p class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ c.telefono }}{{ c.ciudad ? ' · ' + c.ciudad : '' }}</p>
                </div>
                <!-- Saldo cartera -->
                @if (c.saldoCartera !== 0) {
                  <div class="text-right shrink-0">
                    <p class="text-xs text-slate-400 dark:text-slate-500">Saldo</p>
                    <p class="text-sm font-bold" [class.text-red-500]="c.saldoCartera > 0" [class.text-emerald-500]="c.saldoCartera < 0">
                      {{ c.saldoCartera | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </p>
                  </div>
                }
                <app-svg-icon icon="arrowRight" size="16px" class="text-slate-300 dark:text-slate-600 shrink-0"></app-svg-icon>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ContactosPage implements OnInit, OnDestroy {
  readonly facade = inject(ContactosFacade);
  readonly permissions = inject(PermissionsService);

  searchText = '';
  readonly filtroActivo = signal<'TODOS' | 'CLIENTE' | 'PROVEEDOR' | 'AMBOS'>('TODOS');

  readonly filtros = [
    { value: 'TODOS' as const,     label: 'Todos' },
    { value: 'CLIENTE' as const,   label: 'Clientes' },
    { value: 'PROVEEDOR' as const, label: 'Proveedores' },
  ];

  private readonly _search = signal('');

  readonly contactosFiltrados = computed(() => {
    let list = this.facade.contactos();
    const filtro = this.filtroActivo();
    if (filtro !== 'TODOS') {
      list = list.filter((c) => c.tipo === filtro || c.tipo === 'AMBOS');
    }
    const q = this._search().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.telefono.includes(q) ||
          (c.nit ?? '').includes(q) ||
          (c.cedula ?? '').includes(q),
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.facade.init();
  }

  ngOnDestroy(): void {
    this.facade.destroy();
  }

  onSearch(text: string): void {
    this._search.set(text);
  }

  tipoLabel(c: Contacto): string {
    return TIPO_CONTACTO_LABELS[c.tipo];
  }
}
