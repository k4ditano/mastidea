#!/bin/bash

# Script para detener el entorno de desarrollo

echo "🛑 Deteniendo MastIdea - Entorno de Desarrollo"
echo "=============================================="

docker-compose -f docker-compose.dev.yml down

echo ""
echo "✅ Contenedores detenidos"
echo ""
echo "💡 Para eliminar también los volúmenes (datos):"
echo "   docker-compose -f docker-compose.dev.yml down -v"
