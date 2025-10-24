'use client';

import { useState } from 'react';
import { Expansion, EXPANSION_TYPE_LABELS } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaChevronDown, FaChevronUp, FaReply } from 'react-icons/fa';

interface ExpansionCardProps {
  expansion: Expansion;
  onReply?: (expansionId: string, message: string) => Promise<void>;
  isReplying?: boolean;
}

export default function ExpansionCard({ expansion, onReply, isReplying }: ExpansionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const typeInfo = EXPANSION_TYPE_LABELS[expansion.type];

  console.log('ExpansionCard render:', { 
    hasOnReply: !!onReply, 
    isExpanded, 
    showReplyBox,
    expansionId: expansion.id 
  });

  const handleReply = async () => {
    if (!replyMessage.trim() || !onReply) return;
    
    await onReply(expansion.id, replyMessage);
    setReplyMessage('');
    setShowReplyBox(false);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-einstein-300 transition-all animate-slide-up">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{typeInfo.emoji}</span>
          <div className="text-left">
            <span className="font-semibold text-gray-900">{typeInfo.label}</span>
            <span className="text-xs text-gray-500 ml-2">
              {formatDistanceToNow(new Date(expansion.createdAt), { 
                addSuffix: true,
                locale: es 
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">🤖 IA</span>
          {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </div>
      </button>

      {/* Content - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mb-3">
            {expansion.content}
          </div>
          
          {/* Reply Button - TESTING - Always visible */}
          <div className="border-t border-gray-200 pt-3 mt-3 bg-blue-50 p-2 rounded">
            <p className="text-xs mb-2">DEBUG: onReply={onReply ? 'SI' : 'NO'}, isReplying={isReplying ? 'SI' : 'NO'}</p>
            {!showReplyBox ? (
              <button
                onClick={() => setShowReplyBox(true)}
                className="flex items-center space-x-2 text-sm text-einstein-600 hover:text-einstein-700 font-medium transition-colors bg-white px-3 py-2 rounded border border-einstein-300"
              >
                <FaReply className="text-xs" />
                <span>Responder a la IA</span>
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Pídele más detalles, que profundice, o que explore otro ángulo..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-einstein-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isReplying}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyMessage('');
                    }}
                    disabled={isReplying}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={isReplying || !replyMessage.trim() || !onReply}
                    className="px-4 py-1.5 text-sm bg-einstein-600 text-white rounded-lg hover:bg-einstein-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReplying ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
