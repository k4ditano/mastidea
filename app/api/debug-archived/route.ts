import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Contar todas las ideas del usuario
    const allIdeas = await prisma.idea.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        status: true,
        deletedAt: true,
      },
    });

    type IdeaDebug = { id: string; title: string; status: string; deletedAt: Date | null };

    // Contar por status
    const byStatus = {
      ACTIVE: allIdeas.filter((idea: IdeaDebug) => idea.status === 'ACTIVE').length,
      ARCHIVED: allIdeas.filter((idea: IdeaDebug) => idea.status === 'ARCHIVED').length,
      COMPLETED: allIdeas.filter((idea: IdeaDebug) => idea.status === 'COMPLETED').length,
    };

    // Ideas archivadas específicamente
    const archived = await prisma.idea.findMany({
      where: {
        userId,
        status: 'ARCHIVED',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        deletedAt: true,
      },
    });

    return NextResponse.json({
      total: allIdeas.length,
      byStatus,
      archivedQuery: archived.length,
      allIdeas: allIdeas.map((idea: IdeaDebug) => ({
        id: idea.id,
        title: idea.title,
        status: idea.status,
        deletedAt: idea.deletedAt,
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
