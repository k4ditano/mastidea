'use client';

import { Idea } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { FaChevronRight, FaComments, FaCheckCircle } from 'react-icons/fa';
import TagBadge from './TagBadge';

interface IdeaCardProps {
  idea: Idea;
  onTagClick?: (tagName: string) => void;
}

export default function IdeaCard({ idea, onTagClick }: IdeaCardProps) {
  const expansionCount = idea.expansions?.length || 0;

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
            {idea.status === 'COMPLETED' && (
              <div className="flex items-center space-x-2 mb-2">
                <FaCheckCircle className="text-green-600 text-sm" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Completada</span>
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
                <span>{expansionCount} {expansionCount === 1 ? 'expansión' : 'expansiones'}</span>
              </span>
            )}
          </div>
          <span>
            {formatDistanceToNow(new Date(idea.createdAt), { 
              addSuffix: true,
              locale: es 
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
