import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { qdrantService } from '@/lib/qdrant';
import { ExpansionType } from '@/types';

/**
 * POST /api/ideas/[id]/fork - Crea una copia (fork) de una idea existente
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
    const body = await request.json();
    const { includeExpansions = false } = body;

    // Obtener la idea original
    const originalIdea = await prisma.idea.findFirst({
      where: { 
        id, 
        userId,
        deletedAt: null,
      },
      include: {
        expansions: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!originalIdea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    // Crear la nueva idea (fork)
    const forkedIdea = await prisma.idea.create({
      data: {
        userId,
        title: `${originalIdea.title} (copia)`,
        content: originalIdea.content,
        status: 'ACTIVE', // Siempre comienza como activa
      },
    });

    // Copiar tags
    if (originalIdea.tags.length > 0) {
      await prisma.ideaTag.createMany({
        data: originalIdea.tags.map((ideaTag: { tagId: string }) => ({
          ideaId: forkedIdea.id,
          tagId: ideaTag.tagId,
        })),
      });
    }

    // Opcionalmente copiar expansiones
    if (includeExpansions && originalIdea.expansions.length > 0) {
      type ExpansionData = {
        content: string;
        userMessage?: string | null;
        type: ExpansionType;
        aiModel: string;
      };
      
      await prisma.expansion.createMany({
        data: originalIdea.expansions.map((exp: ExpansionData) => ({
          ideaId: forkedIdea.id,
          content: exp.content,
          userMessage: exp.userMessage,
          type: exp.type,
          aiModel: exp.aiModel,
        })),
      });
    }

    // Indexar en Qdrant
    try {
      await qdrantService.addIdea({
        id: forkedIdea.id,
        title: forkedIdea.title,
        content: forkedIdea.content,
        createdAt: forkedIdea.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Error indexando fork en Qdrant:', error);
    }

    // Obtener la idea completa con relaciones
    const completeForkedIdea = await prisma.idea.findUnique({
      where: { id: forkedIdea.id },
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
      message: 'Idea duplicada exitosamente',
      idea: completeForkedIdea,
      originalId: id,
    });
  } catch (error) {
    console.error('Error haciendo fork de idea:', error);
    return NextResponse.json(
      { error: 'Error al duplicar la idea' },
      { status: 500 }
    );
  }
}
