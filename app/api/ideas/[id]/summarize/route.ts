import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openRouterClient } from '@/lib/openrouter';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/ideas/[id]/summarize - Genera resumen ejecutivo SIN cerrar la idea
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

    // Obtener la idea con todas sus expansiones (verificando que pertenezca al usuario)
    const idea = await prisma.idea.findFirst({
      where: { id, userId },
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

    // Verificar si ya existe un resumen
    const existingSummary = idea.expansions.find((exp: { type: string }) => exp.type === 'SUMMARY');
    if (existingSummary) {
      return NextResponse.json(
        { 
          error: 'Esta idea ya tiene un resumen ejecutivo',
          message: 'Ya existe un resumen. Revísalo al final de la conversación.'
        },
        { status: 400 }
      );
    }

    // Si no hay expansiones, no tiene sentido generar un resumen
    if (!idea.expansions || idea.expansions.length === 0) {
      return NextResponse.json(
        { 
          error: 'No hay suficiente contenido para resumir',
          message: 'Desarrolla la idea con algunas expansiones antes de generar un resumen.'
        },
        { status: 400 }
      );
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

    // Guardar el resumen como una expansión especial tipo SUMMARY
    // La idea se mantiene en estado ACTIVE para que el usuario pueda seguir desarrollándola
    await prisma.expansion.create({
      data: {
        ideaId: idea.id,
        content: summary,
        type: 'SUMMARY',
      },
    });

    // Recargar la idea con el nuevo resumen
    const updatedIdea = await prisma.idea.findUnique({
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
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Resumen ejecutivo generado. La idea permanece activa.',
      idea: updatedIdea,
    });
  } catch (error) {
    console.error('Error generando resumen:', error);
    return NextResponse.json(
      { error: 'Error al generar el resumen' },
      { status: 500 }
    );
  }
}
