# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PWA Angular 21** - A modern progressive web app built with Angular 21, featuring zoneless architecture, Firebase integration, PWA offline support, push notifications, and a permissions-based access control system. Base template for operational management applications.

**Key Stack:**

- Angular 21 (zoneless, no Zone.js)
- Tailwind CSS 4
- Firebase (Auth, Realtime Database/Firestore)
- TypeScript (strict mode)
- Vitest for unit testing
- ESLint + Prettier for code quality
- Standalone components

## Common Development Commands

```bash
# Development
pnpm start              # Run dev server (generates SW on-the-fly)
pnpm start:host         # Dev server accessible on network (0.0.0.0)

# Building
pnpm build              # Production build (triggers SW generation)
pnpm watch              # Incremental build with watch mode

# Testing & Quality
pnpm test               # Run all tests once
pnpm test:watch         # Run tests in watch mode
pnpm lint               # Run ESLint on src/**/*.ts and src/**/*.html

# Production
pnpm serve:ssr:pwa-angular21  # Run production SSR app locally (port 4000)
```

**Single Test Files:**

```bash
pnpm ng test -- src/app/core/services/auth.service.spec.ts
```

## Architecture Overview

### Core Directory Structure

```
src/app/
├── core/                    # Shared business logic & infrastructure
│   ├── facades/             # Simplified APIs for complex operations (permissions)
│   ├── services/            # Firebase, notifications, auth, theme, etc.
│   ├── guards/              # Route guards (auth-based access control)
│   ├── interfaces/          # TypeScript interfaces & contracts
│   ├── models/              # Data models
│   ├── types/               # Type definitions
│   ├── utils/               # Utility functions
│   └── validators/          # Form validators
├── features/                # Feature modules (lazy-loaded)
│   ├── auth/                # Authentication flow (login, logout)
│   ├── dashboard/           # Dashboard & home page
│   ├── users/               # User management
│   └── configuracion/       # App configuration
├── layout/                  # Shared layout components
│   ├── header/              # Top navigation bar
│   ├── sidebar/             # Side navigation (collapsible)
│   ├── tabs/                # Mobile tab navigation
│   ├── footer/              # Footer
│   └── user-submenu/        # User profile dropdown
├── shared/                  # Reusable components & utilities
│   ├── components/          # Standalone UI components
│   ├── directives/          # Custom directives
│   ├── icons/               # SVG icon components
│   ├── pipes/               # Custom pipes
│   └── services/            # Non-core shared services
└── app.ts                   # Root component with global setup
```

### Key Architectural Patterns

**1. Facade Pattern**

- `PermissionsFacade` simplifies complex permission logic
- Located in `core/facades/`
- Used by components to check permissions without direct service access

**2. Service-Oriented Core**

- `FirebaseAuthService`: Authentication, login/logout, session management
- `FirebaseUserService`: User profile & data synchronization
- `PermissionsService`: Realtime permissions from Firestore with `onSnapshot` listeners
- `PwaUpdateService`: Service Worker update detection
- `ThemeService`: Light/dark mode state (initializes once per app)
- `FcmService`: Firebase Cloud Messaging for push notifications
- `NotificationService`: Toast/notification UI layer

**3. Guards & Route Protection**

- `AuthGuard` (`core/guards/auth.guard`): Protects routes requiring authentication
- Guards check dynamic permissions from Firestore, not just roles
- Three roles: ADMIN (full access), OPERATOR (operational), GUEST (read-only)

**4. Zoneless & Signals**

- No Zone.js dependency
- Uses Angular Signals for reactive state (`authFacade.authReady()`, `.user()`)
- Components use `computed()` and `effect()` for reactivity
- `ChangeDetectionStrategy.OnPush` on all components

**5. Lazy Loading & Code Splitting**

- Feature routes load via dynamic imports: `loadChildren: () => import(...)`
- Each feature (dashboard, users, etc.) is a lazy-loaded module
- Root layout (`LayoutComponent`) wraps authenticated routes

### Authentication Flow

1. App starts → `App` component initializes
2. `AuthFacade.authReady()` signal waits for Firebase auth state
3. If authenticated, splash screen hides; layout+router-outlet show
4. If not authenticated, redirects to `/auth/login`
5. Session persists via sessionStorage (isolated per tab for PWA multi-tab support)

### Permissions & Access Control

- Real-time sync from Firestore via `PermissionsService.onSnapshot()`
- Routes guarded by `authGuard`, which checks dynamic permissions
- Changes reflect immediately (no page reload needed)
- Three-tier system: ADMIN → OPERATOR → GUEST

### Firebase Integration

- **Authentication**: Email/password via `FirebaseAuthService`
- **Data**: Firestore for permissions, user profiles, business data
- **Push Notifications**: FCM via `FcmService`
- **Service Worker**: Registers manually in `app.ts` (not auto-generated)

## Code Quality & Standards

### ESLint Rules

- **Component selectors**: `app` prefix, kebab-case (e.g., `<app-navbar>`)
- **Directive selectors**: `app` prefix, camelCase (e.g., `appClickOutside`)
- **Strict rules**: Recommended TypeScript ESLint + Angular ESLint configs
- See `eslint.config.js` for full config

