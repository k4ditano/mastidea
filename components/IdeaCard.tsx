'use client';

import { Idea } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { FaChevronRight, FaComments, FaCheckCircle, FaStar, FaRobot, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import TagBadge from './TagBadge';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';

function getDateLocale(locale: string) {
  return locale === 'es' ? es : enUS;
}

function getCurrentLocale() {
  if (typeof window === 'undefined') return 'es';
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('locale='));
  return cookie ? cookie.split('=')[1] : 'es';
}

interface IdeaCardProps {
  idea: Idea;
  onTagClick?: (tagName: string) => void;
}

export default function IdeaCard({ idea, onTagClick }: IdeaCardProps) {
  const tIdea = useTranslations('idea');
  const tCollab = useTranslations('collaboration');
  const { user } = useUser();
  const expansionCount = idea.expansions?.length || 0;
  const [aiStatus, setAiStatus] = useState(idea.aiProcessingStatus || 'COMPLETED');
  const locale = getCurrentLocale();
  const dateLocale = getDateLocale(locale);

  // Determinar si el usuario es colaborador (no propietario)
  const isCollaborator = user && idea.userId !== user.id && 
    idea.collaborators?.some((c) => c.userId === user.id);

  // Polling para actualizar el estado de IA
  useEffect(() => {
    if (aiStatus === 'PENDING') {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/ideas/${idea.id}/status`);
          const data = await res.json();
          if (data.aiProcessingStatus !== 'PENDING') {
            setAiStatus(data.aiProcessingStatus);
            // Recargar la página actual para mostrar tags/expansiones nuevas
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }
        } catch (error) {
          console.error('Error checking AI status:', error);
        }
      }, 3000); // Check cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [aiStatus, idea.id]);

  return (
    <Link href={`/idea/${idea.id}`}>
      <div className={`
        group bg-white rounded-xl border p-6
        hover:shadow-lg transition-all duration-200 cursor-pointer
        animate-fade-in
        ${idea.status === 'COMPLETED' 
          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
          : 'border-gray-200 hover:border-einstein-300'
        }
      `}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {/* Estado de IA en procesamiento */}
            {aiStatus === 'PENDING' && (
              <div className="flex items-center space-x-2 mb-2 animate-pulse">
                <FaRobot className="text-einstein-500 text-sm" />
                <span className="text-xs font-semibold text-einstein-600 uppercase tracking-wide">
                  {locale === 'es' ? 'IA procesando...' : 'AI processing...'}
                </span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-einstein-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-einstein-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-einstein-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            {/* Error en IA */}
            {aiStatus === 'FAILED' && (
              <div className="flex items-center space-x-2 mb-2">
                <FaExclamationTriangle className="text-yellow-600 text-sm" />
                <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                  {locale === 'es' ? 'Error en IA' : 'AI Error'}
                </span>
              </div>
            )}

            {/* Badge de Colaborador */}
            {isCollaborator && (
              <div className="flex items-center space-x-2 mb-2">
                <FaUsers className="text-blue-600 text-sm" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  {tCollab('collaborator')}
                </span>
              </div>
            )}

            {/* Idea completada */}
            {idea.status === 'COMPLETED' && (
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-green-600 text-sm" />
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{tIdea('completed')}</span>
                </div>
                {idea.successScore && (
                  <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 rounded-full">
                    <FaStar className="text-green-600 text-xs" />
                    <span className="text-xs font-bold text-green-700">{idea.successScore}/10</span>
                  </div>
                )}
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-einstein-600 transition-colors line-clamp-2">
              {idea.title}
            </h3>
          </div>
          <FaChevronRight className="text-gray-400 group-hover:text-einstein-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
        </div>

        {/* Content preview */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {idea.content}
        </p>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
            {idea.tags.slice(0, 4).map((ideaTag) => (
              <TagBadge
                key={ideaTag.tagId}
                tag={ideaTag.tag}
                onClick={onTagClick ? () => {
                  onTagClick(ideaTag.tag.name);
                } : undefined}
              />
            ))}
            {idea.tags.length > 4 && (
              <span className="text-xs text-gray-400 self-center">
                +{idea.tags.length - 4} más
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {expansionCount > 0 && (
              <span className="flex items-center space-x-1">
                <FaComments className="text-einstein-500" />
                <span>{expansionCount} {locale === 'es' ? (expansionCount === 1 ? 'expansión' : 'expansiones') : (expansionCount === 1 ? 'expansion' : 'expansions')}</span>
              </span>
            )}
          </div>
          <span>
            {formatDistanceToNow(new Date(idea.createdAt), { 
              addSuffix: true,
              locale: dateLocale
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
