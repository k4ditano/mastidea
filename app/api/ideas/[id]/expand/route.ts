import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openRouterClient } from '@/lib/openrouter';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getLocale } from '@/lib/i18n-server';
import { hasIdeaAccess } from '@/lib/ideaPermissions';
import { emitIdeaUpdate } from '@/lib/socket';

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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type } = expandIdeaSchema.parse(body);

    // Verificar acceso (propietario o colaborador)
    if (!(await hasIdeaAccess(id, userId))) {
      return NextResponse.json(
        { error: "No tienes acceso a esta idea" },
        { status: 403 }
      );
    }

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
    const locale = await getLocale();
    let expansionContent = '';
    const previousExpansions = idea.expansions.map((e: { content: string }) => e.content);

    switch (type) {
      case 'SUGGESTION':
        expansionContent = await openRouterClient.generateSuggestions(
          idea.title,
          idea.content,
          previousExpansions,
          locale
        );
        break;
      case 'QUESTION':
        expansionContent = await openRouterClient.generateQuestions(
          idea.title,
          idea.content,
          locale
        );
        break;
      case 'CONNECTION':
        expansionContent = await openRouterClient.generateConnections(
          idea.title,
          idea.content,
          locale
        );
        break;
      case 'USE_CASE':
        expansionContent = await openRouterClient.generateUseCases(
          idea.title,
          idea.content,
          locale
        );
        break;
      case 'CHALLENGE':
        expansionContent = await openRouterClient.generateChallenges(
          idea.title,
          idea.content,
          locale
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

    // Emitir evento WebSocket para notificar a otros usuarios
    emitIdeaUpdate(idea.id, 'new_expansions', {
      expansions: [expansion],
      count: 1,
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
