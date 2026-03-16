import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BrandComponent } from '../brand/brand.component';

@Component({
  selector: 'app-splash',
  imports: [BrandComponent],
  template: `
    <div
      [style.opacity]="hiding() ? '0' : '1'"
      [style.visibility]="hiding() ? 'hidden' : 'visible'"
      [style.pointer-events]="hiding() ? 'none' : 'auto'"
      style="
        position: fixed;
        inset: 0;
        z-index: 9998;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 40px;
        background: #ffffff !important;
        transition: opacity 0.45s cubic-bezier(0.4,0,0.2,1), visibility 0.45s cubic-bezier(0.4,0,0.2,1);
      "
      role="status"
      aria-label="Cargando aplicación">

      <div>
        <!-- Forzar modo claro: el splash siempre es blanco independiente del tema -->
        <div class="scheme-light">
          <app-brand [isSmall]="false" />
        </div>
      </div>

      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2.5px solid rgba(0,51,102,0.12);
        border-top-color: #003366;
        animation: splash-spin 0.75s linear infinite;
      "></div>
    </div>
  `,
  styles: `
    @keyframes splash-spin {
      to { transform: rotate(360deg); }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplashComponent {
  /** Cuando hiding=true aplica fade-out antes de que el padre lo destruya */
  hiding = input<boolean>(false);
}
