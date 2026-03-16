import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
import { BrandComponent } from '../../../../shared/components/brand/brand.component';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { AuthFacade } from '../../auth.facade';

@Component({
  selector: 'app-login-page',
  imports: [LoginFormComponent, BrandComponent, SvgIconComponent],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  readonly currentYear = new Date().getFullYear();

  private readonly authFacade = inject(AuthFacade);

  constructor() {
    // Al autenticar exitosamente, mostrar el splash HTML mientras navega
    effect(() => {
      if (this.authFacade.isAuthenticated()) {
        const el = document.getElementById('app-splash');
        if (el) {
          el.classList.remove('splash-hide');
        }
      }
    });
  }
}
