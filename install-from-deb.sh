#!/bin/bash

# Script para extraer e instalar el DEB sin debtap
# Como alternativa temporal hasta que funcione debtap

set -e

DEB_FILE="./desktop-builds/mastidea.deb"
INSTALL_DIR="$HOME/.local/share/mastidea"
DESKTOP_FILE="$HOME/.local/share/applications/mastidea.desktop"

echo "🔧 Extrayendo paquete DEB..."

# Crear directorio temporal
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

# Extraer DEB
ar x "$OLDPWD/$DEB_FILE"
tar -xf data.tar.*

echo "📦 Instalando archivos..."

# Copiar binario
mkdir -p "$HOME/.local/bin"
cp -r usr/bin/* "$HOME/.local/bin/" 2>/dev/null || true

# Copiar datos de la aplicación
mkdir -p "$INSTALL_DIR"
cp -r usr/share/* "$INSTALL_DIR/" 2>/dev/null || true

# Crear archivo .desktop
mkdir -p "$HOME/.local/share/applications"
cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Mastidea
Comment=Mastidea Desktop App
Exec=$HOME/.local/bin/pake-mastidea
Icon=mastidea
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml_xml;
StartupNotify=true
EOF

echo "✨ Haciendo ejecutable..."
chmod +x "$HOME/.local/bin/pake-mastidea"

# Actualizar base de datos de aplicaciones
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

cd - > /dev/null
rm -rf "$TMP_DIR"

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "Para ejecutar la app:"
echo "  1. Desde terminal: ~/.local/bin/pake-mastidea"
echo "  2. Desde el launcher de tu DE (busca 'Mastidea')"
echo ""
echo "Para desinstalar:"
echo "  rm ~/.local/bin/pake-mastidea"
echo "  rm ~/.local/share/applications/mastidea.desktop"
echo "  rm -rf ~/.local/share/mastidea"
