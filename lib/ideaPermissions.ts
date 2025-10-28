import { prisma } from '@/lib/prisma';

/**
 * Verifica si un usuario tiene acceso a una idea (propietario o colaborador)
 */
export async function hasIdeaAccess(ideaId: string, userId: string): Promise<boolean> {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      collaborators: {
        where: { userId },
      },
    },
  });

  if (!idea) {
    return false;
  }

  // Es propietario o es colaborador
  return idea.userId === userId || idea.collaborators.length > 0;
}

/**
 * Verifica si un usuario es propietario de una idea
 */
export async function isIdeaOwner(ideaId: string, userId: string): Promise<boolean> {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { userId: true },
  });

  return idea?.userId === userId;
}

/**
 * Obtiene una idea con verificación de permisos
 */
export async function getIdeaWithAccess(ideaId: string, userId: string) {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      collaborators: true,
      tags: {
        include: {
          tag: true,
        },
      },
      expansions: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!idea) {
    return null;
  }

  // Verificar acceso
  const hasAccess = idea.userId === userId || 
                    idea.collaborators.some(c => c.userId === userId);

  if (!hasAccess) {
    return null;
  }

  return idea;
}
