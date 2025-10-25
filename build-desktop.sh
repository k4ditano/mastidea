#!/bin/bash

# Script para generar la aplicación de escritorio con Pake
# Uso: ./build-desktop.sh [appimage|deb]

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
APP_NAME="Mastidea"
APP_WIDTH=1400
APP_HEIGHT=900
ICON_PATH="./public/icon-192.png"
TARGET_FORMAT="${1:-appimage}"  # Por defecto appimage

echo -e "${GREEN}🚀 Construyendo app de escritorio Mastidea${NC}"
echo -e "${YELLOW}Formato: ${TARGET_FORMAT}${NC}"

# Verificar que pake-cli esté instalado
if ! command -v pake &> /dev/null; then
    echo -e "${RED}❌ pake-cli no está instalado${NC}"
    echo -e "${YELLOW}Instalando pake-cli globalmente...${NC}"
    pnpm install -g pake-cli
fi

# Verificar dependencias del sistema
echo -e "${YELLOW}📦 Verificando dependencias del sistema...${NC}"
MISSING_DEPS=""

if ! pacman -Q webkit2gtk &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS webkit2gtk"
fi

if ! pacman -Q libayatana-appindicator &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS libayatana-appindicator"
fi

if [ ! -z "$MISSING_DEPS" ]; then
    echo -e "${YELLOW}⚠️  Faltan dependencias:${MISSING_DEPS}${NC}"
    echo -e "${YELLOW}Instalar con: sudo pacman -S${MISSING_DEPS}${NC}"
    read -p "¿Deseas continuar de todos modos? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Preguntar si usar servidor local o URL
echo ""
echo -e "${YELLOW}¿Cómo quieres empaquetar la app?${NC}"
echo "1) Servidor local (http://localhost:3000) - Requiere que la app esté corriendo"
echo "2) URL de producción - Necesitas subir la app primero"
echo "3) Archivos estáticos locales - Empaqueta los archivos build"
read -p "Selecciona una opción (1/2/3): " -n 1 -r BUILD_OPTION
echo ""

case $BUILD_OPTION in
    1)
        APP_URL="http://localhost:3000"
        echo -e "${YELLOW}⚠️  Asegúrate de que la app esté corriendo en http://localhost:3000${NC}"
        echo -e "${YELLOW}Puedes iniciarla con: npm run dev${NC}"
        read -p "Presiona Enter cuando la app esté lista..."
        ;;
    2)
        read -p "Introduce la URL de producción: " APP_URL
        ;;
    3)
        echo -e "${YELLOW}📦 Generando build de Next.js...${NC}"
        npm run build
        APP_URL="./out/index.html"  # Ajusta según tu configuración de Next.js
        USE_LOCAL_FILE="--use-local-file"
        ;;
    *)
        echo -e "${RED}Opción no válida${NC}"
        exit 1
        ;;
esac

# Crear directorio de salida
mkdir -p ./desktop-builds

# Comando base de Pake
PAKE_CMD="pake \"$APP_URL\" \
  --name \"$APP_NAME\" \
  --width $APP_WIDTH \
  --height $APP_HEIGHT \
  --targets $TARGET_FORMAT \
  --icon \"$ICON_PATH\" \
  --hide-title-bar"

# Agregar opción de archivos locales si es necesario
if [ ! -z "$USE_LOCAL_FILE" ]; then
    PAKE_CMD="$PAKE_CMD $USE_LOCAL_FILE"
fi

echo -e "${GREEN}🔨 Ejecutando Pake...${NC}"
echo -e "${YELLOW}Comando: $PAKE_CMD${NC}"
echo ""

# Ejecutar Pake con manejo de errores para AppImage
if [ "$TARGET_FORMAT" = "appimage" ]; then
    echo -e "${YELLOW}ℹ️  Intentando build de AppImage...${NC}"
    if ! eval $PAKE_CMD; then
        echo -e "${YELLOW}⚠️  Falló el build normal, intentando con NO_STRIP=1...${NC}"
        NO_STRIP=1 eval $PAKE_CMD
    fi
else
    eval $PAKE_CMD
fi

# Mover el resultado al directorio de builds
echo -e "${GREEN}📦 Moviendo archivos generados...${NC}"
if [ "$TARGET_FORMAT" = "appimage" ]; then
    mv ${APP_NAME}*.AppImage ./desktop-builds/ 2>/dev/null || true
elif [ "$TARGET_FORMAT" = "deb" ]; then
    mv ${APP_NAME}*.deb ./desktop-builds/ 2>/dev/null || true
fi

echo -e "${GREEN}✅ ¡Build completado!${NC}"
echo -e "${YELLOW}Los archivos están en: ./desktop-builds/${NC}"
ls -lh ./desktop-builds/

# Instrucciones de instalación
echo ""
echo -e "${GREEN}📝 Para instalar:${NC}"
if [ "$TARGET_FORMAT" = "appimage" ]; then
    echo -e "  ${YELLOW}chmod +x ./desktop-builds/${APP_NAME}*.AppImage${NC}"
    echo -e "  ${YELLOW}./desktop-builds/${APP_NAME}*.AppImage${NC}"
elif [ "$TARGET_FORMAT" = "deb" ]; then
    echo -e "  ${YELLOW}# En Arch usa debtap para convertir el .deb${NC}"
    echo -e "  ${YELLOW}debtap ./desktop-builds/${APP_NAME}*.deb${NC}"
    echo -e "  ${YELLOW}sudo pacman -U ${APP_NAME}*.pkg.tar.zst${NC}"
fi
