import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICON_PATHS, VIEWBOXES } from './icon-paths';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svgPath) {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.height]="size()"
        [attr.width]="size()"
        [attr.fill]="color()"
        [attr.viewBox]="viewBoxValue"
        [attr.aria-label]="effectiveAriaLabel()"
        role="img"
      >
        <path [attr.d]="svgPath" />
      </svg>
    }
  `,
})
export class SvgIconComponent {
  public readonly icon = input<keyof typeof ICON_PATHS>('error');
  public readonly viewBox = input<keyof typeof VIEWBOXES>('googleMaterial');
  public readonly size = input<string>('24px');
  public readonly color = input<string>('currentColor');
  public readonly ariaLabel = input<string>('');

  public readonly effectiveAriaLabel = computed(() => this.ariaLabel() || this.icon());

  get svgPath(): string | undefined {
    return ICON_PATHS[this.icon()];
  }

  get viewBoxValue(): string | undefined {
    return VIEWBOXES[this.viewBox()];
  }
}
