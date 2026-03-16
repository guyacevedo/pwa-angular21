import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { UserSubmenuComponent } from '../user-submenu/user-submenu.component';
import { SvgIconComponent } from '../../shared/icons/svg-icon.component';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Usuarios',
  '/users/profile': 'Mi Perfil',
  '/configuracion': 'Configuración',
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UserSubmenuComponent, SvgIconComponent],
  template: `
    <header
      class="flex-none z-40 bg-brand-blue dark:bg-slate-950 text-white shadow-md border-b border-white/10 safe-area-top"
    >
      <div class="flex items-center justify-between px-4 h-14 gap-3">
        <!-- Izquierda: hamburger (mobile) o título de página (desktop) -->
        <div class="flex items-center gap-2 min-w-0">
          @if (!isSplitPaneVisible()) {
            <button
              type="button"
              class="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
              (click)="toggleMenu.emit()"
              [attr.aria-expanded]="isMenuOpen()"
              aria-label="Toggle navigation menu"
            >
              <app-svg-icon
                [icon]="isMenuOpen() ? 'close' : 'menu'"
                size="26px"
                class="text-white"
              ></app-svg-icon>
            </button>
          }

          @if (pageTitle()) {
            <h1 class="text-base font-semibold text-white truncate leading-none">
              {{ pageTitle() }}
            </h1>
          }
        </div>

        <!-- Derecha: user submenu -->
        <div class="flex items-center shrink-0">
          <app-user-submenu></app-user-submenu>
        </div>
      </div>
    </header>
  `,
  host: {
    class: 'block w-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  isMenuOpen = input(false);
  isSplitPaneVisible = input(false);
  toggleMenu = output<void>();

  private readonly router = inject(Router);

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e: NavigationEnd) => this.resolveTitle(e.urlAfterRedirects)),
      startWith(this.resolveTitle(this.router.url)),
    ),
    { initialValue: this.resolveTitle(this.router.url) },
  );

  private resolveTitle(url: string): string {
    const clean = url.split('?')[0];
    // Exact match first, then prefix match (more specific wins)
    if (ROUTE_TITLES[clean]) return ROUTE_TITLES[clean];
    const match = Object.keys(ROUTE_TITLES)
      .filter((k) => clean.startsWith(k))
      .sort((a, b) => b.length - a.length)[0];
    return match ? ROUTE_TITLES[match] : '';
  }
}
