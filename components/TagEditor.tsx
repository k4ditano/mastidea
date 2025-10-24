'use client';

import { useState } from 'react';
import { Tag } from '@/types';
import { FaTimes, FaPlus, FaTag } from 'react-icons/fa';

interface TagEditorProps {
  ideaId: string;
  currentTags: Tag[];
  onTagsUpdated: () => void;
}

export default function TagEditor({ ideaId, currentTags, onTagsUpdated }: TagEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAvailableTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Error loading tags');
      const data = await response.json();
      setAvailableTags(data.tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    loadAvailableTags();
  };

  const handleAddTag = async (tagId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId }),
      });

      if (!response.ok) throw new Error('Error adding tag');
      onTagsUpdated();
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Error al añadir el tag');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error removing tag');
      onTagsUpdated();
    } catch (error) {
      console.error('Error removing tag:', error);
      alert('Error al eliminar el tag');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAddTag = async () => {
    if (!newTagName.trim()) return;
    
    setLoading(true);
    try {
      // Crear nuevo tag
      const createResponse = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim().toLowerCase() }),
      });

      if (!createResponse.ok) throw new Error('Error creating tag');
      const { tag } = await createResponse.json();

      // Añadir a la idea
      await handleAddTag(tag.id);
      setNewTagName('');
      loadAvailableTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Error al crear el tag');
    } finally {
      setLoading(false);
    }
  };

  const currentTagIds = currentTags.map(t => t.id);
  const suggestedTags = availableTags.filter(tag => !currentTagIds.includes(tag.id));

  if (!isEditing) {
    return (
      <button
        onClick={handleStartEdit}
        className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
        disabled={loading}
      >
        <FaTag className="text-xs" />
        <span>Editar tags</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <FaTag className="text-purple-600" />
            <span>Gestionar Tags</span>
          </h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Tags */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-sm">
              Tags actuales ({currentTags.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentTags.length > 0 ? (
                currentTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: tag.color,
                      borderWidth: '1px',
                    }}
                  >
                    <span>{tag.name}</span>
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      disabled={loading}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No hay tags asignados</p>
              )}
            </div>
          </div>

          {/* Create New Tag */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-sm">
              Crear nuevo tag
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateAndAddTag()}
                placeholder="Nombre del tag..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleCreateAndAddTag}
                disabled={loading || !newTagName.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <FaPlus className="text-xs" />
                <span>Crear</span>
              </button>
            </div>
          </div>

          {/* Suggested Tags */}
          {suggestedTags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                Tags disponibles ({suggestedTags.length})
              </h4>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: tag.color,
                      borderWidth: '1px',
                    }}
                  >
                    <FaPlus className="text-xs" />
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
