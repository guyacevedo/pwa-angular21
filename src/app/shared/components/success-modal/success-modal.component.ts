import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { IconName } from '../../icons/icon-paths';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex flex-col items-center justify-center p-8 text-center h-full">
            <!-- Icono animado -->
            <div class="w-24 h-24 mb-6 mt-2 relative shrink-0">
              <div class="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-75"></div>
              <div class="relative flex items-center justify-center w-full h-full bg-green-500 rounded-full shadow-lg shadow-green-500/30">
                <app-svg-icon [icon]="icon()" size="60px" class="text-white"></app-svg-icon>
              </div>
            </div>

            <!-- Textos -->
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">{{ title() }}</h2>
            <p class="text-slate-600 dark:text-slate-400 mb-8 w-full leading-relaxed">
              {{ message() }}
            </p>

            <!-- Acciones Principales (Opcionales) -->
            @if (showPrintButtons()) {
              <div class="w-full space-y-3 mb-6">
                <button (click)="descargarFactura.emit()" class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer shadow-primary/20 hover:shadow-primary/40">
                  <app-svg-icon icon="download" size="20px"></app-svg-icon>
                  Descargar Factura (A4)
                </button>

                <button (click)="descargarTicket.emit()" class="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer">
                  <app-svg-icon icon="download" size="20px"></app-svg-icon>
                  Descargar Ticket (48mm)
                </button>
              </div>
            }

            @if (showPrintButtons() || showSecondaryButtons()) {
              <div class="w-full border-t border-slate-200 dark:border-slate-800 my-4"></div>
            }

            <!-- Acciones Secundarias -->
            @if (showSecondaryButtons()) {
              <div class="w-full grid gap-3 mt-2" [class.grid-cols-1]="isEditMode()" [class.grid-cols-2]="!isEditMode()">
                <button (click)="verDetalle.emit()" class="flex items-center justify-center gap-2 border-1.5 border-primary text-primary hover:bg-primary/5 font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer">
                  <app-svg-icon icon="touchEye" size="20px"></app-svg-icon>
                  Ver Detalle
                </button>

                @if (!isEditMode()) {
                  <button (click)="nuevaTransaccion.emit()" class="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer">
                    <app-svg-icon icon="add" size="20px"></app-svg-icon>
                    Nueva
                  </button>
                }
              </div>
            }

            <div class="mt-4 w-full pb-2">
              <button (click)="irAListado.emit()" class="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer">
                {{ returnToListText() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AppSuccessModalComponent {
  // Inputs
  isOpen = input.required<boolean>();
  title = input.required<string>();
  message = input.required<string>();
  icon = input<IconName>('check');
  returnToListText = input<string>('Ir al listado');
  isEditMode = input<boolean>(false);

  // Control visibility
  showPrintButtons = input<boolean>(true);
  showSecondaryButtons = input<boolean>(true);

  // Outputs
  verDetalle = output<void>();
  nuevaTransaccion = output<void>();
  descargarFactura = output<void>();
  descargarTicket = output<void>();
  irAListado = output<void>();
}
