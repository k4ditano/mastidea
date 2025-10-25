'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Idea } from '@/types';
import { FaArrowLeft, FaCheckCircle, FaTrash, FaUndo } from 'react-icons/fa';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

export default function EvaluateIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{ idea: Idea; action: 'keep' | 'delete' }[]>([]);
  const [showResult, setShowResult] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?status=ACTIVE&limit=100');
      if (!response.ok) throw new Error('Error loading ideas');
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar las ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    const action = direction === 'right' ? 'keep' : 'delete';
    
    // Guardar en historial
    setHistory([...history, { idea: currentIdea, action }]);

    // Si es eliminación, ejecutar
    if (action === 'delete') {
      try {
        await fetch(`/api/ideas/${currentIdea.id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error eliminando idea:', error);
      }
    }

    // Avanzar a la siguiente
    if (currentIndex + 1 >= ideas.length) {
      setShowResult(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      x.set(0);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      handleSwipe(info.offset.x > 0 ? 'right' : 'left');
    } else {
      x.set(0);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const lastAction = history[history.length - 1];
    setHistory(history.slice(0, -1));
    
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus ideas...</p>
        </div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/ideas"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <FaArrowLeft />
            <span>Volver a Mis Ideas</span>
          </Link>
          
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No tienes ideas activas
            </h2>
            <p className="text-gray-600 mb-6">
              Crea algunas ideas primero para poder evaluarlas
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Crear una idea
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const kept = history.filter(h => h.action === 'keep').length;
    const deleted = history.filter(h => h.action === 'delete').length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Evaluación completada!
            </h2>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                <FaCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-700">{kept}</div>
                <div className="text-sm text-green-600">Mantenidas</div>
              </div>
              
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                <FaTrash className="text-red-600 text-3xl mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-700">{deleted}</div>
                <div className="text-sm text-red-600">Archivadas</div>
              </div>
            </div>

            {deleted > 0 && (
              <div className="mb-6 max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  💡 Las ideas archivadas se guardan durante 30 días antes de eliminarse permanentemente
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/ideas"
                className="block w-full max-w-sm mx-auto px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Ver mis ideas
              </Link>
              
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setHistory([]);
                  setShowResult(false);
                  loadIdeas();
                }}
                className="block w-full max-w-sm mx-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Evaluar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentIdea = ideas[currentIndex];
  const progress = ((currentIndex + 1) / ideas.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/ideas"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Evaluación de Ideas
          </h1>
          <p className="text-gray-600">
            Desliza a la derecha para mantener, a la izquierda para eliminar
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{currentIndex + 1} de {ideas.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Swipe Instructions */}
        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex items-center space-x-2 text-red-500">
            <FaTrash />
            <span className="text-sm font-medium">Eliminar</span>
          </div>
          <div className="flex items-center space-x-2 text-green-500">
            <span className="text-sm font-medium">Mantener</span>
            <FaCheckCircle />
          </div>
        </div>

        {/* Card Container */}
        <div className="relative h-[500px] mb-8">
          {/* Next card (preview) */}
          {ideas[currentIndex + 1] && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 opacity-50 scale-95">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {ideas[currentIndex + 1].title}
                </h3>
              </div>
            </div>
          )}

          {/* Current card */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {currentIdea.title}
              </h3>
              
              <p className="text-gray-700 mb-6 line-clamp-6">
                {currentIdea.content}
              </p>

              {/* Tags */}
              {currentIdea.tags && currentIdea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentIdea.tags.slice(0, 5).map((ideaTag) => (
                    <span
                      key={ideaTag.tagId}
                      className="px-3 py-1 rounded-full text-xs font-medium"
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
                </div>
              )}

              <div className="text-xs text-gray-400">
                {new Date(currentIdea.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors active:scale-95"
          >
            <FaTrash className="text-xl" />
          </button>

          {history.length > 0 && (
            <button
              onClick={handleUndo}
              className="w-16 h-16 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center shadow-lg hover:bg-gray-400 transition-colors active:scale-95"
            >
              <FaUndo className="text-xl" />
            </button>
          )}

          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors active:scale-95"
          >
            <FaCheckCircle className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
