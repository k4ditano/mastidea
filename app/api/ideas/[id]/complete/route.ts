import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openRouterClient } from '@/lib/openrouter';
import { auth } from '@clerk/nextjs/server';
import { getLocale } from '@/lib/i18n-server';
import { emitIdeaUpdate } from '@/lib/socket';

// Colores predefinidos para tags
const TAG_COLORS = [
  '#7257ff', // einstein-500
  '#f06920', // genius-500
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

function getRandomColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

/**
 * POST /api/ideas/[id]/complete - Cierra una idea y genera resumen ejecutivo
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

    // Obtener la idea con todas sus expansiones y tags actuales
    const idea = await prisma.idea.findFirst({
      where: { id },
      include: {
        expansions: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        collaborators: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    // Solo el propietario puede cerrar la idea
    if (idea.userId !== userId) {
      return NextResponse.json(
        { error: 'Solo el propietario puede cerrar la idea' },
        { status: 403 }
      );
    }

    if (idea.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Esta idea ya está completada' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un resumen y eliminarlo para regenerarlo
    const existingSummary = idea.expansions.find((exp: { type: string; id: string }) => exp.type === 'SUMMARY');
    if (existingSummary) {
      await prisma.expansion.delete({
        where: { id: existingSummary.id },
      });
    }

    // Preparar contexto de todas las expansiones
    const expansionsContext = idea.expansions
      .map((exp: { userMessage?: string | null; content: string }, idx: number) => {
        const userPart = exp.userMessage ? `Usuario: ${exp.userMessage}\n` : '';
        return `${idx + 1}. ${userPart}Einstein: ${exp.content.substring(0, 400)}...`;
      })
      .join('\n\n');

    // Generar resumen ejecutivo con IA
    const summary = await openRouterClient.chat([
      {
        role: 'system',
        content: `Eres Einstein creando un resumen ejecutivo DIRECTO y ACCIONABLE de una idea desarrollada.

Crea un resumen estructurado con:

1. CONCLUSIÓN (2-3 líneas): ¿Qué es esta idea en esencia?
2. PUNTOS CLAVE (4-5 bullets): Los hallazgos más importantes del desarrollo
3. PRÓXIMOS PASOS (3-4 acciones): Qué hacer para ejecutar esta idea
4. RECURSOS MENCIONADOS: Enlaces o referencias encontradas (si hay)

REGLAS:
- Texto plano, sin **, _, ###
- Usa números y guiones simples
- Sé CONCRETO y EJECUTABLE
- Máximo 6-7 párrafos cortos
- Extrae lo más valioso de toda la conversación`
      },
      {
        role: 'user',
        content: `Genera un resumen ejecutivo de esta idea desarrollada:

TÍTULO: ${idea.title}

DESCRIPCIÓN ORIGINAL: ${idea.content}

DESARROLLO DE LA IDEA (conversaciones):
${expansionsContext}

Crea el resumen ejecutivo ahora.`
      }
    ]);

    const locale = await getLocale();
    
    // Analizar potencial de éxito con IA
    const successAnalysisResult = await openRouterClient.analyzeSuccess(
      idea.title,
      idea.content,
      idea.expansions.map((exp: { content: string }) => exp.content),
      locale
    );

    // Guardar el resumen como una expansión especial tipo SUMMARY
    await prisma.expansion.create({
      data: {
        ideaId: idea.id,
        content: summary,
        type: 'SUMMARY',
      },
    });

    // Regenerar/actualizar tags basándose en todo el desarrollo de la idea
    try {
      // Obtener todos los tags existentes del sistema
      const allExistingTags = await prisma.tag.findMany({
        select: { name: true },
      });
      const existingTagNames = allExistingTags.map((t: { name: string }) => t.name);

      // Crear contexto completo para generar tags mejorados
      const fullContext = `${idea.title}\n\n${idea.content}\n\nDesarrollo:\n${expansionsContext}\n\nResumen:\n${summary}`;

      // Generar nuevos tags basados en TODO el contenido desarrollado
      const newTagNames = await openRouterClient.generateTags(
        idea.title,
        fullContext,
        existingTagNames,
        locale
      );

      // Obtener tags actuales de la idea
      const currentTagNames = idea.tags?.map((t: { tag: { name: string } }) => t.tag.name) || [];

      // Agregar solo los tags nuevos que no tenga ya
      for (const tagName of newTagNames) {
        if (!currentTagNames.includes(tagName)) {
          // Buscar o crear el tag
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              color: getRandomColor(),
            },
          });

          // Asociar tag a la idea
          await prisma.ideaTag.create({
            data: {
              ideaId: idea.id,
              tagId: tag.id,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error actualizando tags:', error);
      // No fallar el cierre de la idea si fallan los tags
    }

    // Cambiar estado a COMPLETED y guardar análisis de éxito
    const completedIdea = await prisma.idea.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        successScore: successAnalysisResult.score,
        successAnalysis: successAnalysisResult.analysis,
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

    // Emitir evento WebSocket para notificar a todos los usuarios conectados
    emitIdeaUpdate(idea.id, 'idea_updated', {
      status: 'COMPLETED',
      successScore: successAnalysisResult.score,
    });

    return NextResponse.json(completedIdea);
  } catch (error) {
    console.error('Error completando idea:', error);
    return NextResponse.json(
      { error: 'Error al completar la idea' },
      { status: 500 }
    );
  }
}
