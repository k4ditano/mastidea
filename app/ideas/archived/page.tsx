'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Idea } from '@/types';
import { FaArrowLeft, FaUndo, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ArchivedIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?status=ARCHIVED');
      if (!response.ok) throw new Error('Error loading ideas');
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar las ideas archivadas');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!confirm('¿Desarchivar esta idea?')) return;

    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });

      if (!response.ok) throw new Error('Error unarchiving idea');

      await loadIdeas();
      alert('✅ Idea desarchivada');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desarchivar la idea');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Mover esta idea a la papelera? Se eliminará definitivamente en 30 días.')) return;

    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error deleting idea');

      await loadIdeas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la idea');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ideas archivadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/ideas"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Volver a Mis Ideas</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ideas Archivadas
          </h1>
          <p className="text-gray-600">
            Ideas que has archivado. Puedes desarchivarlas o eliminarlas definitivamente.
          </p>
        </div>

        {/* Ideas List */}
        {ideas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No tienes ideas archivadas
            </h2>
            <p className="text-gray-600 mb-6">
              Las ideas que archives aparecerán aquí
            </p>
            <Link
              href="/ideas"
              className="inline-block px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ver todas mis ideas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">
                    {idea.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {idea.content}
                </p>

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {idea.tags.slice(0, 3).map((ideaTag) => (
                      <span
                        key={ideaTag.tagId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${ideaTag.tag.color}20`,
                          color: ideaTag.tag.color,
                          borderColor: ideaTag.tag.color,
                          borderWidth: '1px',
                        }}
                      >
                        {ideaTag.tag.name}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{idea.tags.length - 3} más
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 mb-4">
                  Archivada {formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: true, locale: es })}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUnarchive(idea.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaUndo className="text-xs" />
                    <span>Desarchivar</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
