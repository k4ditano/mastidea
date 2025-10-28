'use client';

import { useState, useEffect } from 'react';
import { IdeaCollaborator } from '@/types';

interface CollaboratorListProps {
  ideaId: string;
  isOwner: boolean;
}

export default function CollaboratorList({ ideaId, isOwner }: CollaboratorListProps) {
  const [collaborators, setCollaborators] = useState<IdeaCollaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ideas/${ideaId}/collaborators`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collaboratorId }),
      });

      if (response.ok) {
        setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar colaborador');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      alert('Error al eliminar colaborador');
    }
  };

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Cargando colaboradores...</div>;
  }

  if (collaborators.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        No hay colaboradores en esta idea
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Colaboradores ({collaborators.length})
      </h3>
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-einstein-500 rounded-full flex items-center justify-center text-white font-semibold">
                {collaborator.userEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {collaborator.userEmail}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Desde {new Date(collaborator.addedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => handleRemoveCollaborator(collaborator.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                title="Eliminar colaborador"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
