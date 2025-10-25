import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/fix-archived - Arregla ideas archivadas con deletedAt incorrecto
 */
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Limpiar deletedAt de ideas ARCHIVED (no deberían estar en papelera)
    const result = await prisma.idea.updateMany({
      where: {
        userId,
        status: 'ARCHIVED',
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} ideas archivadas corregidas`,
      fixed: result.count,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
