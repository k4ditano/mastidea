import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * DELETE /api/ideas/[id]/tags/[tagId]
 * Elimina un tag de una idea
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id, tagId } = await params;

    // Verificar que la idea pertenece al usuario
    const idea = await prisma.idea.findFirst({
      where: { id, userId }
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la relación existe
    const existing = await prisma.ideaTag.findUnique({
      where: {
        ideaId_tagId: {
          ideaId: id,
          tagId: tagId
        }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'El tag no está asignado a esta idea' },
        { status: 404 }
      );
    }

    // Eliminar relación
    await prisma.ideaTag.delete({
      where: {
        ideaId_tagId: {
          ideaId: id,
          tagId: tagId
        }
      }
    });

    // Obtener idea actualizada
    const updatedIdea = await prisma.idea.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return NextResponse.json({ idea: updatedIdea });
  } catch (error) {
    console.error('Error removing tag from idea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el tag' },
      { status: 500 }
    );
  }
}
