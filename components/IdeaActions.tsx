'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Idea } from '@/types';
import { FaEdit, FaRedo, FaCodeBranch, FaTrash, FaArchive, FaUserPlus } from 'react-icons/fa';
import CollaboratorInvite from './CollaboratorInvite';

interface IdeaActionsProps {
  idea: Idea;
  onUpdate?: (updatedIdea: Idea) => void;
  isOwner?: boolean;
}

export default function IdeaActions({ idea, onUpdate, isOwner = true }: IdeaActionsProps) {
  const router = useRouter();
  const t = useTranslations('actions');
  const tCollab = useTranslations('collaboration');
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForkMenu, setShowForkMenu] = useState(false);
  const [showCollaboratorInvite, setShowCollaboratorInvite] = useState(false);
  const [editData, setEditData] = useState({
    title: idea.title,
    content: idea.content,
    regenerateAnalysis: false,
  });

  const handleReopen = async () => {
    if (!confirm(t('confirmReopen'))) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}/reopen`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error reabriendo idea');

      const data = await response.json();
      if (onUpdate) onUpdate(data.idea);
      router.refresh();
      alert(t('reopenSuccess'));
    } catch (error) {
      console.error('Error:', error);
      alert(t('reopenError'));
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
      alert(t('forkError'));
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
      alert(t('editError'));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(t('confirmArchive'))) return;

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
      alert(t('archiveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error eliminando idea');

      router.push('/ideas');
    } catch (error) {
      console.error('Error:', error);
      alert(t('deleteError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('title')}</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Compartir (solo propietario) */}
        {isOwner && (
          <button
            onClick={() => setShowCollaboratorInvite(true)}
            disabled={loading}
            style={{ backgroundColor: '#7257ff' }}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-einstein-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaUserPlus className="shrink-0" />
            <span>{tCollab('inviteCollaborator')}</span>
          </button>
        )}

        {/* Editar */}
        {isOwner && (
          <button
            onClick={() => setShowEditModal(true)}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaEdit className="text-blue-600 flex-shrink-0" />
            <span>{t('edit')}</span>
          </button>
        )}

        {/* Reabrir (solo si está completada y es propietario) */}
        {isOwner && idea.status === 'COMPLETED' && (
          <button
            onClick={handleReopen}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaRedo className="text-green-600 flex-shrink-0" />
            <span>{t('reopen')}</span>
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
            <span>{t('fork')}</span>
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
                <div className="font-medium">{t('forkIdeaOnly')}</div>
                <div className="text-xs text-gray-500">{t('forkIdeaOnlyDesc')}</div>
              </button>
              <button
                onClick={() => {
                  handleFork(true);
                  setShowForkMenu(false);
                }}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-lg border-t"
              >
                <div className="font-medium">{t('forkComplete')}</div>
                <div className="text-xs text-gray-500">{t('forkCompleteDesc')}</div>
              </button>
            </div>
          )}
        </div>

        {/* Archivar (solo si está activa y es propietario) */}
        {isOwner && idea.status === 'ACTIVE' && (
          <button
            onClick={handleArchive}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaArchive className="text-yellow-600 flex-shrink-0" />
            <span>{t('archive')}</span>
          </button>
        )}

        {/* Eliminar (solo propietario) */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 bg-white border border-red-300 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaTrash className="flex-shrink-0" />
            <span>{t('delete')}</span>
          </button>
        )}
      </div>

      {/* Modal de Invitar Colaborador */}
      {showCollaboratorInvite && (
        <CollaboratorInvite
          ideaId={idea.id}
          onInviteSent={() => {
            setShowCollaboratorInvite(false);
            router.refresh();
          }}
          onClose={() => setShowCollaboratorInvite(false)}
        />
      )}

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('editTitle')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('editTitleLabel')}
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
                    {t('editContentLabel')}
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
                      {t('editRegenerateAnalysis')}
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
                  {loading ? t('editSaving') : t('editSave')}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('editCancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
