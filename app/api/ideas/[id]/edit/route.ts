import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { qdrantService } from '@/lib/qdrant';
import { openRouterClient } from '@/lib/openrouter';
import { z } from 'zod';
import { getLocale } from '@/lib/i18n-server';

const editIdeaSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  regenerateAnalysis: z.boolean().optional().default(false),
});

/**
 * PATCH /api/ideas/[id]/edit - Edita una idea completada
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
    const { title, content, regenerateAnalysis } = editIdeaSchema.parse(body);

    // Verificar que la idea existe y pertenece al usuario
    const idea = await prisma.idea.findFirst({
      where: { 
        id, 
        userId,
        deletedAt: null,
      },
      include: {
        expansions: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: {
      title: string;
      content: string;
      updatedAt: Date;
      successScore?: number;
      successAnalysis?: string;
    } = {
      title,
      content,
      updatedAt: new Date(),
    };

    // Si se solicita, regenerar el análisis de éxito
    if (regenerateAnalysis && idea.status === 'COMPLETED') {
      try {
        const locale = await getLocale();
        // Convertir expansions a formato string[] para analyzeSuccess
        const expansionTexts = idea.expansions.map((exp: { content: string }) => exp.content);
        
        const successAnalysisResult = await openRouterClient.analyzeSuccess(
          title,
          content,
          expansionTexts,
          locale
        );

        updateData.successScore = successAnalysisResult.score;
        updateData.successAnalysis = successAnalysisResult.analysis;
      } catch (error) {
        console.error('Error regenerando análisis de éxito:', error);
        // Continuar sin regenerar el análisis
      }
    }

    // Actualizar la idea
    const updatedIdea = await prisma.idea.update({
      where: { id },
      data: updateData,
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

    // Actualizar en Qdrant
    try {
      await qdrantService.addIdea({
        id,
        title,
        content,
        createdAt: updatedIdea.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Error actualizando en Qdrant:', error);
    }

    return NextResponse.json({
      success: true,
      message: regenerateAnalysis 
        ? 'Idea actualizada con nuevo análisis de éxito'
        : 'Idea actualizada exitosamente',
      idea: updatedIdea,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error editando idea:', error);
    return NextResponse.json(
      { error: 'Error al editar la idea' },
      { status: 500 }
    );
  }
}
