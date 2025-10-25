# Sistema de Papelera (Soft Delete)

## Descripción

Las ideas descartadas no se eliminan inmediatamente. En su lugar, se mueven a una "papelera" temporal donde permanecen durante 30 días antes de ser eliminadas permanentemente.

## Características

- ✅ **Soft Delete**: Las ideas descartadas se marcan con `deletedAt` en lugar de borrarse
- ✅ **Retención de 30 días**: Las ideas permanecen recuperables durante un mes
- ✅ **Limpieza automática**: Script para eliminar ideas antiguas de la papelera
- ✅ **Filtrado automático**: Las ideas en papelera no aparecen en listados normales

## Flujo del Sistema

### 1. Descarte de Idea

Cuando un usuario descarta una idea:

```typescript
// DELETE /api/ideas/[id]
await prisma.idea.update({
  where: { id },
  data: {
    deletedAt: new Date(),
    status: 'ARCHIVED',
  },
});
```

La idea:
- Se marca con fecha de descarte (`deletedAt`)
- Cambia su estado a `ARCHIVED`
- NO se elimina de la base de datos

### 2. Filtrado Automático

Todos los endpoints GET filtran automáticamente ideas eliminadas:

```typescript
// GET /api/ideas
where: {
  userId,
  deletedAt: null, // Solo ideas activas
}
```

Las ideas en papelera:
- No aparecen en `/ideas`
- No aparecen en `/tags`
- No aparecen en búsquedas
- No se cuentan en estadísticas

### 3. Limpieza Automática

Después de 30 días, las ideas se eliminan permanentemente:

```typescript
// Script de limpieza
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

await prisma.idea.deleteMany({
  where: {
    deletedAt: {
      not: null,
      lt: thirtyDaysAgo,
    },
  },
});
```

## Endpoints

### DELETE /api/ideas/[id]
Mueve una idea a la papelera (soft delete).

**Respuesta:**
```json
{
  "success": true,
  "message": "Idea movida a papelera"
}
```

### GET /api/ideas/cleanup
Obtiene información sobre ideas pendientes de limpieza.

**Respuesta:**
```json
{
  "totalInTrash": 5,
  "pendingDeletion": 2,
  "ideas": [
    {
      "id": "...",
      "title": "...",
      "deletedAt": "2024-10-01T...",
      "userId": "..."
    }
  ]
}
```

### DELETE /api/ideas/cleanup
Elimina permanentemente ideas descartadas hace más de 30 días.

**Respuesta:**
```json
{
  "success": true,
  "message": "2 ideas eliminadas permanentemente",
  "deleted": 2,
  "ideas": [...]
}
```

## Scripts

### Limpieza Manual

Ejecutar el script de limpieza manualmente:

```bash
npx tsx scripts/cleanup-trash.ts
```

Este script:
1. Busca ideas eliminadas hace más de 30 días
2. Las elimina de Qdrant (vector database)
3. Las elimina de PostgreSQL
4. Muestra un resumen de las operaciones

### Cron Job (Opcional)

Para automatizar la limpieza, configura un cron job:

```bash
# Ejecutar todos los días a las 3:00 AM
0 3 * * * cd /path/to/mastidea && npx tsx scripts/cleanup-trash.ts
```

O usando el API endpoint:

```bash
# Ejecutar todos los días a las 3:00 AM
0 3 * * * curl -X DELETE https://tu-dominio.com/api/ideas/cleanup
```

## Base de Datos

### Campo deletedAt

```prisma
model Idea {
  // ...otros campos
  deletedAt  DateTime?  // Fecha de descarte (papelera temporal)
  
  @@index([deletedAt])  // Índice para consultas eficientes
}
```

- `null`: Idea activa
- `DateTime`: Idea en papelera (se eliminará después de 30 días)

### Migración

```sql
-- Migration: 20251024224714_add_deleted_at_for_trash
ALTER TABLE "Idea" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "Idea_deletedAt_idx" ON "Idea"("deletedAt");
```

## Ventajas

1. **Recuperación**: Los usuarios pueden contactar soporte para recuperar ideas descartadas accidentalmente (durante 30 días)
2. **Seguridad**: Previene pérdida de datos por errores de usuario
3. **Rendimiento**: Índice en `deletedAt` permite consultas eficientes
4. **Limpieza**: Eliminación automática evita acumulación de datos basura
5. **Privacidad**: Datos antiguos se eliminan automáticamente

## Consideraciones

- **Espacio en disco**: Ideas en papelera ocupan espacio durante 30 días
- **GDPR**: Cumple con derecho al olvido (eliminación definitiva después de 30 días)
- **Costo**: Qdrant y PostgreSQL almacenan datos temporalmente

## Futuras Mejoras

- [ ] Página de papelera en el UI para ver/restaurar ideas
- [ ] Configurar período de retención por usuario
- [ ] Notificación antes de eliminación permanente
- [ ] Exportar ideas antes de eliminar definitivamente
