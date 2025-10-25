import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ideas/[id]/status - Obtiene el estado de procesamiento de IA de una idea
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const idea = await prisma.idea.findUnique({
      where: { 
        id,
        userId,
      },
      select: {
        aiProcessingStatus: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ aiProcessingStatus: idea.aiProcessingStatus });
  } catch (error) {
    console.error('Error obteniendo estado de IA:', error);
    return NextResponse.json(
      { error: 'Error al obtener el estado' },
      { status: 500 }
    );
  }
}
