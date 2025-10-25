# 🖥️ Generar App de Escritorio para Linux

Esta guía te ayudará a crear una aplicación de escritorio nativa para Linux (especialmente ArchLinux) usando [Pake](https://github.com/tw93/Pake).

## 🎯 ¿Qué es Pake?

Pake convierte aplicaciones web en aplicaciones de escritorio nativas usando **Rust + Tauri**, resultando en apps:
- 📦 **20x más pequeñas** que Electron (~5MB vs ~150MB)
- 🚀 **Más rápidas** (usa WebView nativo del sistema)
- 🎨 **Nativas** con integración al SO (bandeja, notificaciones, etc.)
- 🌍 **Multi-plataforma** (Linux, Windows, macOS)

## 📋 Requisitos Previos

### 1. Dependencias del Sistema (ArchLinux)

```bash
# Instalar dependencias de Tauri
sudo pacman -S webkit2gtk base-devel curl wget file openssl gtk3 libayatana-appindicator librsvg

# Verificar que Rust esté instalado (ya lo tienes ✅)
rustc --version
# rustc 1.86.0 (05f9846f8 2025-03-31)
```

### 2. Instalar Pake CLI

```bash
# Opción 1: Con pnpm (recomendado)
pnpm install -g pake-cli

# Opción 2: Con npm
npm install -g pake-cli

# Verificar instalación
pake --version
```

## 🚀 Uso Rápido

### Script Automático (Recomendado)

Hemos creado un script que te guía en todo el proceso:

```bash
./build-desktop.sh        # AppImage (recomendado para Arch)
./build-desktop.sh deb    # Paquete DEB
```

El script te preguntará cómo quieres empaquetar:

1. **Servidor local (http://localhost:3000)**
   - Ideal para: Pruebas rápidas durante desarrollo
   - Requiere: La app debe estar corriendo (`npm run dev`)
   - Ventaja: Cambios en tiempo real

2. **URL de producción**
   - Ideal para: Versión final para distribución
   - Requiere: App desplegada en internet
   - Ventaja: Independiente del desarrollo local

3. **Archivos estáticos**
   - Ideal para: App completamente offline
   - Requiere: Build de Next.js configurado
   - Ventaja: No necesita servidor

### Uso Manual (Avanzado)

Si prefieres ejecutar Pake manualmente:

```bash
# 1. Inicia tu app (si usas localhost)
npm run dev

# 2. En otra terminal, genera la app de escritorio
pake http://localhost:3000 \
  --name Mastidea \
  --width 1400 \
  --height 900 \
  --targets appimage \
  --icon ./public/icon-192.png \
  --show-system-tray \
  --hide-title-bar

# O desde una URL de producción
pake https://mastidea.tudominio.com \
  --name Mastidea \
  --width 1400 \
  --height 900 \
  --targets appimage \
  --icon ./public/icon-192.png \
  --show-system-tray \
  --hide-title-bar
```

## 📦 Formatos Disponibles

### AppImage (Recomendado para Arch)
```bash
./build-desktop.sh appimage
```
- ✅ Portable (no requiere instalación)
- ✅ Funciona en cualquier distro
- ✅ Fácil de distribuir
- ✅ Se ejecuta directamente

**Usar:**
```bash
chmod +x ./desktop-builds/Mastidea*.AppImage
./desktop-builds/Mastidea*.AppImage
```

### DEB Package
```bash
./build-desktop.sh deb
```
- ✅ Paquete estándar de Debian/Ubuntu
- ⚠️ En Arch requiere conversión con `debtap`

**Instalar en ArchLinux:**
```bash
# Instalar debtap si no lo tienes
yay -S debtap

# Actualizar base de datos de debtap (solo primera vez)
sudo debtap -u

# Convertir DEB a paquete de Arch
debtap ./desktop-builds/Mastidea*.deb

# Instalar
sudo pacman -U Mastidea*.pkg.tar.zst
```

## 🎨 Personalización

### Opciones del Script

El script `build-desktop.sh` acepta personalización editando estas variables:

```bash
# En build-desktop.sh (líneas 11-14)
APP_NAME="Mastidea"           # Nombre de la app
APP_WIDTH=1400                # Ancho de ventana
APP_HEIGHT=900                # Alto de ventana
ICON_PATH="./public/icon-192.png"  # Ruta del icono
```

### Opciones Avanzadas de Pake

```bash
pake <URL> \
  --name "NombreApp" \
  --width 1400 \
  --height 900 \
  --targets appimage \
  --icon ./ruta/icono.png \
  
  # Opciones visuales
  --hide-title-bar \              # Ocultar barra de título
  --fullscreen \                  # Iniciar en pantalla completa
  --transparent \                 # Ventana transparente
  
  # Funcionalidad
  --show-system-tray \            # Icono en bandeja del sistema
  --activation-shortcut "CmdOrCtrl+Shift+M" \  # Atajo global
  --multi-instance \              # Permitir múltiples instancias
  --incognito \                   # Modo incógnito (sin cache)
  
  # Avanzado
  --user-agent "Custom UA" \      # User Agent personalizado
  --inject ./script.js \          # Inyectar JavaScript
  --enable-drag-drop \            # Habilitar drag & drop
  --wasm                          # Soporte WebAssembly
```

## 🐛 Solución de Problemas

### Error: "failed to run linuxdeploy"

Este es un error común en ArchLinux al generar AppImage.

**Solución automática:** El script ya maneja esto automáticamente con `NO_STRIP=1`

**Solución manual:**
```bash
NO_STRIP=1 pake http://localhost:3000 --name Mastidea --targets appimage
```

**Alternativa - Usar Docker:**
```bash
docker run --rm --privileged \
  --device /dev/fuse \
  --security-opt apparmor=unconfined \
  -v $(pwd)/desktop-builds:/output \
  ghcr.io/tw93/pake:latest \
  https://mastidea.tudominio.com --name Mastidea --targets appimage
```

### Falta libayatana-appindicator

**Síntoma:** El icono de la bandeja del sistema no funciona

**Solución:**
```bash
sudo pacman -S libayatana-appindicator
```

### El ícono no se ve bien

**Problema:** Pake requiere formatos específicos:
- Linux: `.png` (512x512px recomendado)
- Windows: `.ico`
- macOS: `.icns`

**Solución:**
```bash
# Si tu icono es de otro tamaño, redimensiónalo
convert ./public/icon-192.png -resize 512x512 ./public/icon-512.png

# Usar el nuevo icono
pake <URL> --icon ./public/icon-512.png
```

### La app no encuentra la base de datos

**Problema:** La app de escritorio intenta conectar a localhost pero las BDs están en Docker

**Soluciones:**

1. **Usar URL de producción** (recomendado)
2. **Exponer servicios de Docker:**
   ```bash
   # En docker-compose.dev.yml ya están expuestos
   # PostgreSQL: localhost:5432
   # Qdrant: localhost:6333
   ```

3. **Variables de entorno en la app de escritorio:**
   - Pake no puede acceder a `.env` local
   - Debes usar URLs absolutas o configurar CORS

## 🎯 Casos de Uso

### Desarrollo - Pruebas Rápidas
```bash
# Terminal 1: Iniciar app
npm run dev

# Terminal 2: Generar AppImage
./build-desktop.sh
# Seleccionar opción 1 (localhost)
```

### Producción - Distribución
```bash
# 1. Desplegar app en Vercel/Railway
vercel

# 2. Generar app de escritorio
./build-desktop.sh
# Seleccionar opción 2 e ingresar URL de producción

# 3. Distribuir el AppImage
# Los usuarios solo necesitan:
chmod +x Mastidea.AppImage
./Mastidea.AppImage
```

### Offline - App Standalone
```bash
# 1. Generar build estático de Next.js
npm run build

# 2. Generar app con archivos locales
./build-desktop.sh
# Seleccionar opción 3 (archivos estáticos)

# Nota: Requiere configurar Next.js para export estático
```

## 📊 Comparación con Electron

| Característica | Pake (Tauri) | Electron |
|---------------|--------------|----------|
| Tamaño | ~5-10 MB | ~150-200 MB |
| Memoria | ~50-100 MB | ~200-500 MB |
| Startup | <1 segundo | 2-5 segundos |
| Tecnología | Rust + WebView | Chromium |
| Distribución | Single binary | Múltiples archivos |
| Updates | Manual/Auto | Auto (electron-updater) |

## 🔗 Referencias

- [Pake GitHub](https://github.com/tw93/Pake)
- [Pake CLI Documentation](https://github.com/tw93/Pake/blob/main/docs/cli-usage.md)
- [Tauri Documentation](https://tauri.app/)
- [AppImage Documentation](https://appimage.org/)

## 💡 Tips

1. **Icono personalizado**: Usa un PNG de 512x512px para mejor calidad
2. **Tamaño de ventana**: Ajusta `APP_WIDTH` y `APP_HEIGHT` según tu diseño
3. **Testing**: Usa AppImage para pruebas rápidas (no requiere instalación)
4. **Distribución**: AppImage es ideal para Arch, pero DEB funciona con `debtap`
5. **Actualizaciones**: Regenera la app cuando actualices tu código

## 🎉 ¡Listo!

Ya puedes generar tu app de escritorio de Mastidea para ArchLinux. Si tienes problemas, revisa la sección de solución de problemas o abre un issue.

**¡Disfruta de Mastidea como app nativa en tu escritorio! 🚀**
