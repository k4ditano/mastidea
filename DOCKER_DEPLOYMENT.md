# 🐳 MastIdea Docker Deployment

## Status ✅
Tu proyecto **MastIdea** está corriendo exitosamente en Docker con las siguientes instancias:

### Contenedores Activos
- **mastidea-app** (Puerto 3002) - Aplicación Next.js
- **mastidea-postgres** (Puerto 5433) - Base de datos PostgreSQL
- **mastidea-qdrant** (Puertos 6333-6334) - Base de datos vectorial

## 🚀 Acceso

| Servicio | URL | Usuario |
|----------|-----|---------|
| **MastIdea Web** | http://localhost:3002 | - |
| **Qdrant Dashboard** | http://localhost:6333/dashboard | - |
| **PostgreSQL** | localhost:5433 | mastidea / mastidea_password_2025 |

## ⚙️ Configuración Requerida

Tu archivo `.env` necesita las siguientes API keys para funcionar:

```bash
# OpenRouter API (LLM - Large Language Model)
OPENROUTER_API_KEY="sk-or-v1-YOUR-KEY-HERE"
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"

# OpenAI API (para embeddings)
OPENAI_API_KEY="sk-YOUR-KEY-HERE"
```

### Obtener las API Keys

1. **OpenRouter** (LLM gratis):
   - Ve a https://openrouter.ai/keys
   - Copia tu API key
   - Usa el modelo gratuito: `meta-llama/llama-3.1-8b-instruct:free`

2. **OpenAI** (Embeddings económico):
   - Ve a https://platform.openai.com/api-keys
   - Copia tu API key
   - Costo muy bajo (~$0.0001 por 1000 tokens)

## 📝 Comandos Útiles

### Ver estado de los contenedores
```bash
cd /root/mastidea && docker-compose ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f app        # Logs de la aplicación
docker-compose logs -f postgres   # Logs de PostgreSQL
docker-compose logs -f qdrant     # Logs de Qdrant
```

### Parar los servicios
```bash
cd /root/mastidea && docker-compose stop
```

### Reiniciar los servicios
```bash
cd /root/mastidea && docker-compose restart
```

### Detener y limpiar todo
```bash
cd /root/mastidea && docker-compose down
```

### Ver datos de PostgreSQL
```bash
docker exec -it mastidea-postgres psql -U mastidea -d mastidea
```

## 🔧 Configuración Actual

- **Puerto App**: 3002 (evita conflicto con otras aplicaciones)
- **Puerto DB**: 5433 (evita conflicto con PostgreSQL local)
- **Base de Datos**: mastidea
- **Network**: mastidea-network (aislada)

## 📂 Archivos Importantes

- `/root/mastidea/.env` - Variables de entorno (incluye API keys)
- `/root/mastidea/docker-compose.yml` - Configuración de contenedores
- `/root/mastidea/Dockerfile` - Build de la aplicación

## ⚠️ Notas Importantes

1. **Las otras aplicaciones no se vieron afectadas**: Filmly (puerto 3001) e Hin2Rod (puerto 8080) siguen funcionando normalmente.

2. **Volúmenes persistentes**: Los datos de PostgreSQL y Qdrant se guardan en volúmenes Docker, así que persisten entre reinicios.

3. **Variables de entorno**: Actualiza el `.env` con tus claves reales de API. Sin ellas, la IA no funcionará.

## 🆘 Solución de Problemas

### La app no responde
```bash
docker-compose logs app | tail -50
```

### PostgreSQL no conecta
```bash
docker exec -it mastidea-postgres psql -U mastidea -d mastidea -c "SELECT 1"
```

### Qdrant no disponible
```bash
curl -s http://localhost:6333/healthz
```

## 🎯 Próximos Pasos

1. Añade tus API keys en `.env`
2. Accede a http://localhost:3002
3. Prueba creando una idea
4. Verifica que la IA genere expansiones correctamente

---
**Desplegado**: 2025-10-26
**Stack**: Next.js 16 + PostgreSQL 16 + Qdrant + OpenRouter + OpenAI
