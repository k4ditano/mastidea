import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/ideas/[id]/collaborators - Obtener colaboradores de una idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el usuario tiene acceso a la idea
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        collaborators: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es propietario o colaborador
    const isOwner = idea.userId === userId;
    const isCollaborator = idea.collaborators.some(
      (collab) => collab.userId === userId
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: "No tienes permiso para ver los colaboradores de esta idea" },
        { status: 403 }
      );
    }

    return NextResponse.json(idea.collaborators);
  } catch (error) {
    console.error("Error obteniendo colaboradores:", error);
    return NextResponse.json(
      { error: "Error al obtener colaboradores" },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id]/collaborators - Eliminar un colaborador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { collaboratorId } = await request.json();

    if (!collaboratorId) {
      return NextResponse.json(
        { error: "Se requiere collaboratorId" },
        { status: 400 }
      );
    }

    // Verificar que el usuario es propietario de la idea
    const idea = await prisma.idea.findUnique({
      where: { id },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea no encontrada" },
        { status: 404 }
      );
    }

    if (idea.userId !== userId) {
      return NextResponse.json(
        { error: "Solo el propietario puede eliminar colaboradores" },
        { status: 403 }
      );
    }

    // Eliminar el colaborador
    await prisma.ideaCollaborator.delete({
      where: {
        id: collaboratorId,
        ideaId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando colaborador:", error);
    return NextResponse.json(
      { error: "Error al eliminar colaborador" },
      { status: 500 }
    );
  }
}
