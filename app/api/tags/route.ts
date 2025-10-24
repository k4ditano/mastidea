import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tags
 * Obtiene todos los tags con conteo de ideas
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            ideas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      tags,
      total: tags.length
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Error al obtener los tags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Crea un nuevo tag
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'El nombre del tag es requerido' },
        { status: 400 }
      );
    }

    // Normalizar nombre
    const normalizedName = name.trim().toLowerCase();

    // Verificar si ya existe
    const existing = await prisma.tag.findUnique({
      where: { name: normalizedName }
    });

    if (existing) {
      return NextResponse.json({ tag: existing });
    }

    // Colores disponibles
    const TAG_COLORS = [
      '#7257ff', '#f06920', '#3b82f6', '#10b981', 
      '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
      '#06b6d4', '#84cc16'
    ];

    // Color aleatorio
    const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

    // Crear tag
    const tag = await prisma.tag.create({
      data: {
        name: normalizedName,
        color
      }
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Error al crear el tag' },
      { status: 500 }
    );
  }
}
