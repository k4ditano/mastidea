'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTag, FaLightbulb } from 'react-icons/fa';
import Loading from '@/components/Loading';
import { Tag } from '@/types';

interface TagWithCount extends Tag {
  _count: {
    ideas: number;
  };
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'count'>('count');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Error loading tags');
      
      const data = await response.json();
      setTags(data.tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedTags = [...tags].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b._count.ideas - a._count.ideas;
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/ideas"
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2 mb-4"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FaTag className="text-3xl text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Todos los Tags</h1>
            </div>
            
            {/* Sort buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ordenar:</span>
              <button
                onClick={() => setSortBy('count')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'count'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por uso
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'name'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                A-Z
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm">
            Explora y filtra tus ideas por tags. Haz click en cualquier tag para ver las ideas relacionadas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-purple-600">{tags.length}</div>
            <div className="text-sm text-gray-600">Tags totales</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-blue-600">
              {tags.reduce((sum, tag) => sum + tag._count.ideas, 0)}
            </div>
            <div className="text-sm text-gray-600">Conexiones totales</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">
              {tags.length > 0 ? (tags.reduce((sum, tag) => sum + tag._count.ideas, 0) / tags.length).toFixed(1) : 0}
            </div>
            <div className="text-sm text-gray-600">Promedio por tag</div>
          </div>
        </div>

        {/* Tags Grid */}
        {sortedTags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/ideas?tag=${encodeURIComponent(tag.name)}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 p-5 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${tag.color}20` }}
                  >
                    <FaTag style={{ color: tag.color }} className="text-xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <FaLightbulb className="text-sm" />
                    <span className="text-lg font-bold">{tag._count.ideas}</span>
                  </div>
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-1 group-hover:underline"
                  style={{ color: tag.color }}
                >
                  {tag.name}
                </h3>
                
                <p className="text-xs text-gray-500">
                  {tag._count.ideas === 1 ? '1 idea' : `${tag._count.ideas} ideas`}
                </p>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-400">
                    Creado {new Date(tag.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay tags todavía
            </h3>
            <p className="text-gray-500 mb-6">
              Crea tu primera idea y la IA generará tags automáticamente
            </p>
            <Link
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Crear nueva idea
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
