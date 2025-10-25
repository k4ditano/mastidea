/**
 * Script para limpiar ideas descartadas hace más de 30 días
 * Puede ejecutarse manualmente o como cron job
 * 
 * Uso: npx tsx scripts/cleanup-trash.ts
 */

import { prisma } from '../lib/prisma';
import { qdrantService } from '../lib/qdrant';

async function cleanupTrash() {
  console.log('🗑️ Iniciando limpieza de papelera...');
  
  try {
    // Calcular fecha límite (30 días atrás)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`📅 Buscando ideas eliminadas antes del: ${thirtyDaysAgo.toLocaleDateString()}`);

    // Encontrar ideas para eliminar permanentemente
    const ideasToDelete = await prisma.idea.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
        title: true,
        deletedAt: true,
      },
    });

    if (ideasToDelete.length === 0) {
      console.log('✅ No hay ideas para limpiar');
      return;
    }

    console.log(`📋 Encontradas ${ideasToDelete.length} ideas para eliminar:`);
    for (const idea of ideasToDelete) {
      console.log(`  - ${idea.title} (eliminada el ${idea.deletedAt?.toLocaleDateString()})`);
    }

    // Eliminar de Qdrant
    console.log('\n🔄 Eliminando de Qdrant...');
    for (const idea of ideasToDelete) {
      try {
        await qdrantService.deleteIdea(idea.id);
        console.log(`  ✓ ${idea.title}`);
      } catch (error) {
        console.error(`  ✗ Error en ${idea.title}:`, error);
      }
    }

    // Eliminar de la base de datos
    console.log('\n🔄 Eliminando de la base de datos...');
    const result = await prisma.idea.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`\n✅ Limpieza completada: ${result.count} ideas eliminadas permanentemente`);
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupTrash()
    .then(() => {
      console.log('\n✨ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export { cleanupTrash };
