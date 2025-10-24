#!/bin/bash

# Script de verificación del entorno

echo "🔍 Verificando MastIdea Setup"
echo "=============================="
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js instalado: $NODE_VERSION"
else
    echo "❌ Node.js no encontrado. Instala Node.js 18+"
    exit 1
fi

# Verificar npm
echo "📦 Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm instalado: $NPM_VERSION"
else
    echo "❌ npm no encontrado"
    exit 1
fi

# Verificar Docker
echo "🐳 Verificando Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker instalado: $DOCKER_VERSION"
else
    echo "❌ Docker no encontrado. Instala Docker Desktop"
    exit 1
fi

# Verificar Docker Compose
echo "🐳 Verificando Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose instalado: $COMPOSE_VERSION"
else
    echo "❌ Docker Compose no encontrado"
    exit 1
fi

# Verificar archivo .env
echo "⚙️  Verificando configuración..."
if [ -f .env ]; then
    echo "✅ Archivo .env encontrado"
    
    # Verificar OPENROUTER_API_KEY
    if grep -q "OPENROUTER_API_KEY=\"sk-or-v1-" .env; then
        echo "⚠️  Configura tu OPENROUTER_API_KEY en .env"
    else
        echo "✅ OPENROUTER_API_KEY configurada"
    fi
    
    # Verificar OPENAI_API_KEY
    if grep -q "OPENAI_API_KEY=\"sk-" .env; then
        echo "⚠️  Configura tu OPENAI_API_KEY en .env"
    else
        echo "✅ OPENAI_API_KEY configurada"
    fi
else
    echo "❌ Archivo .env no encontrado"
    echo "   Ejecuta: cp .env.example .env"
    exit 1
fi

# Verificar node_modules
echo "📚 Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencias instaladas"
else
    echo "❌ Dependencias no instaladas"
    echo "   Ejecuta: npm install"
    exit 1
fi

# Verificar si Docker está corriendo
echo "🐳 Verificando Docker daemon..."
if docker info &> /dev/null; then
    echo "✅ Docker daemon corriendo"
else
    echo "❌ Docker daemon no está corriendo"
    echo "   Inicia Docker Desktop"
    exit 1
fi

# Verificar contenedores
echo "🐳 Verificando contenedores..."
if docker ps | grep -q "mastidea-postgres-dev"; then
    echo "✅ PostgreSQL corriendo"
else
    echo "⚠️  PostgreSQL no está corriendo"
    echo "   Ejecuta: ./dev-start.sh"
fi

if docker ps | grep -q "mastidea-qdrant-dev"; then
    echo "✅ Qdrant corriendo"
else
    echo "⚠️  Qdrant no está corriendo"
    echo "   Ejecuta: ./dev-start.sh"
fi

echo ""
echo "=============================="
echo "✨ Verificación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Configura las API keys en .env si no lo has hecho"
echo "   2. Ejecuta: ./dev-start.sh (si los contenedores no están corriendo)"
echo "   3. Ejecuta: npm run dev"
echo "   4. Abre: http://localhost:3000"
echo ""
