import { mergeApplicationConfig, ApplicationConfig, CSP_NONCE } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: CSP_NONCE,
      useFactory: () => {
        // This is a placeholder that Angular will look for during rendering.
        // The actual value will be injected per-request in server.ts
        return '';
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
