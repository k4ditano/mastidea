import { NextRequest, NextResponse } from 'next/server';
import { qdrantService } from '@/lib/qdrant';

/**
 * GET /api/search - Búsqueda semántica de ideas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const similarIdeas = await qdrantService.findSimilarIdeas(query, limit);

    return NextResponse.json({
      query,
      results: similarIdeas,
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { error: 'Error al buscar ideas' },
      { status: 500 }
    );
  }
}
