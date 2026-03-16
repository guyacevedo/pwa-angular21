import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
} from '@angular/core';
import { IDialog } from '../../services/dialog/dialog.service';
import { SvgIconComponent } from '../../icons/svg-icon.component';
import { FormsModule } from '@angular/forms';
import { ICON_PATHS } from '../../icons/icon-paths';
export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  confirmBgColor?: string;
  cancelText?: string;
  icon?: keyof typeof ICON_PATHS;
  iconColor?: string;
  iconBgColor?: string;
}
@Component({
  selector: 'app-dialog',
  imports: [SvgIconComponent, FormsModule],
  template: `
    <dialog
      #dialog
      class="z-10 rounded-2xl m-auto shadow bg-white dark:bg-slate-800 backdrop:bg-black/50 w-[calc(100%-2rem)] max-w-xl border border-slate-100 dark:border-slate-700"
    >
      <div class="p-8 text-center">
        @if (config().icon) {
          <div class="flex justify-center mb-4">
            <div
              class="rounded-full p-4"
              [class]="config().iconBgColor || 'bg-gray-100 dark:bg-slate-700'"
            >
              <app-svg-icon
                [icon]="config().icon!"
                [class]="config().iconColor || 'text-gray-600 dark:text-slate-400'"
                size="48px"
              ></app-svg-icon>
            </div>
          </div>
        }

        <div class="flex flex-col justify-center items-center mx-auto">
          <h3
            class="xs:text-3xl text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2 text-pretty text-center"
          >
            {{ config().title }}
          </h3>
          <p
            class="text-gray-600 dark:text-slate-400 mb-8 xs:text-lg text-base text-center
       text-pretty w-fit"
          >
            {{ config().message }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-3 mt-4">
          @if (config().cancelText) {
            <button
              (click)="onClose(false)"
              type="button"
              class="px-6 py-2.5 rounded-xl font-semibold text-sm md:text-base text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors w-full sm:w-auto"
            >
              {{ config().cancelText }}
            </button>
          }
          <button
            (click)="onClose(true)"
            type="button"
            class="px-6 py-2.5 rounded-xl font-semibold text-sm md:text-base text-white transition-colors w-full sm:w-auto"
            [class]="config().confirmBgColor === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'"
          >
            {{ config().confirmText || 'Aceptar' }}
          </button>
        </div>
      </div>
    </dialog>
  `,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-out {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }

      dialog {
        opacity: 0;
        will-change: opacity transform;
      }

      dialog.showing {
        animation: fade-in 0.17s linear both;
      }

      dialog.closing {
        animation: fade-out 0.08s linear both;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent
  implements AfterViewInit, OnDestroy, IDialog<DialogConfig, boolean | string>
{
  readonly config = input.required<DialogConfig>();
  readonly closed = output<boolean | string>();

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  inputValue = signal('');

  private readonly handleClose = () => this.onClose(false);

  ngAfterViewInit(): void {
    const native = this.dialog.nativeElement;

    native.showModal();
    native.addEventListener('close', this.handleClose);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    native.offsetHeight; // Force reflow for animation

    requestAnimationFrame(() => {
      native.classList.add('showing');
    });
  }

  ngOnDestroy(): void {
    this.dialog.nativeElement.removeEventListener('close', this.handleClose);
  }

  onClose(result: boolean | string): void {
    this.dialog.nativeElement.classList.add('closing');

    setTimeout(() => {
      this.dialog.nativeElement.close();
      this.closed.emit(result);
    }, 85); // -> Closing Animation Duration!
  }
}
