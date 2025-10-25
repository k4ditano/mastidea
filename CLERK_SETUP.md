# 🔐 Guía de Configuración de Clerk

## Paso 1: Crear cuenta en Clerk

1. Ve a [https://clerk.com](https://clerk.com)
2. Haz clic en "Start building for free"
3. Regístrate con tu email, Google o GitHub
4. Verifica tu email si es necesario

## Paso 2: Crear una aplicación

1. En el dashboard de Clerk, haz clic en "Create application"
2. Nombre de la aplicación: **MastIdea** (o el que prefieras)
3. Selecciona los métodos de autenticación:
   - ✅ Email (recomendado)
   - ✅ Google (opcional pero recomendado)
   - ✅ GitHub (opcional)
   - Puedes agregar más después
4. Haz clic en "Create application"

## Paso 3: Obtener las API Keys

Una vez creada la aplicación:

1. En el menú lateral izquierdo, ve a **"API Keys"**
2. Copia las siguientes keys:

### Publishable Key
```
Empieza con: pk_test_...
```

### Secret Key  
```
Empieza con: sk_test_...
```

⚠️ **IMPORTANTE**: Nunca compartas tu Secret Key públicamente ni la subas a Git

## Paso 4: Configurar el archivo .env

Abre el archivo `.env` en la raíz del proyecto y actualiza estas líneas:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_TU_KEY_AQUI"
CLERK_SECRET_KEY="sk_test_TU_KEY_AQUI"
```

Reemplaza `TU_KEY_AQUI` con las keys que copiaste del dashboard.

## Paso 5: Configurar URLs permitidas (desarrollo)

En el dashboard de Clerk:

1. Ve a **"Paths"** en el menú lateral
2. Asegúrate de que estas URLs estén permitidas:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - Home URL: `/`

3. Ve a **"Domains"** 
4. Agrega tu dominio de desarrollo: `http://localhost:3000`

## Paso 6: Reiniciar la aplicación

Si Next.js ya estaba corriendo:

```bash
# Detener el servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

## Paso 7: Probar la autenticación

1. Abre [http://localhost:3000](http://localhost:3000)
2. Haz clic en "Iniciar sesión" en la navbar
3. Crea una cuenta de prueba
4. ¡Deberías ver tu avatar en la navbar!

## 🎉 ¡Listo!

Ya tienes autenticación multi-usuario funcionando. Ahora:

- Cada usuario verá solo sus propias ideas
- Los datos están completamente aislados
- Clerk maneja: registro, login, recuperación de contraseña, gestión de perfil

## 📊 Plan Gratuito de Clerk

- ✅ 10,000 usuarios activos mensuales
- ✅ Autenticación social ilimitada
- ✅ Soporte por email
- ✅ Sin tarjeta de crédito requerida

## 🔧 Configuración Avanzada (Opcional)

### Personalizar aspecto

En el dashboard de Clerk → **"Customization"** → **"Theme"**:
- Cambiar colores del formulario
- Agregar tu logo
- Personalizar textos

### Agregar más proveedores

En **"User & Authentication"** → **"Social Connections"**:
- Microsoft
- Apple  
- Discord
- Twitter
- Y más...

### Webhooks (para eventos)

Si necesitas ejecutar código cuando un usuario se registra/elimina:
1. Ve a **"Webhooks"**
2. Crea un nuevo webhook
3. Selecciona eventos: `user.created`, `user.deleted`, etc.

## ⚠️ Producción

Cuando despliegues a producción:

1. En Clerk, ve a **"Domains"**
2. Agrega tu dominio de producción: `https://tudominio.com`
3. Actualiza las variables de entorno en tu servidor de producción
4. Las keys de test (`pk_test_...`) funcionan para desarrollo
5. Para producción, considera actualizar a keys de producción (`pk_live_...`)

## 🆘 Solución de Problemas

### Error: "Clerk: Missing publishable key"
- Verifica que `.env` tenga `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Reinicia el servidor de desarrollo

### Error: "Clerk: Missing secret key"
- Verifica que `.env` tenga `CLERK_SECRET_KEY`
- Reinicia el servidor

### No veo el botón de login
- Asegúrate de que el servidor esté corriendo
- Limpia el caché del navegador (Ctrl+Shift+R)
- Verifica que no haya errores en la consola del navegador

### Las ideas antiguas no aparecen
Las ideas creadas antes de implementar autenticación tienen `userId = 'user_migration_default'`.

Para asignarlas a tu usuario:
1. Ve a PostgreSQL
2. Ejecuta: 
```sql
UPDATE "Idea" 
SET "userId" = 'TU_USER_ID_DE_CLERK' 
WHERE "userId" = 'user_migration_default';
```

Para obtener tu User ID de Clerk:
- Inicia sesión
- Abre la consola del navegador (F12)
- En la pestaña Network, busca cualquier request a `/api/ideas`
- En los headers, verás el userId

## 📚 Recursos

- [Documentación oficial de Clerk](https://clerk.com/docs)
- [Clerk + Next.js App Router](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Components](https://clerk.com/docs/components/overview)
- [Dashboard de Clerk](https://dashboard.clerk.com)
