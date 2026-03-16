# Gestión Pesquera - Comercializadora Neymar (PWA)

Aplicación web progresiva (PWA) moderna construida con Angular 21, enfoque zoneless, y despliegue automático a Firebase para la gestión operativa pesquera.

## 🚀 Características

- **Angular 21** con enfoque zoneless (sin Zone.js)
- **PWA (Progressive Web App)** con soporte offline y notificaciones
- **Server-Side Rendering (SSR)** con Angular Universal (opcional para shell de PWA)
- **Tailwind CSS 4** para estilos modernos y rápidos
- **TypeScript** con configuración estricta
- **Angular Fire 20** para integración con Firebase
- **Vitest** para testing (a través de Angular CLI)
- **ESLint + Prettier** para calidad de código
- **Husky** para pre-commit hooks
- **Docker** para contenerización
- **Firebase Hosting** con despliegue automático

## 🛠️ Configuración de Desarrollo

### Prerrequisitos

- Node.js 20+
- pnpm
- Git

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd pwa-angular21

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm start
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm start              # Servidor de desarrollo
pnpm build              # Construir aplicación
pnpm watch              # Construir en modo watch

# Testing
pnpm test               # Ejecutar tests
pnpm test:watch         # Tests en modo watch

# Calidad de código
pnpm lint               # Ejecutar ESLint
```

## 🚀 Despliegue

### Docker

```bash
# Construir imagen
docker build -t pwa-angular21 .

# Ejecutar contenedor
docker run -p 4000:4000 pwa-angular21
```

### Firebase Hosting

#### Configuración Inicial

1. **Crear proyecto en Firebase:**

   ```bash
   # Instalar Firebase CLI
   npm install -g firebase-tools

   # Iniciar sesión
   firebase login

   # Crear proyecto
   firebase projects:create your-project-name
   ```

2. **Configurar Firebase en el proyecto:**
   - Editar `.firebaserc` y reemplazar `your-firebase-project-id` con tu ID real
   - El `firebase.json` ya está configurado

3. **Configurar secrets en GitHub:**
   - Ve a tu repositorio → Settings → Secrets and variables → Actions
   - Agrega estos secrets:

   **FIREBASE_SERVICE_ACCOUNT:**

   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

   **FIREBASE_PROJECT_ID:** `your-project-id`

#### Despliegue Automático

El despliegue se ejecuta automáticamente cuando:

- **CI en todas las ramas**: Tests y linting en `main` y `develop`
- **Despliegue**: Solo push a rama `main` despliega a Firebase

El workflow ejecuta:

1. ✅ Linting (ESLint)
2. ✅ Tests (Vitest)
3. ✅ Build (Angular SSR) - Solo en main
4. ✅ Deploy (Firebase Hosting) - Solo en main

## 📋 Estándares del Proyecto

Ver [`AGENTS.md`](./AGENTS.md) para reglas completas de desarrollo.

### Puntos Clave

- **Zoneless by default**: Sin Zone.js para mejor performance
- **PWA Optimized**: Experiencia de usuario fluida en cualquier dispositivo
- **Standalone components**: Arquitectura moderna de Angular
- **SSR & SEO**: Optimizado para motores de búsqueda y carga inicial rápida
- **Prettier + ESLint**: Código consistente y de calidad
- **Conventional commits**: Historial limpio de git

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

- Prohibido el Force Push en main y develop.
- Todo cambio debe pasar por un Pull Request.
- Ningún PR se aprueba si el Pipeline de Calidad (Tests + Lint) está en rojo.
- Los despliegues a producción (main) solo ocurren tras validación en la rama develop

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
