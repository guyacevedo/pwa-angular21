import { Injectable, PLATFORM_ID, inject, signal, effect, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private rendererFactory = inject(RendererFactory2);
  private renderer: Renderer2;
  
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
    }
    
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.applyTheme(this.isDarkMode());
      }
    });
  }

  private initTheme() {
    // Check user preference in localStorage first
    const storedPreference = localStorage.getItem('dark-mode');
    
    if (storedPreference !== null) {
      this.isDarkMode.set(storedPreference === 'true');
    } else {
      // Use matchMedia to check system preference if no previously saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode.set(prefersDark.matches);
    }

    // Listen for changes in OS level preferences
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (mediaQuery) => {
        // Only react to OS changes if the user hasn't explicitly set a preference
        if (localStorage.getItem('dark-mode') === null) {
          this.isDarkMode.set(mediaQuery.matches);
        }
    });
  }

  toggleDarkMode(isDark?: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      const newValue = isDark !== undefined ? isDark : !this.isDarkMode();
      this.isDarkMode.set(newValue);
      localStorage.setItem('dark-mode', newValue.toString());
    }
  }
  
  private applyTheme(isDark: boolean) {
    if (isDark) {
      this.renderer.addClass(this.document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(this.document.documentElement, 'dark');
    }
  }
}
