import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule } from '@angular/ssr/node';
import { CSP_NONCE } from '@angular/core';
import express from 'express';
import { join } from 'node:path';
import crypto from 'node:crypto';
import compression from 'compression';
import helmet from 'helmet';

const browserDistFolder = join(import.meta.dirname, '../browser');
const isProduction = process.env['NODE_ENV'] === 'production';

const app = express();

/**
 * Helmet — Security headers (enabled in production).
 * Sets X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.
 */
if (isProduction) {
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed manually via nonce below
      strictTransportSecurity: { maxAge: 63072000, includeSubDomains: true, preload: true },
    }),
  );
}

/**
 * Middleware to generate a unique CSP nonce per request and set the CSP header.
 */
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals['nonce'] = nonce;

  // Set the Content-Security-Policy header with the generated nonce
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://apis.google.com https://www.googletagmanager.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com https://www.googletagmanager.com`,
    `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://firestore.googleapis.com https://api.cloudinary.com https://www.google-analytics.com https://analytics.google.com`,
    `frame-src 'self' https://*.firebaseapp.com https://accounts.google.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  next();
});

// Compression
app.use(compression());

const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  const nonce = res.locals['nonce'] as string;
  angularApp
    .handle(req, {
      providers: [{ provide: CSP_NONCE, useValue: nonce }],
    })
    .then(async (response) => {
      if (!response) {
        return next();
      }

      const { status, headers } = response;
      const contentType = headers.get('content-type');

      // If the response is a redirect, handle it accordingly.
      if (status >= 300 && status < 400 && headers.has('location')) {
        res.redirect(status, headers.get('location') as string);
        return;
      }

      // If the response is not HTML, send it as is.
      if (contentType && !contentType.includes('text/html')) {
        const arrayBuffer = await response.arrayBuffer();
        res.set('Content-Type', contentType);
        res.send(Buffer.from(arrayBuffer));
        return;
      }

      // Intercept the response to inject the nonce into scripts that Angular might have missed
      // (e.g., event dispatch contract scripts from withEventReplay)
      const html = await response.text();
      const updatedHtml = html
        .replace(
          /<script(\s+type="text\/javascript")?\s+id="ng-event-dispatch-contract">/g,
          `<script$1 id="ng-event-dispatch-contract" nonce="${nonce}">`,
        )
        .replace(/<script>(window\.__jsaction_bootstrap)/g, `<script nonce="${nonce}">$1`);

      res.set('Content-Type', 'text/html');
      res.send(updatedHtml);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
