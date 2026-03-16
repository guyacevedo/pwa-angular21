import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgIconComponent } from '../../shared/icons/svg-icon.component';
import { IconName } from 'src/app/shared/icons/icon-paths';
import { PermissionsService } from 'src/app/core/services/permissions.service';

interface TabItem {
  tab: string;
  icon: IconName;
  label: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SvgIconComponent],
  template: `
    <nav class="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div class="flex items-center justify-around h-14">
        @for (tab of visibleTabs(); track tab.tab) {
          <a
            [routerLink]="tab.route"
            routerLinkActive="text-blue-600 dark:text-blue-400 border-t-[3px] border-blue-600 dark:border-blue-400"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex flex-col items-center justify-center flex-1 h-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-t-[3px] border-transparent"
          >
            <app-svg-icon [icon]="tab.icon" size="22px" class="mb-0.5"></app-svg-icon>
            <span class="text-[10px] font-semibold uppercase tracking-wide">{{ tab.label }}</span>
          </a>
        }
      </div>
    </nav>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  private permissions = inject(PermissionsService);

  private readonly allTabs: TabItem[] = [
    { tab: 'dashboard', icon: 'home', label: 'Inicio', route: '/dashboard' },
    { tab: 'usuarios', icon: 'people', label: 'Usuarios', route: '/users', adminOnly: true },
    { tab: 'configuracion', icon: 'settings', label: 'Config.', route: '/configuracion' },
    { tab: 'perfil', icon: 'user', label: 'Perfil', route: '/users/profile' },
  ];

  readonly visibleTabs = computed(() =>
    this.allTabs.filter(tab => {
      if (tab.tab === 'usuarios') return this.permissions.canViewUsers();
      return true;
    })
  );
}
