import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/invitations - Obtener invitaciones pendientes del usuario actual
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener email del usuario actual
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'No se encontró el email del usuario' },
        { status: 400 }
      );
    }

    // Buscar invitaciones pendientes por email
    const invitations = await prisma.ideaInvitation.findMany({
      where: {
        invitedEmail: userEmail,
        status: 'PENDING',
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Actualizar invitedUserId si no está establecido
    if (invitations.length > 0) {
      await prisma.ideaInvitation.updateMany({
        where: {
          invitedEmail: userEmail,
          invitedUserId: null,
        },
        data: {
          invitedUserId: userId,
        },
      });
    }

    // Obtener información de los invitadores
    const invitationsWithInviterInfo = await Promise.all(
      invitations.map(async (invitation) => {
        try {
          const inviter = await client.users.getUser(invitation.inviterUserId);
          return {
            ...invitation,
            inviterName: inviter.firstName
              ? `${inviter.firstName} ${inviter.lastName || ''}`
              : inviter.username || 'Usuario',
            inviterEmail: inviter.emailAddresses[0]?.emailAddress,
          };
        } catch {
          return {
            ...invitation,
            inviterName: 'Usuario',
            inviterEmail: '',
          };
        }
      })
    );

    return NextResponse.json(invitationsWithInviterInfo);
  } catch (error) {
    console.error('Error obteniendo invitaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener invitaciones' },
      { status: 500 }
    );
  }
}

// POST /api/invitations - Crear nueva invitación
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { ideaId, invitedEmail, message } = await request.json();

    if (!ideaId || !invitedEmail) {
      return NextResponse.json(
        { error: 'Se requiere ideaId e invitedEmail' },
        { status: 400 }
      );
    }

    // Validar que el usuario es propietario de la idea
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        collaborators: true,
        invitations: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea no encontrada' },
        { status: 404 }
      );
    }

    if (idea.userId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para invitar colaboradores a esta idea' },
        { status: 403 }
      );
    }

    // Validar que el email no es del propietario
    const client = await clerkClient();
    const owner = await client.users.getUser(userId);
    const ownerEmail = owner.emailAddresses[0]?.emailAddress;

    if (ownerEmail === invitedEmail) {
      return NextResponse.json(
        { error: 'No puedes invitarte a ti mismo' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una invitación pendiente
    const existingInvitation = idea.invitations.find(
      (inv) => inv.invitedEmail === invitedEmail && inv.status === 'PENDING'
    );

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Ya existe una invitación pendiente para este email' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya es colaborador
    const isAlreadyCollaborator = idea.collaborators.some(
      (collab) => collab.userEmail === invitedEmail
    );

    if (isAlreadyCollaborator) {
      return NextResponse.json(
        { error: 'Este usuario ya es colaborador de esta idea' },
        { status: 400 }
      );
    }

    // Buscar si el usuario está registrado
    let invitedUserId: string | null = null;
    try {
      const users = await client.users.getUserList({
        emailAddress: [invitedEmail],
      });
      if (users.data.length > 0) {
        invitedUserId = users.data[0].id;
      }
    } catch {
      console.log('Usuario no encontrado por email:', invitedEmail);
    }

    // Crear la invitación
    const invitation = await prisma.ideaInvitation.create({
      data: {
        ideaId,
        inviterUserId: userId,
        invitedEmail,
        invitedUserId,
        message,
        status: 'PENDING',
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
    });

    // TODO: Aquí se podría enviar un email de notificación
    // usando un servicio como Resend, SendGrid, etc.

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error('Error creando invitación:', error);
    return NextResponse.json(
      { error: 'Error al crear invitación' },
      { status: 500 }
    );
  }
}
