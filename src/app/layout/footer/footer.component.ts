import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TabsComponent],
  template: `
    <app-tabs></app-tabs>
  `,
  styles: [],
  host: {
    class: 'flex-none z-40',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent { }
