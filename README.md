# 🧠 MastIdea

**Captura, explora y desarrolla tus ideas con el poder de la IA** 

Una aplicación minimalista inspirada en Einstein que te ayuda a expandir tus ideas mediante conversaciones inteligentes. Cada idea que captures se convierte en una exploración guiada por IA que te ayuda a ver nuevas perspectivas, conexiones y posibilidades.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Docker](https://img.shields.io/badge/Docker-ready-brightgreen)

## ✨ Características

### 🎯 Captura y Expansión
- **Input minimalista** para capturar ideas rápidamente
- **6 tipos de expansiones con IA**: Primera exploración, sugerencias, preguntas, conexiones, casos de uso, desafíos
- **Chat interactivo** para profundizar en cada aspecto
- **Resumen ejecutivo** al cerrar ideas

### 🏷️ Sistema de Tags Inteligente (V2.0)
- **IA genera tags automáticamente** al crear ideas
- **Reutilización inteligente** de tags existentes
- **Filtrado por tags** en galería de ideas
- **Vista dedicada** con estadísticas de uso
- **Edición manual**: añadir, crear o eliminar tags
- **Tags actualizados** al cerrar ideas (analiza desarrollo completo)

### 🕸️ Visualización de Conexiones
- **Grafo interactivo** que muestra relaciones entre ideas
- **Enlaces por tags compartidos** (grosor = cantidad)
- **Nodos escalables** (tamaño = número de expansiones)
- **Colores por estado** (activa/completada/archivada)
- **Navegación directa** con click en nodos

### 📄 Exportación Completa
- **Exportar a Markdown** (.md) para compartir
- **Exportar a PDF** profesional con paginación
- **Incluye todo**: título, contenido, tags, todas las expansiones
- **Sin costo** - generación del lado del cliente

### 📱 PWA - Modo Offline
- **Instalable como app nativa** en móvil y escritorio
- **Service Worker** automático
- **Funciona offline** (próximo: sincronización)
- **Prompt de instalación** inteligente

### 🔍 Búsqueda (Parcial)
- Base vectorial **Qdrant** configurada
- Búsqueda semántica (embeddings deshabilitados temporalmente)
- Búsqueda por texto en interfaz

### 📱 Diseño Mobile-First
- Interfaz responsive adaptada a todos los dispositivos
- PWA-ready (listo para convertir en app nativa)
- Tema minimalista inspirado en Einstein

## 🏗️ Arquitectura

```
MastIdea
├── Frontend: Next.js 14 + TypeScript + Tailwind CSS
├── Backend: Next.js API Routes
├── Base de Datos: PostgreSQL (metadata) + Qdrant (vectores)
├── IA: OpenRouter (modelos LLM) + OpenAI (embeddings)
└── Infraestructura: Docker + Docker Compose
```

### Stack Tecnológico

- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Vector DB**: Qdrant (búsqueda semántica)
- **IA**: 
  - OpenRouter API (LLM - Llama 3.1 8B gratis!)
  - Embeddings: Por implementar con servicio gratuito
- **Containerización**: Docker + Docker Compose

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Docker y Docker Compose
- Cuenta en:
  - [OpenRouter](https://openrouter.ai/) (para IA conversacional Y embeddings)

### Instalación

1. **Clona el repositorio**
```bash
git clone <url-del-repo>
cd mastidea
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` y agrega tu API key:
```env
# OpenRouter (GRATIS con Llama 3.1 + embeddings económicos!)
OPENROUTER_API_KEY="sk-or-v1-tu-key-aqui"
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"

# ¡Solo necesitas UNA API key! Los embeddings también usan OpenRouter
```

4. **Inicia los contenedores de Docker**
```bash
./dev-start.sh
```

Esto iniciará:
- ✅ PostgreSQL en puerto 5432
- ✅ Qdrant en puerto 6333 (dashboard: http://localhost:6333/dashboard)
- ✅ Ejecutará migraciones de Prisma automáticamente

5. **Inicia la aplicación Next.js**
```bash
npm run dev
```

6. **Abre tu navegador**
```
http://localhost:3000
```

¡Listo! 🎉 Ya puedes empezar a capturar ideas.

### Detener el entorno

```bash
./dev-stop.sh
```

## 📖 Uso

### 1. Captura una Idea
- Ve a la página principal
- Escribe un título descriptivo
- Añade detalles sobre tu idea
- Haz clic en "Explorar esta idea con IA"

### 2. Explora con IA
La IA generará automáticamente una primera exploración. Luego puedes:
- 💡 **Sugerencias**: Obtén mejoras y complementos
- ❓ **Preguntas**: Recibe preguntas provocadoras
- 🔗 **Conexiones**: Descubre relaciones con otros campos
- 🎯 **Casos de uso**: Ve aplicaciones prácticas
- 🧩 **Desafíos**: Analiza obstáculos potenciales

### 3. Encuentra Ideas Relacionadas
- Cada idea muestra automáticamente ideas similares (búsqueda semántica)
- Usa la búsqueda en "Mis Ideas" para encontrar conceptos relacionados

## 🎨 Personalización

### Cambiar el Modelo de IA

Edita `.env` para usar otros modelos de OpenRouter:

```env
# Opciones económicas:
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"  # GRATIS
OPENROUTER_MODEL="mistralai/mistral-7b-instruct"          # $0.06/1M tokens
OPENROUTER_MODEL="google/gemini-flash-1.5"                # $0.075/1M tokens

# Opciones más potentes:
OPENROUTER_MODEL="anthropic/claude-3-sonnet"              # $3/1M tokens
OPENROUTER_MODEL="openai/gpt-4o-mini"                     # $0.15/1M tokens
```

### Modificar Prompts de IA

Los prompts están en `lib/openrouter.ts`. Puedes personalizarlos para ajustar el tono y estilo de las respuestas.

## 🐳 Docker

### Desarrollo
```bash
# Iniciar bases de datos
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener
docker-compose -f docker-compose.dev.yml down
```

### Producción
```bash
# Build y deploy completo
docker-compose up -d

# La app incluirá:
# - PostgreSQL
# - Qdrant
# - Next.js app (production build)
```

## 📊 Estructura del Proyecto

```
mastidea/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── ideas/          # CRUD de ideas
│   │   │   └── [id]/
│   │   │       └── expand/ # Expansiones de IA
│   │   └── search/         # Búsqueda semántica
│   ├── idea/[id]/          # Página de exploración
│   ├── ideas/              # Galería de ideas
│   └── page.tsx            # Home
├── components/              # Componentes React
│   ├── Navbar.tsx
│   ├── IdeaCard.tsx
│   ├── ExpansionCard.tsx
│   └── ...
├── lib/                     # Servicios y utilidades
│   ├── prisma.ts           # Cliente de Prisma
│   ├── openrouter.ts       # Cliente de OpenRouter
│   ├── embeddings.ts       # Generación de embeddings
│   └── qdrant.ts           # Cliente de Qdrant
├── prisma/                  # Schema de base de datos
│   └── schema.prisma
├── types/                   # TypeScript types
└── docker-compose.yml       # Configuración Docker
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia Next.js en modo desarrollo
npm run build            # Build de producción
npm start                # Inicia producción

# Base de datos
npx prisma studio        # Abre Prisma Studio (GUI)
npx prisma migrate dev   # Crea nueva migración
npx prisma generate      # Genera Prisma Client
npx prisma db push       # Push schema a DB (dev rápido)

# Docker
./dev-start.sh           # Inicia entorno completo
./dev-stop.sh            # Detiene contenedores
docker-compose logs -f   # Ver logs en tiempo real
```

## 🌐 Deployment

### Vercel + Supabase/Neon (Recomendado)

1. **Deploy en Vercel**
```bash
vercel
```

2. **Base de datos**: 
   - [Neon](https://neon.tech/) (PostgreSQL serverless - gratis)
   - [Qdrant Cloud](https://cloud.qdrant.io/) (1GB gratis)

3. **Configura variables de entorno en Vercel**

### Railway / Render

Alternativas que incluyen Docker nativo:
- [Railway](https://railway.app/)
- [Render](https://render.com/)

## 🔐 Seguridad

⚠️ **Importante**: Nunca comitees tus API keys!

- El archivo `.env` está en `.gitignore`
- Usa variables de entorno en producción
- Rota tus keys periódicamente

## 🗺️ Roadmap

### Versión 1.0 (Actual)
- ✅ CRUD de ideas
- ✅ Expansiones con IA (6 tipos)
- ✅ Búsqueda semántica
- ✅ Dockerizado
- ✅ UI minimalista responsive

### Versión 2.0 (✅ COMPLETADA - 85%)
- [x] **Sistema de Tags inteligente con IA** ✅ 100%
  - [x] Modelo Tag en base de datos
  - [x] IA genera tags automáticamente (reutiliza existentes)
  - [x] UI para mostrar tags en ideas
  - [x] Filtrado por tags
  - [x] Tags actualizados al cerrar idea
  - [x] Navegación por tags clickeables
  - [x] Vista de todas las tags (página dedicada)
    - [x] Endpoint /api/tags con conteo
    - [x] Página /tags con grid de tags
    - [x] Estadísticas de uso
    - [x] Ordenar por nombre o uso
  - [x] Edición manual de tags
    - [x] Modal TagEditor para gestionar tags
    - [x] Añadir tags existentes
    - [x] Crear nuevos tags
    - [x] Eliminar tags de ideas
    - [x] Endpoints POST/DELETE para tags
- [x] **Visualización de grafos de ideas** ✅ 100%
  - [x] Grafo interactivo con react-force-graph-2d
  - [x] Nodos = Ideas (tamaño por expansiones)
  - [x] Enlaces = Tags compartidos (grosor por cantidad)
  - [x] Colores por estado (activa/completada/archivada)
  - [x] Click en nodo para navegar a idea
  - [x] Estadísticas de conexiones
- [x] **Exportar a PDF/Markdown** ✅ 100%
  - [x] Exportar a Markdown (.md)
  - [x] Exportar a PDF (jsPDF del lado del cliente)
  - [x] Botones de exportación en página de idea
  - [x] Incluye título, contenido, tags y todas las expansiones
- [x] **Modo offline (PWA)** ✅ 95%
  - [x] Configuración next-pwa
  - [x] Manifest.json con metadata
  - [x] Service Worker automático
  - [x] Instalable como app nativa
  - [x] Componente InstallPWA con prompt
  - [ ] Sincronización offline (requiere autenticación)
- [ ] **Autenticación multi-usuario** ⏳ 0%
- [ ] **Compartir ideas públicamente** ⏳ 0%
- [ ] **App nativa (React Native)** ⏳ 0%

### Versión 3.0 (Visión)
- [ ] Colaboración en tiempo real
- [ ] IA con voz (dictado de ideas)
- [ ] Integración con Notion/Obsidian
- [ ] Análisis de patrones creativos
- [ ] Gamificación del proceso creativo

## 💡 Inspiración

> "La imaginación es más importante que el conocimiento. El conocimiento es limitado, la imaginación circunda el mundo."
> — Albert Einstein

Este proyecto nace de la creencia de que todos tenemos ideas brillantes, solo necesitamos las herramientas adecuadas para explorarlas.

## 🙏 Agradecimientos

- [OpenRouter](https://openrouter.ai/) - Por democratizar el acceso a LLMs
- [Qdrant](https://qdrant.tech/) - Por una vector DB open source increíble
- [Next.js](https://nextjs.org/) - Por el mejor framework de React
- Albert Einstein - Por inspirarnos a pensar diferente

---

**Hecho con 🧠 y ❤️**

*"No todo lo que cuenta puede ser contado, y no todo lo que puede ser contado cuenta." - Einstein*
