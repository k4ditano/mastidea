import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { qdrantService } from '@/lib/qdrant';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/search/semantic?q=query&limit=10
 * Búsqueda semántica de ideas usando Qdrant
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query requerido' },
        { status: 400 }
      );
    }

    console.log(`🔍 Búsqueda semántica: "${query}" (límite: ${limit})`);

    // Buscar en Qdrant
    const similarIdeas = await qdrantService.findSimilarIdeas(query, limit);

    if (similarIdeas.length === 0) {
      return NextResponse.json({
        results: [],
        count: 0,
        message: 'No se encontraron ideas similares',
      });
    }

    // Obtener detalles completos de las ideas desde PostgreSQL
    const ideaIds = similarIdeas.map(idea => idea.id);
    const fullIdeas = await prisma.idea.findMany({
      where: {
        id: { in: ideaIds },
        userId: userId, // Solo ideas del usuario autenticado
        deletedAt: null,
      },
      include: {
        expansions: {
          orderBy: { createdAt: 'desc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Combinar con scores de similitud de Qdrant
    const results = fullIdeas.map(idea => {
      const similarIdea = similarIdeas.find(s => s.id === idea.id);
      return {
        ...idea,
        similarityScore: similarIdea?.score || 0,
      };
    }).sort((a, b) => b.similarityScore - a.similarityScore);

    console.log(`✅ Encontradas ${results.length} ideas (scores: ${results.map(r => r.similarityScore.toFixed(3)).join(', ')})`);

    return NextResponse.json({
      results,
      count: results.length,
      query,
    });
  } catch (error) {
    console.error('Error en búsqueda semántica:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 }
    );
  }
}
