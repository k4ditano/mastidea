import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openRouterClient } from '@/lib/openrouter';
import { qdrantService } from '@/lib/qdrant';
import { z } from 'zod';

const createIdeaSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'El contenido es requerido'),
});

// Colores predefinidos para tags
const TAG_COLORS = [
  '#7257ff', // einstein-500
  '#f06920', // genius-500
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

function getRandomColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

/**
 * POST /api/ideas - Crea una nueva idea
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { title } = createIdeaSchema.parse(body);
    const { content } = createIdeaSchema.parse(body);
    
    // Si no hay título, generar uno con IA
    if (!title || !title.trim()) {
      try {
        const generatedTitle = await openRouterClient.chat([
          { role: 'system', content: 'Eres Einstein creando títulos brillantes. Crea un título corto (máximo 8 palabras), creativo e inspirador que capture la esencia. Sin comillas, sin puntos. Como si fuera el nombre de un descubrimiento fascinante. Solo el título, nada más.' },
          { role: 'user', content: `Idea: ${content}` }
        ]);
        title = generatedTitle.trim().substring(0, 100);
      } catch (error) {
        console.error('Error generando título:', error);
        title = content.substring(0, 50) + '...';
      }
    }

    // Crear la idea en la base de datos
    const idea = await prisma.idea.create({
      data: {
        title,
        content,
      },
    });

    // Generar tags con IA (en paralelo con las demás operaciones)
    const tagsPromise = (async () => {
      try {
        // Obtener tags existentes para reutilizarlos
        const existingTags = await prisma.tag.findMany({
          select: { name: true },
        });
        
        const existingTagNames = existingTags.map((t: { name: string }) => t.name);
        
        // Generar tags con IA
        const suggestedTagNames = await openRouterClient.generateTags(title, content, existingTagNames);
        
        // Crear o encontrar tags y asociarlos a la idea
        for (const tagName of suggestedTagNames) {
          // Buscar o crear el tag
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { 
              name: tagName,
              color: getRandomColor(),
            },
          });
          
          // Asociar tag a la idea
          await prisma.ideaTag.create({
            data: {
              ideaId: idea.id,
              tagId: tag.id,
            },
          });
        }
      } catch (error) {
        console.error('Error generando tags:', error);
        // No fallar la creación si falla la generación de tags
      }
    })();

    // Generar la primera expansión automática con IA
    try {
      const expansionContent = await openRouterClient.generateInitialExpansion(title, content);
      
      await prisma.expansion.create({
        data: {
          ideaId: idea.id,
          content: expansionContent,
          type: 'AUTO_EXPANSION',
        },
      });
    } catch (error) {
      console.error('Error generando expansión automática:', error);
      // No fallar la creación si falla la IA
    }

    // Agregar a Qdrant para búsqueda semántica
    try {
      await qdrantService.addIdea({
        id: idea.id,
        title: idea.title,
        content: idea.content,
        createdAt: idea.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Error añadiendo a Qdrant:', error);
      // No fallar la creación si falla Qdrant
    }

    // Esperar a que se completen los tags
    await tagsPromise;

    // Recuperar la idea con sus expansiones y tags
    const ideaWithExpansions = await prisma.idea.findUnique({
      where: { id: idea.id },
      include: {
        expansions: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(ideaWithExpansions, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creando idea:', error);
    return NextResponse.json(
      { error: 'Error al crear la idea' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ideas - Obtiene todas las ideas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const ideas = await prisma.idea.findMany({
      where: status ? {
        status: status as 'ACTIVE' | 'ARCHIVED' | 'COMPLETED',
      } : undefined, // Si no hay status, traer todas
      include: {
        expansions: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.idea.count({
      where: status ? {
        status: status as 'ACTIVE' | 'ARCHIVED' | 'COMPLETED',
      } : undefined,
    });

    return NextResponse.json({
      ideas,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error obteniendo ideas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las ideas' },
      { status: 500 }
    );
  }
}