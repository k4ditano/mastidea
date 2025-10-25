import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/ideas/[id]/reopen - Reabre una idea completada para seguir trabajando
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que la idea existe y pertenece al usuario
    const idea = await prisma.idea.findFirst({
      where: { 
        id, 
        userId,
        deletedAt: null,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    if (idea.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Solo se pueden reabrir ideas completadas' },
        { status: 400 }
      );
    }

    // Reabrir la idea (volver a estado ACTIVE)
    const reopenedIdea = await prisma.idea.update({
      where: { id },
      data: { 
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
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

    return NextResponse.json({
      success: true,
      message: 'Idea reabierta. Puedes seguir expandiéndola.',
      idea: reopenedIdea,
    });
  } catch (error) {
    console.error('Error reabriendo idea:', error);
    return NextResponse.json(
      { error: 'Error al reabrir la idea' },
      { status: 500 }
    );
  }
}
