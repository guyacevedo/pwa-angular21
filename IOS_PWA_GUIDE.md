# Guía de Optimización PWA para iOS

## Problemas Resueltos

### 1. Header Ocultado por Notch/Cámara Frontal

**Problema**: En iOS, el header quedaba oculto bajo la cámara frontal (notch) o Dynamic Island en iPhones modernos.

**Solución Implementada**:

- Usamos CSS `env(safe-area-inset-top)` que es un estándar web para iOS
- Agregamos clase `.safe-area-top` con `padding-top: max(0.875rem, env(safe-area-inset-top))`
- Aplicada al `<header>` del layout principal

**Por qué funciona**:

- `env(safe-area-inset-top)` retorna la distancia del notch/Dynamic Island en px
- `max()` asegura que siempre haya al menos un padding base (0.875rem ≈ 14px)
- En dispositivos sin notch, retorna 0, sin afectar el layout

**Archivos modificados**:

- `src/app/layout/header/header.component.ts` - Added `safe-area-top` class
- `src/styles.css` - Defined `.safe-area-top`, `.safe-area-bottom`, `.safe-area-left`, `.safe-area-right` utilities

### 2. Login Sin Ocupar Altura Completa

**Problema**: La página de login dejaba un espacio en blanco abajo en iOS (no ocupaba toda la pantalla).

**Solución Implementada**:

- Cambié `h-full overflow-y-auto` a `min-h-screen flex flex-col`
- El contenedor padre usa `flex-1` para expandir y ocupar todo el espacio disponible
- Removimos `overflow-y-auto` innecesario

**Por qué funciona**:

- `min-h-screen` asegura al menos 100vh de altura
- `flex flex-col` con `flex-1` en el contenedor hijo distribuye el espacio verticalmente
- Evita espacios en blanco causados por padding/margins no considerados

**Archivos modificados**:

- `src/app/features/auth/pages/login-page/login-page.component.html`

### 3. Mejoras de Presentación PWA

**Cambios en index.html**:

- Agregado `<meta name="theme-color" content="#003366">` para que el navegador use el color de marca

**Cambios en manifest.webmanifest**:

- Actualizados valores: `name`, `short_name`, `description`
- Agregado `"scope": "/"` para control de navegación en PWA
- Actualizado `theme_color` a `#003366` (color Neymar)

## Buenas Prácticas Implementadas

### 1. **Safe Area Insets Utility Classes**

```css
.safe-area-top {
  padding-top: max(0.875rem, env(safe-area-inset-top));
}
.safe-area-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
.safe-area-left {
  padding-left: max(1rem, env(safe-area-inset-left));
}
.safe-area-right {
  padding-right: max(1rem, env(safe-area-inset-right));
}
```

**Ventajas**:

- ✅ Compatible con iOS notch/Dynamic Island
- ✅ Compatible con Android cutouts
- ✅ No afecta dispositivos sin notch
- ✅ Reutilizable en cualquier componente

### 2. **Viewport Meta Tag**

```html
<meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0" />
```

**Por qué es importante**:

- `viewport-fit=cover` - Permite que el contenido se extienda bajo el notch
- Combinado con safe-area, crea comportamiento óptimo

### 3. **Full-Height Layouts**

- Usa `min-h-screen` en lugar de `h-full` cuando necesites ocupar toda la pantalla
- Combina con `flex flex-col` para distribución vertical correcta

## Recomendaciones Adicionales

### Para Componentes Futuros que Necesiten Safe Areas:

```html
<!-- Header con notch support -->
<header class="safe-area-top">...</header>

<!-- Footer con home indicator support -->
<footer class="safe-area-bottom">...</footer>
```

### Testing en iOS:

1. Agregar a home screen en Safari
2. Verificar que header no está ocultado por notch
3. Verificar que no hay espacios en blanco al final de pages

### Alternativa si `env()` no funciona (navegadores muy antiguos):

- Fallback a media queries:

```css
@supports (padding: max(0px)) {
  .safe-area-top {
    padding-top: max(0.875rem, env(safe-area-inset-top));
  }
}
```

## Referencias

- [MDN: env() CSS function](<https://developer.mozilla.org/en-US/docs/Web/CSS/env()>)
- [Apple: Notch and Dynamic Island Support](https://developer.apple.com/design/human-interface-guidelines/layouts/iphone/)
- [Web.dev: PWA best practices](https://web.dev/progressive-web-apps/)
