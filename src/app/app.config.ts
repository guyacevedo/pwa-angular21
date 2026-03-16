import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  ErrorHandler,
  LOCALE_ID,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { GlobalErrorHandler } from './core/services/global-error-handler.service';
import { FirebaseUserService } from './core/services/firebase-user.service';
import { FirebaseAuthService } from './core/services/firebase-auth.service';
registerLocaleData(localeEs);
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AUTH_REPOSITORY } from './core/interfaces/auth.repository';
import { USER_REPOSITORY } from './core/interfaces/user.repository';
import { AUTH_PROVIDER } from './core/interfaces/auth-provider.interface';
import { AuthFacade } from './features/auth/auth.facade';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(environment.firebase || {})),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    providePerformance(() => getPerformance()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: USER_REPOSITORY, useClass: FirebaseUserService },
    { provide: AUTH_REPOSITORY, useClass: FirebaseAuthService },
    { provide: AUTH_PROVIDER, useClass: AuthFacade },
  ],
};
