import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openRouterClient } from "@/lib/openrouter";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { hasIdeaAccess } from "@/lib/ideaPermissions";
import { emitIdeaUpdate } from "@/lib/socket";

const chatSchema = z.object({
  message: z.string().min(1, "El mensaje es requerido"),
});

/**
 * POST /api/ideas/[id]/chat - Conversación libre con la IA sobre la idea
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = chatSchema.parse(body);

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
          orderBy: { createdAt: "asc" },
          take: 5, // Solo las últimas 5 para contexto
        },
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea no encontrada" },
        { status: 404 }
      );
    }

    // Crear contexto de conversación con las últimas 3 interacciones
    const recentExpansions = idea.expansions.slice(-3); // Solo las últimas 3
    let conversationContext = "";

    if (recentExpansions.length > 0) {
      conversationContext = "\n\nConversación reciente:";
      recentExpansions.forEach(
        (exp: { userMessage?: string | null; content: string }) => {
          if (exp.userMessage) {
            conversationContext += `\nUsuario: ${exp.userMessage}`;
          }
          conversationContext += `\nEinstein: ${exp.content.substring(
            0,
            300
          )}...`;
        }
      );
    }

    // Generar respuesta personalizada
    const response = await openRouterClient.chat([
      {
        role: "system",
        content: `Eres Einstein en modo ejecutivo: inteligente pero DIRECTO.

La persona trabaja en:
Título: ${idea.title}
Descripción: ${idea.content}${conversationContext}

Tu estilo:
- Claro y al grano, sin rodeos
- Ejemplos concretos, no metáforas largas
- Preguntas directas que ayuden a ejecutar
- Buscas info real cuando es útil

Cuando busques info:
- "He buscado: existe X (url) que hace Y. Tu diferencia es Z."
- Sé específico y breve

Lo que NO hagas:
- Metáforas poéticas o largas
- "Como decía mi abuela...", "es como si..."
- Historias indirectas
- Ir por las ramas

FORMATO:
- NO usar **, _, ###
- Texto plano con números o guiones
- URLs directas
- Máximo 4-5 párrafos cortos y concretos

Responde directo a lo que preguntan.`,
      },
      {
        role: "user",
        content: message,
      },
    ]);

    // Guardar la expansión como tipo SUGGESTION (conversación)
    const expansion = await prisma.expansion.create({
      data: {
        ideaId: idea.id,
        content: response,
        userMessage: message, // Guardar el mensaje del usuario
        userId: userId, // Guardar el ID del usuario que envió el mensaje
        type: "SUGGESTION",
      },
    });

    // Emitir evento WebSocket
    emitIdeaUpdate(idea.id, 'new_expansions', {
      expansions: [expansion],
      count: 1,
    });

    return NextResponse.json(expansion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error en chat:", error);
    return NextResponse.json(
      { error: "Error al procesar el mensaje" },
      { status: 500 }
    );
  }
}
