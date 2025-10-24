# 🚀 Guía de Setup - MastIdea

Esta guía te llevará paso a paso desde cero hasta tener MastIdea funcionando.

## 📋 Checklist de Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

- [ ] **Node.js 18+** - [Descargar](https://nodejs.org/)
- [ ] **Docker Desktop** - [Descargar](https://www.docker.com/products/docker-desktop/)
- [ ] **Git** - [Descargar](https://git-scm.com/)

### Cuentas necesarias (Gratis):

- [ ] **OpenRouter** - [Registrarse](https://openrouter.ai/)
  - Necesitas crear una API key
  - Modelo gratuito disponible: `meta-llama/llama-3.1-8b-instruct:free`
  
- [ ] **OpenAI** - [Registrarse](https://platform.openai.com/)
  - Necesitas crear una API key
  - Solo para embeddings (~$0.0001 por 1000 tokens)
  - Muy económico, con $5 de crédito inicial es suficiente para meses

---

## 📥 Paso 1: Clonar e Instalar

```bash
# 1. Clona el repositorio
git clone <url-del-repo>
cd mastidea

# 2. Instala las dependencias
npm install
```

---

## 🔑 Paso 2: Configurar API Keys

### 2.1 Obtener OpenRouter API Key

1. Ve a [OpenRouter Keys](https://openrouter.ai/keys)
2. Haz clic en "Create Key"
3. Copia la key (empieza con `sk-or-v1-...`)

### 2.2 Obtener OpenAI API Key

1. Ve a [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Haz clic en "Create new secret key"
3. Copia la key (empieza con `sk-...`)

### 2.3 Configurar .env

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tu editor favorito
nano .env  # o vim, code, etc.
```

Reemplaza las keys de ejemplo:

```env
# OpenRouter (usa el modelo gratis!)
OPENROUTER_API_KEY="sk-or-v1-TU-KEY-AQUI"
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"

# OpenAI (solo para embeddings)
OPENAI_API_KEY="sk-TU-KEY-AQUI"
```

---

## 🐳 Paso 3: Iniciar Docker

### 3.1 Verificar Docker

```bash
# Verifica que Docker esté corriendo
docker --version
docker-compose --version
```

Si ves errores, asegúrate de que Docker Desktop esté abierto.

### 3.2 Iniciar las bases de datos

```bash
# Opción 1: Usar el script helper
./dev-start.sh

# Opción 2: Comando manual
docker-compose -f docker-compose.dev.yml up -d
```

Esto iniciará:
- ✅ PostgreSQL (puerto 5432)
- ✅ Qdrant (puerto 6333)

### 3.3 Verificar que estén corriendo

```bash
# Ver contenedores activos
docker ps

# Deberías ver:
# - mastidea-postgres-dev
# - mastidea-qdrant-dev
```

---

## 🗃️ Paso 4: Configurar Base de Datos

```bash
# Ejecutar migraciones de Prisma
npx prisma migrate dev --name init

# Generar Prisma Client
npx prisma generate
```

---

## ✅ Paso 5: Verificar Setup

```bash
# Ejecutar verificación automática
npm run setup

# O manualmente:
./check-setup.sh
```

Este script verificará:
- ✅ Node.js instalado
- ✅ Docker corriendo
- ✅ Variables de entorno configuradas
- ✅ Dependencias instaladas
- ✅ Contenedores activos

---

## 🎉 Paso 6: Iniciar la Aplicación

```bash
# Iniciar Next.js en modo desarrollo
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

---

## 🧪 Paso 7: Probar la Aplicación

### Test 1: Crear tu primera idea

1. Ve a http://localhost:3000
2. Escribe un título: "App para aprender idiomas"
3. Describe la idea: "Una app que usa IA para crear conversaciones personalizadas..."
4. Haz clic en "Explorar esta idea con IA"
5. ✅ Deberías ver la expansión automática generada por IA

### Test 2: Explorar con diferentes tipos

1. En la página de la idea, prueba cada botón:
   - 💡 Sugerencias
   - ❓ Preguntas
   - 🔗 Conexiones
   - 🎯 Casos de uso
   - 🧩 Desafíos

### Test 3: Búsqueda semántica

1. Crea 2-3 ideas diferentes
2. Ve a "Mis Ideas"
3. Usa la búsqueda: "aplicación móvil"
4. ✅ Debería encontrar ideas relacionadas por concepto

---

## 🎛️ Comandos Útiles

### Desarrollo
```bash
npm run dev              # Iniciar app
npm run build            # Build de producción
npm start                # Producción
npm run lint             # Linter
```

### Base de Datos
```bash
npm run db:studio        # Prisma Studio (GUI)
npm run db:migrate       # Nueva migración
npm run db:push          # Push rápido del schema
npm run db:generate      # Generar Prisma Client
```

### Docker
```bash
npm run docker:dev       # Iniciar contenedores
npm run docker:down      # Detener contenedores
npm run docker:logs      # Ver logs
./dev-start.sh           # Script completo (incluye migraciones)
./dev-stop.sh            # Detener todo
```

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to Docker daemon"

**Problema**: Docker Desktop no está corriendo

**Solución**:
1. Abre Docker Desktop
2. Espera a que el ícono de Docker en la barra de tareas esté verde
3. Vuelve a ejecutar `./dev-start.sh`

---

### Error: "Port 5432 already in use"

**Problema**: Ya tienes PostgreSQL corriendo localmente

**Solución 1** (Recomendada): Detén tu PostgreSQL local
```bash
# macOS/Linux
sudo systemctl stop postgresql

# O modifica docker-compose.dev.yml para usar otro puerto
```

**Solución 2**: Cambiar puerto en `docker-compose.dev.yml`
```yaml
postgres:
  ports:
    - "5433:5432"  # Usa 5433 en tu máquina
```

Actualiza `.env`:
```env
DATABASE_URL="postgresql://mastidea:mastidea_dev_password@localhost:5433/mastidea_dev?schema=public"
```

---

### Error: "Invalid API key" de OpenRouter

**Problema**: API key incorrecta o no configurada

**Solución**:
1. Verifica que copiaste la key completa (empieza con `sk-or-v1-`)
2. Asegúrate de que no hay espacios al inicio/final
3. Verifica que la key sea válida en [OpenRouter Dashboard](https://openrouter.ai/keys)

---

### Error: "Prisma Client not generated"

**Problema**: Prisma Client no está generado

**Solución**:
```bash
npx prisma generate
```

---

### Error: Contenedores no inician

**Problema**: Conflictos con contenedores previos

**Solución**:
```bash
# Limpiar todo
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a

# Reiniciar desde cero
./dev-start.sh
```

---

### La IA no responde o tarda mucho

**Problema**: Posible problema con OpenRouter o modelo caído

**Solución**:
1. Verifica el [status de OpenRouter](https://status.openrouter.ai/)
2. Prueba otro modelo en `.env`:
   ```env
   OPENROUTER_MODEL="google/gemini-flash-1.5"
   ```
3. Reinicia la app: `Ctrl+C` y `npm run dev`

---

### Error: "Cannot find module '@prisma/client'"

**Problema**: Dependencias no instaladas correctamente

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

---

## 📊 Verificar que Todo Funciona

Ejecuta esta checklist:

- [ ] `docker ps` muestra 2 contenedores corriendo
- [ ] `npm run dev` inicia sin errores
- [ ] http://localhost:3000 carga correctamente
- [ ] Puedes crear una idea nueva
- [ ] La IA genera una expansión automática
- [ ] La búsqueda semántica funciona
- [ ] http://localhost:6333/dashboard muestra Qdrant dashboard

---

## 🎓 Próximos Pasos

Una vez que todo funcione:

1. **Explora la app**: Crea varias ideas y prueba todas las expansiones
2. **Lee el código**: Empieza por `app/page.tsx` y `app/api/ideas/route.ts`
3. **Personaliza**: Modifica los prompts en `lib/openrouter.ts`
4. **Experimenta**: Prueba diferentes modelos de IA
5. **Extiende**: Añade nuevas funcionalidades

---

## 💬 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. Revisa la [documentación completa](README.md)
2. Verifica los logs:
   ```bash
   npm run docker:logs
   ```
3. Crea un issue en GitHub con:
   - Output de `npm run setup`
   - Logs de error completos
   - Tu sistema operativo

---

**¡Listo para empezar a capturar ideas! 🚀**

*"La imaginación es más importante que el conocimiento" - Einstein*
