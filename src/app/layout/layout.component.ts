import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
  effect,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthFacade } from '../features/auth/auth.facade';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    @if (!authFacade.authReady() || authFacade.isLoggingOut()) {
      <div class="flex h-dvh w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div
          class="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"
        ></div>
      </div>
    } @else {
      <div class="flex h-dvh w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
        <!-- Sidebar for Desktop -->
        @if (isSplitPaneVisible()) {
          <aside
            class="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
          >
            <app-sidebar></app-sidebar>
          </aside>
        }

        <!-- Mobile Sidebar Overlay — siempre en DOM en mobile, animado con translate -->
        @if (!isSplitPaneVisible()) {
          <div
            class="fixed inset-0 z-60 flex transition-all duration-300"
            [class.pointer-events-none]="!isMenuOpen()"
            [attr.aria-hidden]="!isMenuOpen()"
          >
            <!-- Backdrop -->
            <div
              class="fixed inset-0 bg-black/50 transition-opacity duration-300 cursor-pointer"
              [class.opacity-0]="!isMenuOpen()"
              [class.opacity-100]="isMenuOpen()"
              (click)="isMenuOpen.set(false)"
              (keydown.escape)="isMenuOpen.set(false)"
              role="button"
              tabindex="0"
            ></div>
            <!-- Sidebar slide-in -->
            <aside
              class="relative flex w-64 flex-col bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 ease-in-out"
              [class.-translate-x-full]="!isMenuOpen()"
              [class.translate-x-0]="isMenuOpen()"
            >
              <app-sidebar (menuClose)="isMenuOpen.set(false)"></app-sidebar>
            </aside>
          </div>
        }

        <div class="flex flex-1 flex-col overflow-hidden">
          <app-header
            [isMenuOpen]="isMenuOpen()"
            [isSplitPaneVisible]="isSplitPaneVisible()"
            (toggleMenu)="isMenuOpen.set(!isMenuOpen())"
          ></app-header>

          <main class="flex-1 relative overflow-hidden flex flex-col">
            <div class="flex-1 overflow-y-auto" id="main-content">
              <router-outlet></router-outlet>
            </div>
          </main>

          @if (!isSplitPaneVisible()) {
            <app-footer></app-footer>
          }
        </div>
      </div>
    }
  `,
  host: {
    class: 'block h-full w-full overflow-hidden',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly authFacade = inject(AuthFacade);

  protected readonly isMenuOpen = signal(false);
  protected readonly isSplitPaneVisible = signal(false);

  constructor() {
    // Monitor auth state and redirect if user logs out
    effect(() => {
      const user = this.authFacade.user();
      // If user becomes null and we're not already authenticated, navigate to login
      if (user === null && this.authFacade.authReady()) {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      const boundCheck = this.checkScreenSize.bind(this);
      this.checkScreenSize();
      window.addEventListener('resize', boundCheck);
      // Re-check after page fully loads — fixes iOS PWA initial blank space
      window.addEventListener('load', boundCheck, { once: true });

      // Cleanup the listener when the component is destroyed
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', boundCheck);
      });
    }
  }

  private checkScreenSize() {
    const isDesktop = window.innerWidth >= 1024; // lg breakpoint in tailwind
    this.isSplitPaneVisible.set(isDesktop);
    if (isDesktop) {
      this.isMenuOpen.set(false);
    }
  }
}
