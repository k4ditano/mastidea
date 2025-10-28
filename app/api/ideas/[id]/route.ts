import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { qdrantService } from '@/lib/qdrant';
import { auth } from '@clerk/nextjs/server';
import { getIdeaWithAccess, isIdeaOwner } from '@/lib/ideaPermissions';

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
    
    // Usar la función de permisos que incluye colaboradores
    const idea = await getIdeaWithAccess(id, userId);

    if (!idea || idea.deletedAt) {
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
 * DELETE /api/ideas/[id] - Mueve idea a papelera (soft delete)
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
    
    // Solo el propietario puede eliminar
    if (!(await isIdeaOwner(id, userId))) {
      return NextResponse.json(
        { error: 'Solo el propietario puede eliminar la idea' },
        { status: 403 }
      );
    }

    // Marcar como eliminada (soft delete) en lugar de borrar
    await prisma.idea.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'ARCHIVED',
      },
    });

    return NextResponse.json({ success: true, message: 'Idea movida a papelera' });
  } catch (error) {
    console.error('Error moviendo idea a papelera:', error);
    return NextResponse.json(
      { error: 'Error al mover la idea a papelera' },
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

    // Solo el propietario puede cambiar el estado
    if (!(await isIdeaOwner(id, userId))) {
      return NextResponse.json(
        { error: 'Solo el propietario puede cambiar el estado de la idea' },
        { status: 403 }
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
