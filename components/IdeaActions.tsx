'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Idea } from '@/types';
import { FaEdit, FaRedo, FaCodeBranch, FaTrash, FaArchive } from 'react-icons/fa';

interface IdeaActionsProps {
  idea: Idea;
  onUpdate?: (updatedIdea: Idea) => void;
}

export default function IdeaActions({ idea, onUpdate }: IdeaActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForkMenu, setShowForkMenu] = useState(false);
  const [editData, setEditData] = useState({
    title: idea.title,
    content: idea.content,
    regenerateAnalysis: false,
  });

  const handleReopen = async () => {
    if (!confirm('¿Reabrir esta idea para seguir trabajando en ella?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}/reopen`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error reabriendo idea');

      const data = await response.json();
      if (onUpdate) onUpdate(data.idea);
      router.refresh();
      alert('✅ Idea reabierta. Puedes seguir expandiéndola.');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al reabrir la idea');
    } finally {
      setLoading(false);
    }
  };

  const handleFork = async (includeExpansions: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeExpansions }),
      });

      if (!response.ok) throw new Error('Error duplicando idea');

      const data = await response.json();
      router.push(`/idea/${data.idea.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al duplicar la idea');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Error editando idea');

      const data = await response.json();
      if (onUpdate) onUpdate(data.idea);
      setShowEditModal(false);
      router.refresh();
      alert('✅ ' + data.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al editar la idea');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('¿Archivar esta idea?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });

      if (!response.ok) throw new Error('Error archivando idea');

      router.push('/ideas');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al archivar la idea');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Mover esta idea a la papelera? Se eliminará definitivamente en 30 días.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error eliminando idea');

      router.push('/ideas');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Acciones</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Editar */}
        <button
          onClick={() => setShowEditModal(true)}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <FaEdit className="text-blue-600 flex-shrink-0" />
          <span>Editar idea</span>
        </button>

        {/* Reabrir (solo si está completada) */}
        {idea.status === 'COMPLETED' && (
          <button
            onClick={handleReopen}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaRedo className="text-green-600 flex-shrink-0" />
            <span>Reabrir idea</span>
          </button>
        )}

        {/* Fork/Duplicar */}
        <div className="relative">
          <button
            onClick={() => setShowForkMenu(!showForkMenu)}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaCodeBranch className="text-purple-600 flex-shrink-0" />
            <span>Duplicar idea</span>
          </button>
          
          {showForkMenu && (
            <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64">
              <button
                onClick={() => {
                  handleFork(false);
                  setShowForkMenu(false);
                }}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
              >
                <div className="font-medium">Solo idea</div>
                <div className="text-xs text-gray-500">Copia título y contenido</div>
              </button>
              <button
                onClick={() => {
                  handleFork(true);
                  setShowForkMenu(false);
                }}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-lg border-t"
              >
                <div className="font-medium">Idea completa</div>
                <div className="text-xs text-gray-500">Incluye todas las expansiones</div>
              </button>
            </div>
          )}
        </div>

        {/* Archivar (solo si está activa) */}
        {idea.status === 'ACTIVE' && (
          <button
            onClick={handleArchive}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaArchive className="text-yellow-600 flex-shrink-0" />
            <span>Archivar</span>
          </button>
        )}

        {/* Eliminar */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 bg-white border border-red-300 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <FaTrash className="flex-shrink-0" />
          <span>Mover a papelera</span>
        </button>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Idea</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido
                  </label>
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent resize-none"
                  />
                </div>

                {idea.status === 'COMPLETED' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editData.regenerateAnalysis}
                      onChange={(e) => setEditData({ ...editData, regenerateAnalysis: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      Regenerar análisis de éxito con IA
                    </span>
                  </label>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleEdit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
