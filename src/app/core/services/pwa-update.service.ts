import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Service to handle PWA updates.
 * Listens for new versions and prompts the user to reload.
 */
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly platformId = inject(PLATFORM_ID);

  init(): void {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate.isEnabled) {
      return;
    }

    // Listen for new version available
    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        const shouldUpdate = confirm(
          'Hay una nueva versión disponible. ¿Deseas actualizar ahora?',
        );
        if (shouldUpdate) {
          document.location.reload();
        }
      });

    // Check for updates periodically (every 6 hours)
    if (typeof setInterval !== 'undefined') {
      const SIX_HOURS = 6 * 60 * 60 * 1000;
      setInterval(() => {
        this.swUpdate.checkForUpdate().catch((err) => {
          console.error('Error checking for SW update:', err);
        });
      }, SIX_HOURS);
    }
  }
}
