# Política de Seguridad

## Reportar una Vulnerabilidad

Por favor, reporta vulnerabilidades de seguridad creando un [aviso privado](https://github.com/comercializadora-neymar/pwa-angular21/security/advisories/new) o enviando un correo a <contacto@comercializadora-neymar.com>.

Nos esforzamos por responder en 7 días y te mantendremos actualizado durante la investigación y resolución.

## Versiones Soportadas

Las actualizaciones de seguridad se proporcionan para:

- Última versión mayor (v1.x)

## Política de Divulgación

Seguimos la divulgación coordinada. Las correcciones se liberan prontamente, y los avisos se publican en GitHub.

## Alcance

Esta política cubre vulnerabilidades en la aplicación Angular, la gestión de service workers (PWA) y la protección de datos operativos de la comercializadora en Firebase. Fuera de alcance: Errores generales o problemas de rendimiento.

---

## 🔒 Archivos Prohibidos en el Repositorio

NUNCA deben subirse al repositorio público:

### Configuración Local & Herramientas IA

- `.claude/` - Configuración local de Claude Code
- `.agents/` - Configuración local de agents
- `.idx/` - Configuración local de IDX
- `GEMINI.md` - Instrucciones personalizadas para IA


### Configuración Sensible

- `.env`, `.env.local`, `.env.*.local` - Variables de entorno
- `.firebaserc` - Identificadores de Firebase (contiene project IDs)
- `firebase-debug.log`, `firestore-debug.log` - Logs sensibles

### Otros

- `node_modules/`, `.angular/`, `/dist` - Generados automáticamente
- `.vscode/settings.local.json` - Configuración personal
- `pnpm-workspace.yaml.local` - Estado local

Verificar `.gitignore` para lista completa.

---

## ✅ Verificación Antes de Push

```bash
# Ver qué archivos subirás
git status

# Verificar ausencia de archivos sensibles
git ls-files | grep -iE "\.env|\.firebaserc|GEMINI|\.claude|\.agents"
# No debe devolver resultados

# Verificar estado local
git diff --name-only --cached
```

---

## 🛡️ Checklist de Seguridad

- [ ] No hay archivos `.env*` en staging
- [ ] No hay `.firebaserc`
- [ ] No hay `.claude/`, `.agents/`, `.idx/`
- [ ] No hay `node_modules/` o `/dist`
- [ ] No hay logs de debug
- [ ] `.gitignore` está actualizado

---

## Para Nuevos Desarrolladores

Después de clonar, crear `.env.local` con valores de Firebase Console:

```env
FIREBASE_API_KEY=<tu-clave>
FIREBASE_PROJECT_ID=<tu-project-id>
# ... ver src/environments/environment.template.ts
```
