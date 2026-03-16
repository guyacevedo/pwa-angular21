import {
  Injectable,
  inject,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  ComponentRef,
  Type,
  InputSignal,
  OutputEmitterRef,
  DestroyRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface IDialog<TConfig = unknown, TResult = unknown> {
  config: InputSignal<TConfig>;
  closed: OutputEmitterRef<TResult>;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private dialogComponentRef: ComponentRef<IDialog<unknown, unknown>> | null = null;

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.destroyDialog();
        }
      });
  }

  openGeneric<T extends IDialog<TConfig, TResult>, R, TConfig = unknown, TResult = unknown>(
    component: Type<T>,
    config: TConfig,
  ): Observable<R> {
    const dialogResult$ = new Subject<R>();

    this.dialogComponentRef = createComponent(component, {
      environmentInjector: this.injector,
    }) as ComponentRef<IDialog<unknown, unknown>>;

    this.dialogComponentRef.setInput('config', config);

    const sub = this.dialogComponentRef.instance.closed.subscribe((result) => {
      dialogResult$.next(result as R);
      dialogResult$.complete();
      this.destroyDialog();
      sub.unsubscribe();
    });

    this.appRef.attachView(this.dialogComponentRef.hostView);
    document.body.appendChild(this.dialogComponentRef.location.nativeElement);

    return dialogResult$.asObservable();
  }

  private destroyDialog(): void {
    if (this.dialogComponentRef) {
      this.appRef.detachView(this.dialogComponentRef.hostView);
      this.dialogComponentRef.destroy();
      this.dialogComponentRef = null;
    }
  }
}
