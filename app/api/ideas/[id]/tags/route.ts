import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/ideas/[id]/tags
 * Añade un tag a una idea
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { tagId } = await request.json();
    const { id } = await params;

    if (!tagId) {
      return NextResponse.json(
        { error: 'El tagId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la idea existe y pertenece al usuario
    const idea = await prisma.idea.findFirst({
      where: { id, userId }
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el tag existe
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya existe la relación
    const existing = await prisma.ideaTag.findUnique({
      where: {
        ideaId_tagId: {
          ideaId: id,
          tagId: tagId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'El tag ya está asignado a esta idea' },
        { status: 400 }
      );
    }

    // Crear relación
    await prisma.ideaTag.create({
      data: {
        ideaId: id,
        tagId: tagId
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
    console.error('Error adding tag to idea:', error);
    return NextResponse.json(
      { error: 'Error al añadir el tag' },
      { status: 500 }
    );
  }
}
