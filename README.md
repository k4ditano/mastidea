# 🧠 MastIdea

[Ejemplo online](https://mastidea.notab.es/)

[English](#english) | [Español](#español)

---

<a name="english"></a>

## 🇬🇧 English

**Capture, explore and develop your ideas with the power of AI**

A minimalist application inspired by Einstein that helps you expand your ideas through intelligent conversations. Each idea you capture becomes an AI-guided exploration that helps you see new perspectives, connections, and possibilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Docker](https://img.shields.io/badge/Docker-ready-brightgreen)

### ✨ Features

#### 🎯 Capture and Expansion

- **Minimalist input** to quickly capture ideas
- **6 types of AI expansions**: First exploration, suggestions, questions, connections, use cases, challenges
- **Interactive chat** to dive deeper into each aspect
- **Executive summary** when closing ideas

#### 🌍 Multilingual System (NEW! 🎉)

- **Automatic language detection** from user preference
- **Full support** for Spanish and English
- **AI responds in your language** (prompts, expansions, analysis)
- **Bilingual UI** with instant language switching
- **Date formatting** according to selected language
- **Cookie persistence** (selection saved between sessions)
- **Language switcher** in navbar (ES/EN buttons)

#### 🏷️ Intelligent Tag System (V2.0)

- **AI generates tags automatically** when creating ideas
- **Smart reuse** of existing tags
- **Tag filtering** in ideas gallery
- **Dedicated view** with usage statistics
- **Manual editing**: add, create or delete tags
- **Updated tags** when closing ideas (analyzes complete development)

#### 🕸️ Connection Visualization

- **Interactive graph** showing relationships between ideas
- **Links by shared tags** (thickness = quantity)
- **Scalable nodes** (size = number of expansions)
- **Colors by status** (active/completed/archived)
- **Direct navigation** with node click

#### 📄 Complete Export

- **Export to Markdown** (.md) for sharing
- **Export to PDF** professional with pagination
- **Includes everything**: title, content, tags, all expansions
- **No cost** - client-side generation

#### 📱 PWA - Offline Mode

- **Installable as native app** on mobile and desktop
- **Automatic service worker**
- **Works offline** (upcoming: sync)
- **Smart installation prompt**

#### 🔐 Multi-User Authentication (V2.0)

- **Complete user system** with Clerk
- **Secure authentication** (email, Google, GitHub, etc.)
- **Data isolation** per user
- **Automatic session management**
- **Free plan**: 10,000 active users/month

#### 🤝 Real-Time Collaboration (V2.5 - NEW! 🎉)

- **Share ideas via email invitations** - Invite collaborators to develop ideas together
- **Role-based permissions** - Owner vs Collaborator access control
- **Real-time chat synchronization** - Server-Sent Events (SSE) for live updates
- **Invitation management** - Accept/reject invites with email notifications
- **Collaborative expansions** - All collaborators can chat and expand ideas
- **Owner controls** - Only owners can edit, archive, or delete ideas

#### 🔍 Search (Partial)

- **Qdrant** vector database configured
- Semantic search (embeddings temporarily disabled)
- Text search in interface

#### 📱 Mobile-First Design

- Responsive interface adapted to all devices
- PWA-ready (ready to convert to native app)
- Minimalist theme inspired by Einstein

### 🏗️ Architecture

```
MastIdea
├── Frontend: Next.js 14 + TypeScript + Tailwind CSS
├── Backend: Next.js API Routes
├── Database: PostgreSQL (metadata) + Qdrant (vectors)
├── AI: OpenRouter (LLM models) + OpenAI (embeddings)
└── Infrastructure: Docker + Docker Compose
```

#### Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Vector DB**: Qdrant (semantic search)
- **AI**:
  - OpenRouter API (LLM - Llama 3.1 8B free!)
  - Embeddings: To be implemented with free service
- **Internationalization**: next-intl with cookie persistence
- **Containerization**: Docker + Docker Compose

### 🚀 Quick Start

#### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Account on:
  - [Clerk](https://clerk.com/) (authentication - free plan available)
  - [OpenRouter](https://openrouter.ai/) (for conversational AI AND embeddings)

#### Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd mastidea
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Clerk Authentication (REQUIRED for V2.0)
# 1. Go to https://dashboard.clerk.com
# 2. Create a free application
# 3. Copy keys from dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenRouter (FREE with free models!)
OPENROUTER_API_KEY="sk-or-v1-your-key-here"
OPENROUTER_MODEL="alibaba/tongyi-deepresearch-30b-a3b:free"

# You only need TWO services! Clerk (auth) + OpenRouter (AI)
```

4. **Start Docker containers**

```bash
./dev-start.sh
```

This will start:

- ✅ PostgreSQL on port 5432
- ✅ Qdrant on port 6333 (dashboard: http://localhost:6333/dashboard)
- ✅ Run Prisma migrations automatically

5. **Start the Next.js application**

```bash
npm run dev
```

6. **Open your browser**

```
http://localhost:3000
```

Ready! 🎉 You can start capturing ideas.

#### Stop the environment

```bash
./dev-stop.sh
```

### 📖 Usage

#### 1. Capture an Idea

- Go to the home page
- Write a descriptive title
- Add details about your idea
- Click "Explore this idea with AI"

#### 2. Explore with AI

AI will automatically generate an initial exploration. Then you can:

- 💡 **Suggestions**: Get improvements and complements
- ❓ **Questions**: Receive thought-provoking questions
- 🔗 **Connections**: Discover relationships with other fields
- 🎯 **Use Cases**: See practical applications
- 🧩 **Challenges**: Analyze potential obstacles

#### 3. Find Related Ideas

- Each idea automatically shows similar ideas (semantic search)
- Use search in "My Ideas" to find related concepts

#### 4. Switch Languages

- Click the ES/EN buttons in the navbar
- The entire interface and AI responses will switch to your selected language
- Your preference is saved in a cookie

### 🎨 Customization

#### Change AI Model

Edit `.env` to use other OpenRouter models:

```env
# Budget options:
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"  # FREE
OPENROUTER_MODEL="mistralai/mistral-7b-instruct"          # $0.06/1M tokens
OPENROUTER_MODEL="google/gemini-flash-1.5"                # $0.075/1M tokens

# More powerful options:
OPENROUTER_MODEL="anthropic/claude-3-sonnet"              # $3/1M tokens
OPENROUTER_MODEL="openai/gpt-4o-mini"                     # $0.15/1M tokens
```

#### Modify AI Prompts

Prompts are in `lib/i18n-server.ts` (bilingual) and `lib/openrouter.ts`. You can customize them to adjust tone and style of responses.

### 🐳 Docker

#### Development

```bash
# Start databases
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

#### Production

```bash
# Build and full deploy
docker-compose up -d

# The app will include:
# - PostgreSQL
# - Qdrant
# - Next.js app (production build)
```

### 📊 Project Structure

```
mastidea/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── ideas/          # CRUD for ideas
│   │   │   └── [id]/
│   │   │       └── expand/ # AI expansions
│   │   └── search/         # Semantic search
│   ├── idea/[id]/          # Exploration page
│   ├── ideas/              # Ideas gallery
│   ├── tags/               # Tag management
│   ├── graph/              # Connection visualization
│   └── page.tsx            # Home
├── components/              # React components
│   ├── Navbar.tsx
│   ├── LanguageSwitcher.tsx
│   ├── IdeaCard.tsx
│   ├── ExpansionCard.tsx
│   └── ...
├── lib/                     # Services and utilities
│   ├── prisma.ts           # Prisma client
│   ├── openrouter.ts       # OpenRouter client
│   ├── embeddings.ts       # Embedding generation
│   ├── qdrant.ts           # Qdrant client
│   └── i18n-server.ts      # Multilingual system
├── messages/                # Translations
│   ├── es.json             # Spanish (230+ keys)
│   └── en.json             # English (230+ keys)
├── prisma/                  # Database schema
│   └── schema.prisma
├── types/                   # TypeScript types
└── docker-compose.yml       # Docker configuration
```

### 🔧 Useful Commands

```bash
# Development
npm run dev              # Start Next.js in dev mode
npm run build            # Production build
npm start                # Start production

# Database
npx prisma studio        # Open Prisma Studio (GUI)
npx prisma migrate dev   # Create new migration
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to DB (quick dev)

# Docker
./dev-start.sh           # Start complete environment
./dev-stop.sh            # Stop containers
docker-compose logs -f   # View logs in real time
```

### 🌐 Deployment

#### Vercel + Supabase/Neon (Recommended)

1. **Deploy on Vercel**

```bash
vercel
```

2. **Database**:

   - [Neon](https://neon.tech/) (serverless PostgreSQL - free)
   - [Qdrant Cloud](https://cloud.qdrant.io/) (1GB free)

3. **Configure environment variables on Vercel**

#### Railway / Render

Alternatives that include native Docker:

- [Railway](https://railway.app/)
- [Render](https://render.com/)

### 🔐 Security

⚠️ **Important**: Never commit your API keys!

- The `.env` file is in `.gitignore`
- Use environment variables in production
- Rotate your keys periodically

### 🗺️ Roadmap

#### Version 1.0 (Current)

- ✅ CRUD for ideas
- ✅ AI expansions (6 types)
- ✅ Semantic search
- ✅ Dockerized
- ✅ Responsive minimalist UI

#### Version 2.0 (✅ COMPLETED - 85%)

- [x] **Intelligent tag system with AI** ✅ 100%
  - [x] Tag model in database
  - [x] AI generates tags automatically (reuses existing)
  - [x] UI to display tags on ideas
  - [x] Filter by tags
  - [x] Tags updated when closing idea
  - [x] Clickable tag navigation
  - [x] View all tags (dedicated page)
    - [x] /api/tags endpoint with count
    - [x] /tags page with tag grid
    - [x] Usage statistics
    - [x] Sort by name or usage
  - [x] Manual tag editing
    - [x] TagEditor modal for tag management
    - [x] Add existing tags
    - [x] Create new tags
    - [x] Delete tags from ideas
    - [x] POST/DELETE endpoints for tags
- [x] **Idea graph visualization** ✅ 100%
  - [x] Interactive graph with react-force-graph-2d
  - [x] Nodes = Ideas (size by expansions)
  - [x] Links = Shared tags (thickness by quantity)
  - [x] Colors by status (active/completed/archived)
  - [x] Click node to navigate to idea
  - [x] Connection statistics
- [x] **Export to PDF/Markdown** ✅ 100%
  - [x] Export to Markdown (.md)
  - [x] Export to PDF (jsPDF client-side)
  - [x] Export buttons on idea page
  - [x] Includes title, content, tags and all expansions
- [x] **Offline mode (PWA)** ✅ 95%
  - [x] next-pwa configuration
  - [x] Manifest.json with metadata
  - [x] Automatic service worker
  - [x] Installable as native app
  - [x] InstallPWA component with prompt
  - [ ] Offline sync (requires authentication)
- [x] **Multilingual system (ES/EN)** ✅ 85%
  - [x] next-intl configuration
  - [x] Translation files (230+ keys per language)
  - [x] Cookie-based persistence
  - [x] Language switcher in navbar
  - [x] Backend with bilingual AI prompts
  - [x] Main pages translated (Home, Ideas, Idea detail, Tags)
  - [x] All core components translated
  - [x] Date formatting by language
  - [ ] Remaining secondary pages (Graph, Archived, Evaluate)
- [x] **Multi-user authentication** ✅ 100%
  - [x] Clerk integration
  - [x] Secure authentication (email, Google, GitHub, etc.)
  - [x] Data isolation per user
  - [x] Automatic session management
  - [x] User profile and settings
  - [x] Free plan: 10,000 active users/month
- [ ] **Publicly share ideas** ⏳ 0%
- [ ] **Native app (React Native)** ⏳ 0%

#### Version 2.5 (✅ COMPLETED - 100%)

- [x] **Real-time collaboration system** ✅ 100%
  - [x] Prisma models: IdeaCollaborator and IdeaInvitation
  - [x] Email-based invitation system with Clerk user lookup
  - [x] API endpoints: /api/invitations (GET, POST), /api/invitations/[id]/respond
  - [x] Permission helpers: hasIdeaAccess(), isIdeaOwner(), getIdeaWithAccess()
  - [x] Server-Sent Events (SSE) for real-time chat updates
  - [x] UI components: InvitationNotifications, CollaboratorInvite, CollaboratorList
  - [x] Role-based access control (Owner vs Collaborator)
  - [x] Bilingual support for collaboration features (ES/EN)

#### Version 3.0 (Vision)

- [ ] Advanced collaboration features (email notifications, webhooks)
- [ ] AI with voice (idea dictation)
- [ ] Integration with Notion/Obsidian
- [ ] Creative pattern analysis
- [ ] Gamification of creative process

### 💡 Inspiration

> "Imagination is more important than knowledge. Knowledge is limited, imagination encircles the world."
> — Albert Einstein

This project is born from the belief that we all have brilliant ideas, we just need the right tools to explore them.

### 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) - For democratizing access to LLMs
- [Qdrant](https://qdrant.tech/) - For an incredible open source vector DB
- [Next.js](https://nextjs.org/) - For the best React framework
- Albert Einstein - For inspiring us to think differently

---

<a name="español"></a>

## 🇪🇸 Español

**Captura, explora y desarrolla tus ideas con el poder de la IA**

Una aplicación minimalista inspirada en Einstein que te ayuda a expandir tus ideas mediante conversaciones inteligentes. Cada idea que captures se convierte en una exploración guiada por IA que te ayuda a ver nuevas perspectivas, conexiones y posibilidades.

### ✨ Características

#### 🎯 Captura y Expansión

- **Input minimalista** para capturar ideas rápidamente
- **6 tipos de expansiones con IA**: Primera exploración, sugerencias, preguntas, conexiones, casos de uso, desafíos
- **Chat interactivo** para profundizar en cada aspecto
- **Resumen ejecutivo** al cerrar ideas

#### 🌍 Sistema Multilenguaje (¡NUEVO! 🎉)

- **Detección automática de idioma** desde preferencia del usuario
- **Soporte completo** para español e inglés
- **IA responde en tu idioma** (prompts, expansiones, análisis)
- **UI bilingüe** con cambio instantáneo de idioma
- **Formato de fechas** según idioma seleccionado
- **Persistencia en cookie** (selección guardada entre sesiones)
- **Selector de idioma** en navbar (botones ES/EN)

#### 🏷️ Sistema de Tags Inteligente (V2.0)

- **IA genera tags automáticamente** al crear ideas
- **Reutilización inteligente** de tags existentes
- **Filtrado por tags** en galería de ideas
- **Vista dedicada** con estadísticas de uso
- **Edición manual**: añadir, crear o eliminar tags
- **Tags actualizados** al cerrar ideas (analiza desarrollo completo)

#### 🕸️ Visualización de Conexiones

- **Grafo interactivo** que muestra relaciones entre ideas
- **Enlaces por tags compartidos** (grosor = cantidad)
- **Nodos escalables** (tamaño = número de expansiones)
- **Colores por estado** (activa/completada/archivada)
- **Navegación directa** con click en nodos

#### 📄 Exportación Completa

- **Exportar a Markdown** (.md) para compartir
- **Exportar a PDF** profesional con paginación
- **Incluye todo**: título, contenido, tags, todas las expansiones
- **Sin costo** - generación del lado del cliente

#### 📱 PWA - Modo Offline

- **Instalable como app nativa** en móvil y escritorio
- **Service Worker** automático
- **Funciona offline** (próximo: sincronización)
- **Prompt de instalación** inteligente

#### 🔐 Autenticación Multi-Usuario (V2.0)

- **Sistema completo de usuarios** con Clerk
- **Autenticación segura** (email, Google, GitHub, etc.)
- **Aislamiento de datos** por usuario
- **Gestión de sesiones** automática
- **Plan gratuito**: 10,000 usuarios activos/mes

#### 🤝 Colaboración en Tiempo Real (V2.5 - ¡NUEVO! 🎉)

- **Comparte ideas con invitaciones por email** - Invita colaboradores a desarrollar ideas juntos
- **Permisos basados en roles** - Control de acceso Owner vs Collaborator
- **Sincronización de chat en tiempo real** - Server-Sent Events (SSE) para actualizaciones en vivo
- **Gestión de invitaciones** - Acepta/rechaza invites con notificaciones por email
- **Expansiones colaborativas** - Todos los colaboradores pueden chatear y expandir ideas
- **Controles del dueño** - Solo los dueños pueden editar, archivar o eliminar ideas

#### 🔍 Búsqueda (Parcial)

- Base vectorial **Qdrant** configurada
- Búsqueda semántica (embeddings deshabilitados temporalmente)
- Búsqueda por texto en interfaz

#### 📱 Diseño Mobile-First

- Interfaz responsive adaptada a todos los dispositivos
- PWA-ready (listo para convertir en app nativa)
- Tema minimalista inspirado en Einstein

### 🏗️ Arquitectura

```
MastIdea
├── Frontend: Next.js 14 + TypeScript + Tailwind CSS
├── Backend: Next.js API Routes
├── Base de Datos: PostgreSQL (metadata) + Qdrant (vectores)
├── IA: OpenRouter (modelos LLM) + OpenAI (embeddings)
└── Infraestructura: Docker + Docker Compose
```

#### Stack Tecnológico

- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Vector DB**: Qdrant (búsqueda semántica)
- **IA**:
  - OpenRouter API (LLM - Llama 3.1 8B gratis!)
  - Embeddings: Por implementar con servicio gratuito
- **Internacionalización**: next-intl con persistencia en cookies
- **Containerización**: Docker + Docker Compose

### 🚀 Inicio Rápido

#### Prerrequisitos

- Node.js 18+ y npm
- Docker y Docker Compose
- Cuenta en:
  - [Clerk](https://clerk.com/) (autenticación - plan gratuito disponible)
  - [OpenRouter](https://openrouter.ai/) (para IA conversacional Y embeddings)

#### Instalación

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

Edita `.env` y agrega tus API keys:

```env
# Clerk Authentication (REQUERIDO para V2.0)
# 1. Ve a https://dashboard.clerk.com
# 2. Crea una aplicación gratuita
# 3. Copia las keys desde el dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenRouter (GRATIS con modelos free!)
OPENROUTER_API_KEY="sk-or-v1-tu-key-aqui"
OPENROUTER_MODEL="alibaba/tongyi-deepresearch-30b-a3b:free"

# ¡Solo necesitas DOS servicios! Clerk (auth) + OpenRouter (IA)
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

#### Detener el entorno

```bash
./dev-stop.sh
```

### 📖 Uso

#### 1. Captura una Idea

- Ve a la página principal
- Escribe un título descriptivo
- Añade detalles sobre tu idea
- Haz clic en "Explorar esta idea con IA"

#### 2. Explora con IA

La IA generará automáticamente una primera exploración. Luego puedes:

- 💡 **Sugerencias**: Obtén mejoras y complementos
- ❓ **Preguntas**: Recibe preguntas provocadoras
- 🔗 **Conexiones**: Descubre relaciones con otros campos
- 🎯 **Casos de uso**: Ve aplicaciones prácticas
- 🧩 **Desafíos**: Analiza obstáculos potenciales

#### 3. Encuentra Ideas Relacionadas

- Cada idea muestra automáticamente ideas similares (búsqueda semántica)
- Usa la búsqueda en "Mis Ideas" para encontrar conceptos relacionados

#### 4. Cambia de Idioma

- Haz clic en los botones ES/EN en la barra de navegación
- Toda la interfaz y las respuestas de la IA cambiarán a tu idioma seleccionado
- Tu preferencia se guarda en una cookie

### 🎨 Personalización

#### Cambiar el Modelo de IA

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

#### Modificar Prompts de IA

Los prompts están en `lib/i18n-server.ts` (bilingües) y `lib/openrouter.ts`. Puedes personalizarlos para ajustar el tono y estilo de las respuestas.

### 🐳 Docker

#### Desarrollo

```bash
# Iniciar bases de datos
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener
docker-compose -f docker-compose.dev.yml down
```

#### Producción

```bash
# Build y deploy completo
docker-compose up -d

# La app incluirá:
# - PostgreSQL
# - Qdrant
# - Next.js app (production build)
```

### 📊 Estructura del Proyecto

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
│   ├── tags/               # Gestión de tags
│   ├── graph/              # Visualización de conexiones
│   └── page.tsx            # Home
├── components/              # Componentes React
│   ├── Navbar.tsx
│   ├── LanguageSwitcher.tsx
│   ├── IdeaCard.tsx
│   ├── ExpansionCard.tsx
│   └── ...
├── lib/                     # Servicios y utilidades
│   ├── prisma.ts           # Cliente de Prisma
│   ├── openrouter.ts       # Cliente de OpenRouter
│   ├── embeddings.ts       # Generación de embeddings
│   ├── qdrant.ts           # Cliente de Qdrant
│   └── i18n-server.ts      # Sistema multilenguaje
├── messages/                # Traducciones
│   ├── es.json             # Español (230+ claves)
│   └── en.json             # Inglés (230+ claves)
├── prisma/                  # Schema de base de datos
│   └── schema.prisma
├── types/                   # TypeScript types
└── docker-compose.yml       # Configuración Docker
```

### 🔧 Comandos Útiles

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

# App de Escritorio (Linux)
./build-desktop.sh       # Genera AppImage (recomendado para Arch)
./build-desktop.sh deb   # Genera paquete DEB
```

### 🌐 Deployment

#### Vercel + Supabase/Neon (Recomendado)

1. **Deploy en Vercel**

```bash
vercel
```

2. **Base de datos**:

   - [Neon](https://neon.tech/) (PostgreSQL serverless - gratis)
   - [Qdrant Cloud](https://cloud.qdrant.io/) (1GB gratis)

3. **Configura variables de entorno en Vercel**

#### Railway / Render

Alternativas que incluyen Docker nativo:

- [Railway](https://railway.app/)
- [Render](https://render.com/)

#### App de Escritorio (Linux)

Genera una aplicación de escritorio nativa para Linux usando [Pake](https://github.com/tw93/Pake):

**Requisitos previos (ArchLinux):**

```bash
# Instalar dependencias del sistema
sudo pacman -S webkit2gtk base-devel libayatana-appindicator

# Instalar Pake CLI globalmente
pnpm install -g pake-cli
```

**Generar la app:**

```bash
# Opción 1: AppImage (recomendado para Arch)
./build-desktop.sh

# Opción 2: Paquete DEB (convertible a pkg.tar.zst con debtap)
./build-desktop.sh deb
```

El script te guiará para elegir:

- **Servidor local** (http://localhost:3000) - Para pruebas rápidas
- **URL de producción** - Para la versión final
- **Archivos estáticos** - Empaqueta el build de Next.js

**Ejecutar la app:**

```bash
# AppImage
chmod +x ./desktop-builds/Mastidea*.AppImage
./desktop-builds/Mastidea*.AppImage

# DEB (convertir primero con debtap en Arch)
debtap ./desktop-builds/Mastidea*.deb
sudo pacman -U Mastidea*.pkg.tar.zst
```

**Características de la app de escritorio:**

- 📦 ~5MB de tamaño (vs ~150MB de Electron)
- 🚀 Rendimiento nativo con Tauri
- 🎨 Icono y nombre personalizados
- 🔔 Bandeja del sistema
- 🖥️ Ventana sin barra de título
- ⌨️ Atajos de teclado nativos

### 🔐 Seguridad

⚠️ **Importante**: ¡Nunca comitees tus API keys!

- El archivo `.env` está en `.gitignore`
- Usa variables de entorno en producción
- Rota tus keys periódicamente

### 🗺️ Roadmap

#### Versión 1.0 (Actual)

- ✅ CRUD de ideas
- ✅ Expansiones con IA (6 tipos)
- ✅ Búsqueda semántica
- ✅ Dockerizado
- ✅ UI minimalista responsive

#### Versión 2.0 (✅ COMPLETADA - 85%)

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
- [x] **Sistema multilenguaje (ES/EN)** ✅ 85%
  - [x] Configuración de next-intl
  - [x] Archivos de traducción (230+ claves por idioma)
  - [x] Persistencia basada en cookies
  - [x] Selector de idioma en navbar
  - [x] Backend con prompts de IA bilingües
  - [x] Páginas principales traducidas (Home, Ideas, Detalle de idea, Tags)
  - [x] Todos los componentes principales traducidos
  - [x] Formato de fechas por idioma
  - [ ] Páginas secundarias pendientes (Graph, Archived, Evaluate)
- [x] **Autenticación multi-usuario** ✅ 100%
  - [x] Integración con Clerk
  - [x] Autenticación segura (email, Google, GitHub, etc.)
  - [x] Aislamiento de datos por usuario
  - [x] Gestión automática de sesiones
  - [x] Perfil de usuario y configuración
  - [x] Plan gratuito: 10,000 usuarios activos/mes
- [ ] **Compartir ideas públicamente** ⏳ 0%
- [ ] **App nativa (React Native)** ⏳ 0%

#### Versión 2.5 (✅ COMPLETADA - 100%)

- [x] **Sistema de colaboración en tiempo real** ✅ 100%
  - [x] Modelos Prisma: IdeaCollaborator e IdeaInvitation
  - [x] Sistema de invitaciones por email con búsqueda de usuarios Clerk
  - [x] Endpoints API: /api/invitations (GET, POST), /api/invitations/[id]/respond
  - [x] Helpers de permisos: hasIdeaAccess(), isIdeaOwner(), getIdeaWithAccess()
  - [x] Server-Sent Events (SSE) para actualizaciones de chat en tiempo real
  - [x] Componentes UI: InvitationNotifications, CollaboratorInvite, CollaboratorList
  - [x] Control de acceso basado en roles (Owner vs Collaborator)
  - [x] Soporte bilingüe para funciones de colaboración (ES/EN)

#### Versión 3.0 (Visión)

- [ ] Funciones avanzadas de colaboración (notificaciones por email, webhooks)
- [ ] IA con voz (dictado de ideas)
- [ ] Integración con Notion/Obsidian
- [ ] Análisis de patrones creativos
- [ ] Gamificación del proceso creativo

### 💡 Inspiración

> "La imaginación es más importante que el conocimiento. El conocimiento es limitado, la imaginación circunda el mundo."
> — Albert Einstein

Este proyecto nace de la creencia de que todos tenemos ideas brillantes, solo necesitamos las herramientas adecuadas para explorarlas.

### 🙏 Agradecimientos

- [OpenRouter](https://openrouter.ai/) - Por democratizar el acceso a LLMs
- [Qdrant](https://qdrant.tech/) - Por una vector DB open source increíble
- [Next.js](https://nextjs.org/) - Por el mejor framework de React
- Albert Einstein - Por inspirarnos a pensar diferente

---

**Made with 🧠 and ❤️**

_"Not everything that counts can be counted, and not everything that can be counted counts." - Einstein_
