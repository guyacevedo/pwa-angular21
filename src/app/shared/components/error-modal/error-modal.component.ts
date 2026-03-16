import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../icons/svg-icon.component';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex flex-col items-center justify-center p-8 text-center h-full">
            <!-- Icono animado -->
            <div class="w-24 h-24 mb-6 mt-2 relative shrink-0">
              <div class="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-75"></div>
              <div class="relative flex items-center justify-center w-full h-full bg-red-500 rounded-full shadow-lg shadow-red-500/30">
                <app-svg-icon icon="close" size="60px" class="text-white"></app-svg-icon>
              </div>
            </div>

            <!-- Textos -->
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">{{ title() }}</h2>
            <p class="text-slate-600 dark:text-slate-400 mb-8 w-full">
              {{ message() }}
            </p>

            <!-- Acciones -->
            <div class="w-full space-y-3 pb-2">
              <button (click)="reintentar.emit()" class="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer shadow-red-500/20 hover:shadow-red-500/40">
                <app-svg-icon icon="refresh" size="20px"></app-svg-icon>
                Reintentar
              </button>

              <button (click)="cancelar.emit()" class="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer">
                <app-svg-icon icon="close" size="20px"></app-svg-icon>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AppErrorModalComponent {
  // Inputs
  isOpen = input.required<boolean>();
  title = input.required<string>();
  message = input.required<string>();

  // Outputs
  reintentar = output<void>();
  cancelar = output<void>();
}
