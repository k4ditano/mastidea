#!/bin/bash

# Script para lanzar Mastidea con las configuraciones correctas para ArchLinux

# Intentar diferentes configuraciones hasta que una funcione

echo "🚀 Lanzando Mastidea..."

# Opción 1: Forzar X11 con hardware acceleration deshabilitado
echo "Intentando con X11 y aceleración deshabilitada..."
GDK_BACKEND=x11 WEBKIT_DISABLE_COMPOSITING_MODE=1 ~/.local/bin/pake-mastidea &
PID=$!
sleep 2

# Verificar si sigue corriendo
if ps -p $PID > /dev/null; then
    echo "✅ App lanzada correctamente (PID: $PID)"
    exit 0
fi

echo "❌ Falló, intentando opción 2..."

# Opción 2: Wayland nativo sin GBM
WAYLAND_DISPLAY=wayland-0 ~/.local/bin/pake-mastidea &
PID=$!
sleep 2

if ps -p $PID > /dev/null; then
    echo "✅ App lanzada correctamente (PID: $PID)"
    exit 0
fi

echo "❌ Falló, intentando opción 3..."

# Opción 3: X11 puro sin optimizaciones
LIBGL_ALWAYS_SOFTWARE=1 GDK_BACKEND=x11 ~/.local/bin/pake-mastidea &
PID=$!
sleep 2

if ps -p $PID > /dev/null; then
    echo "✅ App lanzada correctamente (PID: $PID)"
    exit 0
fi

echo "❌ No se pudo lanzar la app. Verifica que el servidor Next.js esté corriendo en http://localhost:3000"
