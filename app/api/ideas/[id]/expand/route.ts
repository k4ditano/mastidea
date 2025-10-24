import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openRouterClient } from '@/lib/openrouter';
import { z } from 'zod';

const expandIdeaSchema = z.object({
  type: z.enum(['SUGGESTION', 'QUESTION', 'CONNECTION', 'USE_CASE', 'CHALLENGE']),
});

/**
 * POST /api/ideas/[id]/expand - Genera una nueva expansión para una idea
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type } = expandIdeaSchema.parse(body);

    // Obtener la idea con sus expansiones
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        expansions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    // Generar expansión según el tipo
    let expansionContent = '';
    const previousExpansions = idea.expansions.map((e: { content: string }) => e.content);

    switch (type) {
      case 'SUGGESTION':
        expansionContent = await openRouterClient.generateSuggestions(
          idea.title,
          idea.content,
          previousExpansions
        );
        break;
      case 'QUESTION':
        expansionContent = await openRouterClient.generateQuestions(
          idea.title,
          idea.content
        );
        break;
      case 'CONNECTION':
        expansionContent = await openRouterClient.generateConnections(
          idea.title,
          idea.content
        );
        break;
      case 'USE_CASE':
        expansionContent = await openRouterClient.generateUseCases(
          idea.title,
          idea.content
        );
        break;
      case 'CHALLENGE':
        expansionContent = await openRouterClient.generateChallenges(
          idea.title,
          idea.content
        );
        break;
    }

    // Guardar la expansión
    const expansion = await prisma.expansion.create({
      data: {
        ideaId: idea.id,
        content: expansionContent,
        type,
      },
    });

    return NextResponse.json(expansion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error expandiendo idea:', error);
    return NextResponse.json(
      { error: 'Error al expandir la idea' },
      { status: 500 }
    );
  }
}
