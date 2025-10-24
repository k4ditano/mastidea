# ⚡ MastIdea - Comandos Rápidos

Referencia rápida de los comandos más usados.

## 🚀 Inicio Rápido

```bash
# Setup inicial (solo una vez)
npm install
cp .env.example .env
# Edita .env con tus API keys

# Iniciar todo
./dev-start.sh && npm run dev

# Abrir en navegador
open http://localhost:3000
```

## 📦 NPM Scripts

```bash
# Desarrollo
npm run dev              # Iniciar Next.js dev
npm run build            # Build producción
npm start                # Iniciar producción
npm run lint             # Ejecutar linter

# Base de Datos
npm run db:studio        # Abrir Prisma Studio
npm run db:migrate       # Nueva migración
npm run db:push          # Push schema (dev rápido)
npm run db:generate      # Generar Prisma Client

# Docker
npm run docker:dev       # Iniciar contenedores
npm run docker:down      # Detener contenedores
npm run docker:logs      # Ver logs

# Utilidades
npm run setup            # Verificar setup
```

## 🐳 Docker

```bash
# Iniciar servicios
./dev-start.sh
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs qdrant

# Detener
./dev-stop.sh
docker-compose -f docker-compose.dev.yml down

# Detener y eliminar volúmenes (reset completo)
docker-compose -f docker-compose.dev.yml down -v

# Ver contenedores activos
docker ps

# Reiniciar un servicio
docker-compose -f docker-compose.dev.yml restart postgres
docker-compose -f docker-compose.dev.yml restart qdrant
```

## 🗄️ Prisma

```bash
# Abrir interfaz gráfica
npx prisma studio

# Ver schema
cat prisma/schema.prisma

# Crear migración
npx prisma migrate dev --name nombre_de_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Reset completo de BD (⚠️ elimina datos)
npx prisma migrate reset

# Push schema sin migración (dev rápido)
npx prisma db push

# Generar Prisma Client
npx prisma generate

# Formatear schema
npx prisma format
```

## 🔍 Qdrant

```bash
# Dashboard
open http://localhost:6333/dashboard

# Health check
curl http://localhost:6333/healthz

# Ver colecciones
curl http://localhost:6333/collections

# Ver info de colección
curl http://localhost:6333/collections/mastidea_ideas
```

## 🧪 Testing Manual

```bash
# Test 1: Crear idea
# 1. Ir a http://localhost:3000
# 2. Completar formulario
# 3. Click "Explorar esta idea con IA"
# ✅ Ver expansión automática

# Test 2: Generar expansiones
# 1. Click en una idea
# 2. Probar cada botón de expansión
# ✅ Ver nueva expansión generada

# Test 3: Búsqueda
# 1. Ir a "Mis Ideas"
# 2. Usar barra de búsqueda
# ✅ Ver resultados semánticos

# Test 4: Ideas relacionadas
# 1. Abrir una idea
# 2. Ver sidebar derecho
# ✅ Ver ideas similares automáticamente
```

## 🔧 Troubleshooting

```bash
# Problema: Port already in use
lsof -i :3000          # Ver qué usa el puerto
kill -9 <PID>          # Matar proceso

# Problema: Docker no conecta
docker info            # Verificar Docker
sudo systemctl start docker  # Linux
# macOS: Abrir Docker Desktop

# Problema: Prisma Client error
rm -rf node_modules
npm install
npx prisma generate

# Problema: Clean slate
docker-compose -f docker-compose.dev.yml down -v
rm -rf node_modules .next
npm install
./dev-start.sh

# Ver logs de errores de Next.js
tail -f .next/server/app-paths-manifest.json

# Verificar variables de entorno
cat .env | grep -v "^#" | grep -v "^$"
```

## 🚀 Deploy

```bash
# Vercel
vercel                 # Primer deploy
vercel --prod          # Deploy a producción

# Docker Producción
docker-compose up -d   # Iniciar todo
docker-compose logs -f # Ver logs
docker-compose down    # Detener

# Build local
npm run build
npm start
```

## 📊 Utilidades

```bash
# Ver estructura del proyecto
ls -la

# Ver tamaño del proyecto
du -sh .

# Contar líneas de código
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Buscar en código
grep -r "texto_a_buscar" app/ lib/ components/

# Ver todos los scripts disponibles
cat package.json | grep "scripts" -A 20

# Verificar versiones
node --version
npm --version
docker --version
docker-compose --version
```

## 🔑 API Keys

```bash
# Editar .env
nano .env
# o
code .env
# o
vim .env

# Verificar que están configuradas
cat .env | grep API_KEY

# OpenRouter: https://openrouter.ai/keys
# OpenAI: https://platform.openai.com/api-keys
```

## 📝 Git

```bash
# Status
git status

# Commit
git add .
git commit -m "feat: descripción del cambio"

# Push
git push origin main

# Ver cambios
git diff

# Crear branch
git checkout -b feature/nueva-funcionalidad

# Volver a main
git checkout main
```

## 🔄 Reset Completo

```bash
# ⚠️ Esto eliminará TODO (datos, contenedores, dependencias)

# 1. Detener y eliminar Docker
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a -f

# 2. Limpiar node_modules
rm -rf node_modules .next package-lock.json

# 3. Reinstalar
npm install

# 4. Reiniciar
./dev-start.sh
npm run dev
```

## 🎯 Flujo de Trabajo Típico

```bash
# Día 1: Setup inicial
npm install
cp .env.example .env
# Configurar .env
./dev-start.sh
npm run dev

# Desarrollo diario
npm run dev                    # Al empezar
# ... programar ...
git add . && git commit -m ""  # Guardar cambios
npm run dev                    # Cerrar al terminar

# Si necesitas ver la BD
npx prisma studio

# Si algo falla
./dev-stop.sh
./dev-start.sh
npm run dev
```

## ⚙️ Configuración

```bash
# Cambiar puerto de Next.js
# Editar package.json:
"dev": "next dev -p 3001"

# Cambiar puerto de PostgreSQL
# Editar docker-compose.dev.yml:
ports:
  - "5433:5432"
# Y actualizar .env

# Cambiar modelo de IA
# Editar .env:
OPENROUTER_MODEL="google/gemini-flash-1.5"
```

## 📱 URLs Importantes

```bash
# Aplicación
http://localhost:3000

# Qdrant Dashboard
http://localhost:6333/dashboard

# Prisma Studio
# Ejecutar: npx prisma studio
# Abre: http://localhost:5555

# PostgreSQL
# Host: localhost
# Port: 5432
# User: mastidea
# Pass: mastidea_dev_password
# DB: mastidea_dev
```

---

## 💡 Tips

```bash
# Tip 1: Usar alias en ~/.zshrc o ~/.bashrc
alias md="npm run dev"
alias mds="./dev-start.sh"
alias mdd="./dev-stop.sh"

# Tip 2: Watch mode para cambios
npm run dev  # Ya incluye hot reload

# Tip 3: Ver logs en tiempo real
npm run docker:logs &
npm run dev

# Tip 4: Backup de datos
docker exec mastidea-postgres-dev pg_dump -U mastidea mastidea_dev > backup.sql

# Tip 5: Restore de datos
cat backup.sql | docker exec -i mastidea-postgres-dev psql -U mastidea -d mastidea_dev
```

---

**Guarda este archivo como referencia rápida! 📌**
