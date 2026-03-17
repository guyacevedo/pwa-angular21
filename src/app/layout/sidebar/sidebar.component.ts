import { ChangeDetectionStrategy, Component, inject, computed, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BrandComponent } from '../../shared/components/brand/brand.component';
import { SvgIconComponent } from '../../shared/icons/svg-icon.component';
import { IconName } from 'src/app/shared/icons/icon-paths';
import { PermissionsService } from '../../core/services/permissions.service';

interface MenuItem {
  icon: IconName;
  label: string;
  url: string;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BrandComponent, SvgIconComponent],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-slate-950">
      <!-- Header: Brand with iOS safe-area -->
      <div
        class="flex-none px-4 py-5 border-b border-slate-100 dark:border-slate-800 safe-area-top"
      >
        <app-brand [isSmall]="false"></app-brand>
      </div>

      <div class="flex-1 overflow-y-auto py-4">
        <nav class="space-y-6 px-3">
          @for (group of menu(); track group.section) {
            <div>
              <h3
                class="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5"
              >
                {{ group.section }}
              </h3>
              <ul class="space-y-0.5">
                @for (item of group.items; track item.url) {
                  <li>
                    <a
                      [routerLink]="item.url"
                      routerLinkActive="sidebar-item-active"
                      [routerLinkActiveOptions]="{ exact: false }"
                      (click)="menuClose.emit()"
                      class="relative flex items-center px-3 py-2.5 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <app-svg-icon
                        [icon]="item.icon"
                        class="mr-3 shrink-0"
                        size="20px"
                      ></app-svg-icon>
                      <span class="truncate">{{ item.label }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
        </nav>
      </div>

      <!-- Footer: Versión -->
      <div class="flex-none px-4 py-3 border-t border-slate-100 dark:border-slate-800">
        <p
          class="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest"
        >
          v0.0.0
        </p>
      </div>
    </div>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly permissions = inject(PermissionsService);
  menuClose = output<void>();

  readonly menu = computed<MenuSection[]>(() => {
    const sections: MenuSection[] = [];

    // General
    sections.push({
      section: 'General',
      items: [{ icon: 'home', label: 'Dashboard', url: '/dashboard' }],
    });

    // Comercio
    const comercioItems: MenuItem[] = [];
    if (this.permissions.canViewVentas()) {
      comercioItems.push({ icon: 'shopping_bag', label: 'Ventas', url: '/ventas' });
    }
    if (this.permissions.canViewCompras()) {
      comercioItems.push({ icon: 'scale', label: 'Compras', url: '/compras' });
    }
    if (this.permissions.canViewContactos()) {
      comercioItems.push({ icon: 'people', label: 'Contactos', url: '/contactos' });
    }
    if (comercioItems.length > 0) {
      sections.push({ section: 'Comercio', items: comercioItems });
    }

    // Inventario
    const inventarioItems: MenuItem[] = [];
    if (this.permissions.canViewInventario()) {
      inventarioItems.push({ icon: 'fish', label: 'Pescados', url: '/inventario' });
    }
    if (this.permissions.canViewInsumos()) {
      inventarioItems.push({ icon: 'cube', label: 'Insumos', url: '/insumos' });
    }
    if (this.permissions.canViewCavas()) {
      inventarioItems.push({ icon: 'snow', label: 'Cavas', url: '/cavas' });
    }
    if (inventarioItems.length > 0) {
      sections.push({ section: 'Inventario', items: inventarioItems });
    }

    // Logística
    const logisticaItems: MenuItem[] = [];
    if (this.permissions.canViewViajes()) {
      logisticaItems.push({ icon: 'localShipping', label: 'Viajes', url: '/viajes' });
    }
    if (this.permissions.canViewCamiones()) {
      logisticaItems.push({ icon: 'car', label: 'Camiones', url: '/camiones' });
    }
    if (logisticaItems.length > 0) {
      sections.push({ section: 'Logística', items: logisticaItems });
    }

    // Finanzas
    const finanzasItems: MenuItem[] = [];
    if (this.permissions.canViewPrestamos()) {
      finanzasItems.push({ icon: 'cash', label: 'Préstamos', url: '/prestamos' });
    }
    if (this.permissions.canViewNomina()) {
      finanzasItems.push({ icon: 'wallet', label: 'Nómina', url: '/nomina' });
    }
    if (this.permissions.canViewReportes()) {
      finanzasItems.push({ icon: 'report', label: 'Reportes', url: '/reportes' });
    }
    if (finanzasItems.length > 0) {
      sections.push({ section: 'Finanzas', items: finanzasItems });
    }

    // Administración
    const adminItems: MenuItem[] = [];
    if (this.permissions.canViewUsers()) {
      adminItems.push({ icon: 'people', label: 'Usuarios', url: '/users' });
    }
    if (this.permissions.canManageConfig()) {
      adminItems.push({ icon: 'card', label: 'Configuración', url: '/configuracion' });
    }
    if (adminItems.length > 0) {
      sections.push({ section: 'Administración', items: adminItems });
    }

    return sections;
  });
}
