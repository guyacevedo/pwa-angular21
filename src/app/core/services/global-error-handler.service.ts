import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly injector = inject(Injector);

    handleError(error: unknown): void {
        // Loguear error a la consola para debug
        console.error('An error occurred:', error);

        // Aquí se podría integrar un servicio de monitoreo como Sentry o Firebase Crashlytics
        // const analytics = this.injector.get(Analytics);
        // logEvent(analytics, 'exception', { description: error });
    }
}
