import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { qdrantService } from '@/lib/qdrant';

/**
 * DELETE /api/ideas/cleanup - Elimina permanentemente ideas descartadas hace más de 30 días
 * Este endpoint puede ser llamado por un cron job o manualmente
 */
export async function DELETE() {
  try {
    // Calcular fecha límite (30 días atrás)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
      },
    });

    if (ideasToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay ideas para limpiar',
        deleted: 0,
      });
    }

    // Eliminar de Qdrant y de la base de datos
    for (const deletedIdea of ideasToDelete) {
      try {
        await qdrantService.deleteIdea(deletedIdea.id);
      } catch (error) {
        console.error(`Error eliminando de Qdrant idea ${deletedIdea.id}:`, error);
      }
    }

    // Eliminar de la base de datos
    const result = await prisma.idea.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lt: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} ideas eliminadas permanentemente`,
      deleted: result.count,
      ideas: ideasToDelete,
    });
  } catch (error) {
    console.error('Error en cleanup de ideas:', error);
    return NextResponse.json(
      { error: 'Error al limpiar ideas antiguas' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ideas/cleanup - Obtiene información sobre ideas pendientes de limpieza
 */
export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
        userId: true,
      },
    });

    const ideasInTrash = await prisma.idea.count({
      where: {
        deletedAt: {
          not: null,
        },
      },
    });

    return NextResponse.json({
      totalInTrash: ideasInTrash,
      pendingDeletion: ideasToDelete.length,
      ideas: ideasToDelete,
    });
  } catch (error) {
    console.error('Error obteniendo info de cleanup:', error);
    return NextResponse.json(
      { error: 'Error al obtener información de limpieza' },
      { status: 500 }
    );
  }
}
