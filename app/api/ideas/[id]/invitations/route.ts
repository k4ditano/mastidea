import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/ideas/[id]/invitations - Obtener invitaciones pendientes de una idea
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: ideaId } = await params;

    // Verificar que la idea existe y que el usuario es el propietario
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea no encontrada" },
        { status: 404 }
      );
    }

    if (idea.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para ver las invitaciones de esta idea" },
        { status: 403 }
      );
    }

    // Obtener invitaciones pendientes de esta idea
    const invitations = await prisma.ideaInvitation.findMany({
      where: {
        ideaId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error obteniendo invitaciones de la idea:", error);
    return NextResponse.json(
      { error: "Error al obtener invitaciones" },
      { status: 500 }
    );
  }
}
