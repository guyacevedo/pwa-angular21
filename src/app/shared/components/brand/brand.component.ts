import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    @if (isSmall()) {
      <!-- Versión compacta: fila (logo + textos) -->
      <div class="flex items-center gap-1.5">
        <img
          [ngSrc]="'/logo-comercializadora-neymar.svg'"
          alt="Logo Comercializadora Neymar"
          [width]="85"
          [height]="67"
          class="object-contain h-auto w-12 sm:w-14 shrink-0"
        />
        <div class="flex flex-col justify-center min-w-0">
          <span
            class="font-display font-bold text-brand-blue dark:text-slate-200 tracking-wider uppercase leading-none text-[0.45rem] sm:text-[0.55rem] truncate"
          >
            COMERCIALIZADORA
          </span>
          <span
            class="font-display font-bold text-brand-blue dark:text-white leading-tight text-[0.9rem] sm:text-[1.1rem]"
          >
            Neymar
          </span>
        </div>
      </div>
    } @else {
      <!-- Versión completa: logo a la izquierda, textos a la derecha -->
      <div class="flex flex-col items-center w-full gap-1.5">
        <div class="flex items-center gap-2 w-full">
          <img
            [ngSrc]="'/logo-comercializadora-neymar.svg'"
            alt="Logo Comercializadora Neymar"
            [width]="85"
            [height]="67"
            priority
            class="object-contain h-auto w-14 shrink-0"
          />
          <div class="flex flex-col justify-center min-w-0">
            <span
              class="font-display font-bold text-brand-blue dark:text-slate-200 tracking-wider uppercase leading-none text-[0.5rem]"
            >
              COMERCIALIZADORA
            </span>
            <span
              class="font-display font-bold text-brand-blue dark:text-white leading-tight text-[1.5rem]"
            >
              Neymar
            </span>
            <span
              class="font-display font-semibold text-[#b45309] dark:text-[#b57909] uppercase tracking-[2px] text-[0.4rem]"
            >
              Pesca &amp; Distribución
            </span>
          </div>
        </div>
        <div class="w-full text-center">
          <hr
            class="border-0 h-px w-full bg-linear-to-r from-transparent via-brand-blue dark:via-slate-500 to-transparent"
          />
          <p class="font-body italic text-brand-blue dark:text-slate-400 text-[0.55rem] mt-1">
            Del río a su mesa, frescura que se nota.
          </p>
        </div>
      </div>
    }
  `,
})
export class BrandComponent {
  isSmall = input(false);
}
