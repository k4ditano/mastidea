'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import IdeaCard from '@/components/IdeaCard';
import Loading from '@/components/Loading';
import { Idea } from '@/types';
import { FaBrain, FaSearch } from 'react-icons/fa';

function IdeasContent() {
  const searchParams = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Idea[]>([]);
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadIdeas();
    
    // Leer tag de la URL si existe
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(decodeURIComponent(tagFromUrl));
    }
    
    // Recargar cuando la página se vuelve visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadIdeas();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [searchParams]);

  const loadIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?limit=100');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error loading ideas:', error);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const displayIdeas = searchResults.length > 0 ? searchResults : (ideas || []);
  const filteredIdeas = (displayIdeas || []).filter(idea => {
    // Filtro por status
    if (filter === 'active' && idea.status !== 'ACTIVE') return false;
    if (filter === 'completed' && idea.status !== 'COMPLETED') return false;
    
    // Filtro por tag (solo cuando hay un tag seleccionado)
    if (selectedTag && !idea.tags?.some(t => t.tag.name === selectedTag)) return false;
    
    return true;
  });
  const totalExpansions = (ideas || []).reduce((sum, idea) => sum + (idea.expansions?.length || 0), 0);
  const completedCount = (ideas || []).filter(i => i.status === 'COMPLETED').length;

  // Obtener todos los tags únicos con contador de uso
  const allTags = (ideas || []).reduce((acc, idea) => {
    idea.tags?.forEach(ideaTag => {
      const existing = acc.find(t => t.name === ideaTag.tag.name);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ ...ideaTag.tag, count: 1 });
      }
    });
    return acc;
  }, [] as Array<{ id: string; name: string; color: string; count: number; createdAt: string }>);

  // Ordenar tags por uso
  allTags.sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <FaBrain className="text-einstein-600 mr-3" />
            Mi Universo de Ideas
          </h1>
          
          {/* Stats */}
          {!loading && (
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                <span className="text-2xl font-bold text-einstein-600">{ideas.length}</span>
                <span className="text-gray-600 ml-2">ideas</span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                <span className="text-2xl font-bold text-purple-600">{totalExpansions}</span>
                <span className="text-gray-600 ml-2">expansiones</span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 border border-green-300 bg-green-50">
                <span className="text-2xl font-bold text-green-600">{completedCount}</span>
                <span className="text-gray-600 ml-2">completadas</span>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                style={filter === 'all' ? { backgroundColor: '#5c3bdb', color: '#ffffff' } : undefined}
                className={
                  filter === 'all'
                    ? 'px-4 py-2 rounded-lg font-medium transition-colors shadow-md select-none'
                    : 'px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 select-none'
                }
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('active')}
                style={filter === 'active' ? { backgroundColor: '#5c3bdb', color: '#ffffff' } : undefined}
                className={
                  filter === 'active'
                    ? 'px-4 py-2 rounded-lg font-medium transition-colors shadow-md select-none'
                    : 'px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 select-none'
                }
              >
                Activas
              </button>
              <button
                onClick={() => setFilter('completed')}
                style={filter === 'completed' ? { backgroundColor: '#16a34a', color: '#ffffff' } : undefined}
                className={
                  filter === 'completed'
                    ? 'px-4 py-2 rounded-lg font-medium transition-colors shadow-md select-none'
                    : 'px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 select-none'
                }
              >
                Completadas
              </button>
            </div>

            {/* Tags filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center ml-2 border-l border-gray-300 pl-4">
                <span className="text-sm text-gray-500 font-medium">Tags:</span>
                {allTags.slice(0, 8).map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all select-none
                      ${selectedTag === tag.name ? 'ring-2 ring-offset-2 shadow-md scale-105' : 'hover:scale-105'}
                    `}
                    style={selectedTag === tag.name ? {
                      backgroundColor: tag.color,
                      color: '#ffffff',
                    } : {
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: tag.color,
                      borderWidth: '1px',
                    }}
                  >
                    {tag.name} ({tag.count})
                  </button>
                ))}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Busca ideas similares... (búsqueda semántica con IA)"
                  className="
                    w-full pl-12 pr-4 py-3 rounded-lg
                    border-2 border-gray-200 focus:border-einstein-500 focus:ring-4 focus:ring-einstein-100
                    transition-all outline-none
                  "
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="
                  px-6 py-3 rounded-lg
                  bg-einstein-600 text-white font-medium
                  hover:bg-einstein-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
              {searchResults.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {searchResults.length > 0 && (
            <p className="mt-4 text-gray-600">
              Se encontraron <span className="font-semibold">{searchResults.length}</span> ideas similares
            </p>
          )}
        </div>

        {/* Ideas Grid */}
        {loading ? (
          <Loading />
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No se encontraron ideas' : 'Aún no tienes ideas'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Empieza capturando tu primera idea en la página de inicio'
              }
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-einstein-600 text-white font-medium rounded-lg hover:bg-einstein-700 transition-colors"
              >
                Crear mi primera idea
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredIdeas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea}
                onTagClick={(tagName) => setSelectedTag(tagName)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IdeasPage() {
  return (
    <Suspense fallback={<Loading />}>
      <IdeasContent />
    </Suspense>
  );
}
