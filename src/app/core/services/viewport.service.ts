import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * iOS PWA viewport height fix
 * Continuously updates --real-vh CSS variable to match actual viewport height.
 * Solves the iOS Safari bug where h-dvh is calculated incorrectly on first load.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initViewportFix();
    }
  }

  private initViewportFix(): void {
    const updateVh = () => {
      // Calculate 1vh in pixels (window.innerHeight / 100)
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--real-vh', `${vh}px`);
    };

    // Initial update
    updateVh();

    // Update on resize
    window.addEventListener('resize', updateVh);

    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      // Delay slightly to allow iOS to update window.innerHeight
      setTimeout(updateVh, 100);
    });

    // Update on visual viewport change (keyboard opens/closes on iOS)
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', updateVh);
    }

    // Extra safety: update periodically for first 2 seconds (iOS timing issues)
    let count = 0;
    const interval = setInterval(() => {
      updateVh();
      count++;
      if (count > 20) clearInterval(interval);
    }, 100);
  }
}
