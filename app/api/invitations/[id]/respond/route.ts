import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/invitations/[id]/respond - Aceptar o rechazar invitación
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json(); // 'accept' o 'reject'

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "accept" o "reject"' },
        { status: 400 }
      );
    }

    // Buscar la invitación
    const invitation = await prisma.ideaInvitation.findUnique({
      where: { id },
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

    // Verificar que la invitación está pendiente
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Esta invitación ya fue procesada" },
        { status: 400 }
      );
    }

    // Obtener email del usuario actual
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "No se encontró el email del usuario" },
        { status: 400 }
      );
    }

    // Verificar que la invitación es para este usuario
    if (invitation.invitedEmail !== userEmail) {
      return NextResponse.json(
        { error: "Esta invitación no es para ti" },
        { status: 403 }
      );
    }

    if (action === "accept") {
      // Crear colaborador y actualizar invitación en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Actualizar invitación
        const updatedInvitation = await tx.ideaInvitation.update({
          where: { id },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
            invitedUserId: userId,
          },
        });

        // Crear colaborador
        const collaborator = await tx.ideaCollaborator.create({
          data: {
            ideaId: invitation.ideaId,
            userId,
            userEmail,
            role: "COLLABORATOR",
          },
        });

        return { invitation: updatedInvitation, collaborator };
      });

      return NextResponse.json(result);
    } else {
      // Rechazar invitación
      const updatedInvitation = await prisma.ideaInvitation.update({
        where: { id },
        data: {
          status: "REJECTED",
          respondedAt: new Date(),
          invitedUserId: userId,
        },
      });

      return NextResponse.json(updatedInvitation);
    }
  } catch (error) {
    console.error("Error procesando invitación:", error);
    return NextResponse.json(
      { error: "Error al procesar invitación" },
      { status: 500 }
    );
  }
}
