import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/ideas/[id]/updates - Server-Sent Events para actualizaciones en tiempo real
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Verificar que el usuario tiene acceso a esta idea
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      collaborators: {
        where: { userId },
      },
    },
  });

  if (!idea || (idea.userId !== userId && idea.collaborators.length === 0)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Crear stream de Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Enviar mensaje inicial
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Configurar intervalo para verificar actualizaciones (polling cada 5 segundos)
      let lastCheck = new Date();
      const intervalId = setInterval(async () => {
        try {
          // Buscar nuevas expansiones desde la última comprobación
          const newExpansions = await prisma.expansion.findMany({
            where: {
              ideaId: id,
              createdAt: {
                gt: lastCheck,
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          });

          if (newExpansions.length > 0) {
            // Enviar notificación de nuevas expansiones
            const message = {
              type: "new_expansions",
              count: newExpansions.length,
              expansions: newExpansions,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
            );
            lastCheck = new Date();
          }
        } catch (error) {
          console.error("Error checking for updates:", error);
        }
      }, 5000);

      // Limpiar cuando se cierra la conexión
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
