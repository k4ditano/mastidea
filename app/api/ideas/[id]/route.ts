import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { qdrantService } from '@/lib/qdrant';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/ideas/[id] - Obtiene una idea por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const idea = await prisma.idea.findFirst({
      where: { id, userId },
      include: {
        expansions: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    // Buscar ideas similares
    let similarIdeas: Array<{
      id: string;
      title: string;
      content: string;
      score: number;
      createdAt: string;
    }> = [];
    try {
      const similar = await qdrantService.findSimilarIdeas(
        `${idea.title}\n\n${idea.content}`,
        3,
        idea.id
      );
      similarIdeas = similar;
    } catch (error) {
      console.error('Error buscando ideas similares:', error);
    }

    return NextResponse.json({
      ...idea,
      similarIdeas,
    });
  } catch (error) {
    console.error('Error obteniendo idea:', error);
    return NextResponse.json(
      { error: 'Error al obtener la idea' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ideas/[id] - Elimina una idea
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    
    // Verificar que la idea pertenece al usuario
    const idea = await prisma.idea.findFirst({
      where: { id, userId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    await prisma.idea.delete({
      where: { id },
    });

    // Eliminar de Qdrant
    try {
      await qdrantService.deleteIdea(id);
    } catch (error) {
      console.error('Error eliminando de Qdrant:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando idea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la idea' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ideas/[id] - Actualiza una idea (archivar/desarchivar)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Verificar que la idea pertenece al usuario
    const existingIdea = await prisma.idea.findFirst({
      where: { id, userId },
    });

    if (!existingIdea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    const idea = await prisma.idea.update({
      where: { id },
      data: { status },
      include: {
        expansions: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error actualizando idea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la idea' },
      { status: 500 }
    );
  }
}
