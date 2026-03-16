import { Component, inject, effect, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { NavigationService } from './core/services/navigation.service';
import { PwaUpdateService } from './core/services/pwa-update.service';
import { ThemeService } from './core/services/theme.service';
import { AuthFacade } from './features/auth/auth.facade';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="h-dvh w-screen overflow-hidden bg-background">
      <router-outlet></router-outlet>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly pwaUpdateService = inject(PwaUpdateService);
  private readonly authFacade = inject(AuthFacade);
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.pwaUpdateService.init();
    // ThemeService se inyecta para inicializar el tema solo una vez al arrancar la app

    // Ocultar el splash HTML cuando Firebase resuelve el auth state
    effect(() => {
      if (this.authFacade.authReady()) {
        this.hideSplash();
      }
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        this.navigationService.setCurrentUrl(event.urlAfterRedirects);
        const mainScrollContainer = document.querySelector('main');
        if (mainScrollContainer) {
          mainScrollContainer.scrollTo(0, 0);
        }
      });
  }

  ngOnInit(): void {
    // Fallback: si auth ya estaba listo antes del primer render, ocultarlo
    if (this.authFacade.authReady()) {
      this.hideSplash();
    }
  }

  private hideSplash(): void {
    const el = document.getElementById('app-splash');
    if (el) {
      el.classList.add('splash-hide');
      setTimeout(() => el.remove(), 500);
    }
  }
}