### Prettier Configuration

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "files": "*.html" → parser: "angular"
}
```

### Pre-Commit Hooks (Husky)

- `*.ts` files: ESLint fix + Prettier format
- `*.{html,scss,json,md}` files: Prettier format only
- Configured in `package.json` under `lint-staged`

### TypeScript Configuration

- `strictNullChecks: true`, `strict: true`
- Exclude `**/*.spec.ts` from app build
- SSR support via `tsconfig.server.json`

## Testing

- **Framework**: Vitest (via Angular CLI)
- **Setup**: `src/test-setup.ts` initializes Vitest
- **Target**: Unit tests for services, guards, pipes, utility functions
- **Run**: `pnpm test` or `pnpm test:watch`
- **Single file**: `pnpm ng test -- src/app/path/to/file.spec.ts`

## Important Project Notes

### PWA & Mobile-Specific Issues

- iOS notch/Dynamic Island: Use `safe-area-inset-*` CSS variables
- Full-height layouts: Use `min-h-dvh` (dynamic viewport height) instead of `100vh`
- Tabs component: Avoid bottom padding in favor of `position-fixed` footer
- Multi-session isolation: Uses `sessionStorage` per tab (not localStorage)
- See `IOS_PWA_GUIDE.md` for complete iOS PWA implementation details

### Performance Optimizations

- Lazy loading features reduces initial bundle
- Service Worker caching for offline
- Signals/OnPush detection = minimal change detection
- ~1000ms improvement in recent app load time optimization
- See `PERFORMANCE_OPTIMIZATIONS.md` for details

### Git & Deployment

- **Branches**: `main` (production), `develop` (staging)
- **Policy**: No force push on `main` or `develop`; all changes via PR
- **CI**: Tests + linting on all branches; build+deploy only on `main`
- **Deployment**: Firebase Hosting via GitHub Actions
- **Secrets**: Firebase service account key stored in GitHub Actions
- See `GIT_SECURITY_SETUP.md` and `SECURITY.md` for full guidelines

### Environment Configuration

- `src/environments/environment.ts`: Development Firebase config
- `src/environments/environment.prod.ts`: Production Firebase config
- Loaded conditionally via `fileReplacements` in `angular.json`

## Recent Fixes & Improvements

- **iOS blank space fix**: Removed `safe-area-inset-bottom` padding from tabs (2026-03-16)
- **Multi-session fix**: Session isolation using `sessionStorage` for PWA cross-tab (2026-03-16)
- **Performance**: ~1000ms load speed improvement (2026-03-16)
- **Refactoring**: Completed FASE 1 + FASE 2 (15 tasks: memory leaks, facades, type safety, multi-business architecture)
- **Lint**: All 6 ESLint violations resolved

## Key Files to Know

| File                                             | Purpose                                                    |
| ------------------------------------------------ | ---------------------------------------------------------- |
| `src/app/app.ts`                                 | Root component; initializes PWA, FCM, theme, splash screen |
| `src/app/app.routes.ts`                          | Main router config with lazy-loaded features               |
| `src/app/features/auth/auth.facade.ts`           | Auth state & logic (signals: `authReady()`, `user()`)      |
| `src/app/core/services/firebase-auth.service.ts` | Firebase auth wrapper (login, logout, session)             |
| `src/app/core/services/permissions.service.ts`   | Realtime Firestore permissions sync                        |
| `src/app/core/facades/permissions.facade.ts`     | Simplified permissions API for components                  |
| `src/app/core/guards/auth.guard.ts`              | Route protection based on dynamic permissions              |
| `src/app/layout/layout.component.ts`             | Main layout (header, sidebar, outlet, tabs)                |
| `angular.json`                                   | Build config; PWA/SSR/dev settings                         |
| `ngsw-config.json`                               | Service Worker caching strategy                            |
| `eslint.config.js`                               | ESLint rules & recommendations                             |
| `tsconfig.app.json`                              | App-specific TypeScript config (excludes `*.spec.ts`)      |

## Common Patterns & Anti-Patterns

✅ **Do:**

- Use Signals (`signal()`, `computed()`) for reactive state
- Use Facades to abstract complex operations
- Use `ChangeDetectionStrategy.OnPush` everywhere
- Use standalone components & lazy loading
- Guard routes with permission checks
- Use `takeUntilDestroyed()` for manual subscription cleanup

❌ **Don't:**

- Use Zone.js workarounds (not needed, app is zoneless)
- Use `OnDestroy` lifecycle; prefer `DestroyRef` with `takeUntilDestroyed()`
- Force sync localStorage/sessionStorage reads in components (can block rendering)
- Forget to configure Firestore indexes for queries on multiple fields
- Commit sensitive data (Firebase keys, auth tokens) to git
- Use `// removed` comments or renamed unused variables; delete unused code

## Debugging Tips

- **Auth not ready?**: Check Firebase config in `environments/`; verify user is logged in
- **Permissions not updating?**: Check Firestore `onSnapshot()` listener in `PermissionsService`; verify Firestore security rules
- **PWA offline fails?**: Check Service Worker registration in browser DevTools; verify `ngsw-config.json` caching rules
- **Build errors on `pnpm build`?**: Check if `scripts/generate-sw.js` runs successfully; inspect `prebuild` hook
- **Tests fail?**: Ensure `test-setup.ts` is loaded; check Vitest config in `angular.json`
- **Layout issues on iOS?**: Check safe-area CSS; test with `min-h-dvh` instead of `100vh`

## Memory/Context Files

- **PERMISOS_ANALISIS.md**: Complete permissions system analysis
- **ANALISIS_REFACTORIZACION.md**: Architecture & refactoring strategy
- **REFACTORIZACION_COMPLETADA.md**: Summary of completed refactoring (FASE 1 + FASE 2)
- **multi_session_fix.md**: Session isolation implementation
- **performance_optimizations.md**: Load speed improvements
- **ios_blank_space_resolved.md**: iOS PWA blank space fix details
- **IOS_PWA_GUIDE.md**: Full iOS PWA implementation & testing
