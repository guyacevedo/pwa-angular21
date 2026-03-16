import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { SvgIconComponent } from "../../icons/svg-icon.component";
import { IconName } from "../../icons/icon-paths";

export interface MenuOption {
  icon: IconName;
  label: string;
  action: () => void;
  disabled?: boolean;
  color?: 'emerald' | 'red' | 'blue' | 'orange' | 'amber' | 'default' | 'green';
  separator?: boolean;
}

@Component({
  selector: 'app-menu-options',
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, OverlayModule, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Trigger button -->
    <button
      ngMenuTrigger
      #origin
      #trigger="ngMenuTrigger"
      [menu]="actionsMenu()"
      class="flex items-center justify-center rounded-sm! text-slate-700 dark:text-slate-300
             hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600
             transition-colors bg-slate-300 dark:bg-slate-700 h-6 w-22 gap-1"
      [attr.aria-label]="'Opciones'"
      aria-hidden="false"
    >
      <app-svg-icon icon="menuOpen" size="16px"></app-svg-icon>
      <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">Opciones</span>
    </button>

    <!-- Menu overlay -->
    <ng-template
      [cdkConnectedOverlayOpen]="trigger.expanded()"
      [cdkConnectedOverlay]="{ origin, usePopover: 'inline' }"
      [cdkConnectedOverlayPositions]="[
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
      ]"
      cdkAttachPopoverAsChild
    >
      <!-- Backdrop to close on outside click -->
      <div
        [class.hidden]="!trigger.expanded()"
        class="fixed inset-0 z-40 bg-transparent"
        (click)="closeMenu($event)"
        (keydown.escape)="closeMenu($event)"
        tabindex="-1"
        aria-hidden="true"
      ></div>

      <!-- Menu panel -->
      <div
        ngMenu
        #actionsMenu="ngMenu"
        [class.hidden]="!trigger.expanded()"
        class="relative z-50 min-w-[200px] rounded-xl border border-slate-200 dark:border-slate-700
               bg-white dark:bg-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-slate-900/40
               p-1.5 overflow-hidden"
      >
        <ng-template ngMenuContent>
          @for (option of options(); track option.label) {
            @if (option.separator) {
              <div
                role="separator"
                aria-orientation="horizontal"
                class="border-t border-slate-100 dark:border-slate-700 my-1 opacity-70"
              ></div>
            }
            <div
              ngMenuItem
              [value]="option.label"
              [disabled]="option.disabled ?? false"
              (click)="handleOptionClick(option)"
              (keydown.enter)="handleOptionClick(option)"
              (keydown.space)="handleOptionClick(option)"
              tabindex="0"
              aria-label="option.label"
              aria-hidden="false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm
                     transition-colors select-none outline-none
                     aria-disabled:opacity-40 aria-disabled:cursor-default
                     data-[active=true]:bg-slate-50 dark:data-[active=true]:bg-slate-700/60
                     focus:bg-slate-50 dark:focus:bg-slate-700/60"
            >
              <!-- Icon -->
              <app-svg-icon [icon]="option.icon" size="20px"></app-svg-icon>

              <!-- Label -->
              <span
                class="flex-1 font-medium text-slate-700 dark:text-slate-200"
              >{{ option.label }}</span>
            </div>
          }
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: `
    @import url('https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined');

    :host {
      display: contents;
    }

    [ngMenuTrigger]:focus-visible {
      outline: 2px solid rgb(14 165 233);
      outline-offset: 2px;
    }
  `,
})
export class MenuOptionsComponent {
  options = input<MenuOption[]>([]);

  actionsMenu = viewChild<Menu<string>>('actionsMenu');

  private isOpen = signal(false);

  handleOptionClick(option: MenuOption): void {
    if (option.disabled) return;
    option.action();
    this.closeMenuPanel();
  }

  closeMenu(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeMenuPanel();
  }

  private closeMenuPanel(): void {
    const menu = this.actionsMenu();
    if (menu) {
      // The trigger will close via the backdrop click on its own,
      // but we force close by blurring focus to trigger aria state update
    }
  }

  getIconColor(color?: MenuOption['color']): string {
    const colorMap: Record<NonNullable<MenuOption['color']>, string> = {
      emerald: 'text-emerald-600 dark:text-emerald-400',
      red: 'text-red-600 dark:text-red-400',
      blue: 'text-blue-600 dark:text-blue-400',
      orange: 'text-orange-600 dark:text-orange-400',
      amber: 'text-amber-600 dark:text-amber-400',
      default: 'text-slate-500 dark:text-slate-400',
      green: 'text-green-600 dark:text-green-400',
    };
    return colorMap[color ?? 'default'];
  }
}
