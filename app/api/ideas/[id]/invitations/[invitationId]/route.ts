import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/ideas/[id]/invitations/[invitationId] - Cancelar una invitación
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { invitationId } = await params;

    // Verificar que la invitación existe y que el usuario es el propietario de la idea
    const invitation = await prisma.ideaInvitation.findUnique({
      where: { id: invitationId },
      include: {
        idea: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    if (invitation.idea.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para cancelar esta invitación" },
        { status: 403 }
      );
    }

    // Eliminar la invitación
    await prisma.ideaInvitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelando invitación:", error);
    return NextResponse.json(
      { error: "Error al cancelar invitación" },
      { status: 500 }
    );
  }
}
