#!/bin/bash

# Script para iniciar el entorno de desarrollo con Docker

echo "🚀 Iniciando MastIdea - Entorno de Desarrollo"
echo "=============================================="

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró archivo .env, copiando desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor configura tus API keys:"
    echo "   - OPENROUTER_API_KEY (https://openrouter.ai/keys)"
    echo "   - OPENAI_API_KEY (https://platform.openai.com/api-keys)"
    echo ""
    echo "Después de configurar las keys, ejecuta este script nuevamente."
    exit 1
fi

echo "📦 Iniciando contenedores de Docker..."
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ Esperando a que las bases de datos estén listas..."
sleep 5

echo ""
echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate dev --name init

echo ""
echo "✅ ¡Entorno listo!"
echo ""
echo "📊 Servicios disponibles:"
echo "   - PostgreSQL: localhost:5433"
echo "   - Qdrant: localhost:6335 (API), localhost:6336 (gRPC)"
echo "   - Dashboard Qdrant: http://localhost:6335/dashboard"
echo ""
echo "🎯 Para iniciar la aplicación Next.js:"
echo "   npm run dev"
echo ""
echo "🛑 Para detener los contenedores:"
echo "   docker-compose -f docker-compose.dev.yml down"
