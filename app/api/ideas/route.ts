import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { openRouterClient } from '@/lib/openrouter';
import { qdrantService } from '@/lib/qdrant';
import { getLocale } from '@/lib/i18n-server';
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    let { title } = createIdeaSchema.parse(body);
    const { content } = createIdeaSchema.parse(body);
    
    // Si no hay título, usar el inicio del contenido temporalmente
    if (!title || !title.trim()) {
      title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    // Crear la idea INMEDIATAMENTE en la base de datos
    const idea = await prisma.idea.create({
      data: {
        userId,
        title,
        content,
        aiProcessingStatus: 'PENDING', // IA trabajando en segundo plano
      },
      include: {
        expansions: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Procesar IA en segundo plano (sin await - fire and forget)
    processIdeaInBackground(idea.id, title, content).catch((error) => {
      console.error('⚠️ Error en procesamiento de fondo:', error);
    });

    // Responder INMEDIATAMENTE al usuario
    return NextResponse.json({
      ...idea,
      message: 'Idea guardada. IA trabajando en segundo plano...',
    }, { status: 201 });
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
 * Procesa una idea en segundo plano: genera título, tags, expansión y embeddings
 */
async function processIdeaInBackground(
  ideaId: string,
  initialTitle: string,
  content: string
) {
  try {
    console.log(`🚀 Procesando idea ${ideaId} en segundo plano...`);
    const locale = await getLocale();
    let finalTitle = initialTitle;

    // 1. Generar título con IA si es temporal
    if (initialTitle.endsWith('...') && initialTitle.length <= 53) {
      try {
        const titlePrompt = locale === 'es'
          ? 'Eres Einstein creando títulos brillantes. Crea un título corto (máximo 8 palabras), creativo e inspirador que capture la esencia. Sin comillas, sin puntos. Como si fuera el nombre de un descubrimiento fascinante. Solo el título, nada más.'
          : 'You are Einstein creating brilliant titles. Create a short title (maximum 8 words), creative and inspiring that captures the essence. No quotes, no periods. As if it were the name of a fascinating discovery. Just the title, nothing else.';
        
        const userPrompt = locale === 'es' ? `Idea: ${content}` : `Idea: ${content}`;
        
        const generatedTitle = await openRouterClient.chat([
          { role: 'system', content: titlePrompt },
          { role: 'user', content: userPrompt }
        ]);
        finalTitle = generatedTitle.trim().substring(0, 100);
        
        await prisma.idea.update({
          where: { id: ideaId },
          data: { title: finalTitle },
        });
        console.log(`✅ Título actualizado: ${finalTitle}`);
      } catch (error) {
        console.error('❌ Error generando título:', error);
      }
    }

    // 2. Procesar tags y expansión en paralelo
    await Promise.allSettled([
      // Tags
      (async () => {
        try {
          console.log('🏷️ Generando tags...');
          const existingTags = await prisma.tag.findMany({
            select: { name: true },
          });
          const existingTagNames = existingTags.map((t: { name: string }) => t.name);

          const suggestedTagNames = await openRouterClient.generateTags(
            finalTitle,
            content,
            existingTagNames,
            locale
          );

          console.log(`📋 Tags sugeridos por IA: ${suggestedTagNames.join(', ')}`);

          for (const tagName of suggestedTagNames) {
            const tag = await prisma.tag.upsert({
              where: { name: tagName },
              update: {},
              create: {
                name: tagName,
                color: getRandomColor(),
              },
            });

            console.log(`🏷️ Tag creado/encontrado: ${tag.name} (ID: ${tag.id})`);

            await prisma.ideaTag.create({
              data: {
                ideaId: ideaId,
                tagId: tag.id,
              },
            }).catch(() => {
              console.log(`⚠️ Tag ${tagName} ya estaba asociado a la idea ${ideaId}`);
            });
          }
          console.log(`✅ Tags generados y asociados: ${suggestedTagNames.join(', ')}`);
        } catch (error) {
          console.error('❌ Error generando tags:', error);
        }
      })(),

      // Primera expansión
      (async () => {
        try {
          console.log('💡 Generando expansión inicial...');
          const expansionContent = await openRouterClient.generateInitialExpansion(
            finalTitle,
            content,
            locale
          );

          await prisma.expansion.create({
            data: {
              ideaId: ideaId,
              content: expansionContent,
              type: 'AUTO_EXPANSION',
            },
          });
          console.log('✅ Expansión generada');
        } catch (error) {
          console.error('❌ Error generando expansión:', error);
        }
      })(),
    ]);

    // 3. Indexar en Qdrant
    try {
      const indexed = await qdrantService.addIdea({
        id: ideaId,
        title: finalTitle,
        content: content,
        createdAt: new Date().toISOString(),
      });
      
      if (!indexed) {
        console.warn('⚠️ Idea guardada pero no se pudo indexar en Qdrant (búsqueda semántica limitada)');
      }
    } catch (error) {
      console.error('❌ Error crítico indexando en Qdrant:', error);
    }

    // 4. Marcar como completada
    await prisma.idea.update({
      where: { id: ideaId },
      data: { aiProcessingStatus: 'COMPLETED' },
    });

    console.log(`🎉 Idea ${ideaId} procesada completamente`);
    console.log(`📊 Resumen: Título="${finalTitle}", Tags=${(await prisma.ideaTag.count({ where: { ideaId } }))} asociados`);
  } catch (error) {
    console.error('💥 Error crítico en processIdeaInBackground:', error);
    
    // Marcar como fallida
    await prisma.idea.update({
      where: { id: ideaId },
      data: { aiProcessingStatus: 'FAILED' },
    }).catch(() => {
      // Ignorar si falla actualizar el estado
    });
  }
}

/**
 * GET /api/ideas - Obtiene todas las ideas del usuario (propias y colaborativas)
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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtro de where para ideas propias
    interface WhereClause {
      deletedAt: null;
      status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
      OR?: Array<{
        userId: string;
      } | {
        collaborators: {
          some: {
            userId: string;
          };
        };
      }>;
    }
    
    const whereClause: WhereClause = {
      deletedAt: null, // Siempre excluir ideas en papelera
      OR: [
        { userId }, // Ideas propias
        { 
          collaborators: {
            some: {
              userId, // Ideas donde es colaborador
            },
          },
        },
      ],
    };

    // Solo agregar filtro de status si se especifica
    if (status) {
      whereClause.status = status as 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
    }

    const ideas = await prisma.idea.findMany({
      where: whereClause,
      include: {
        expansions: {
          orderBy: { createdAt: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        collaborators: true, // Incluir colaboradores para mostrar badges
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.idea.count({
      where: whereClause,
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
