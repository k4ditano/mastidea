'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Loading from '@/components/Loading';
import VoiceRecorder from '@/components/VoiceRecorder';
import ExportButtons from '@/components/ExportButtons';
import TagEditor from '@/components/TagEditor';
import SuccessScore from '@/components/SuccessScore';
import IdeaActions from '@/components/IdeaActions';
import { Idea, ExpansionType, EXPANSION_TYPE_LABELS } from '@/types';
import { FaArrowLeft, FaTrash, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

// Helper to get current locale from cookie
const getCurrentLocale = (): 'es' | 'en' => {
  if (typeof document === 'undefined') return 'es';
  const cookie = document.cookie.split('; ').find(row => row.startsWith('locale='));
  return (cookie?.split('=')[1] as 'es' | 'en') || 'es';
};

const getDateLocale = (locale: 'es' | 'en') => {
  return locale === 'es' ? es : enUS;
};

export default function IdeaPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('idea');
  const locale = getCurrentLocale();
  const dateLocale = getDateLocale(locale);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanding, setExpanding] = useState(false);
  const [replyingToExpansion, setReplyingToExpansion] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [completing, setCompleting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const handleTranscript = (text: string) => {
    setCustomMessage((prev) => prev + (prev ? ' ' : '') + text);
  };

  const loadIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}`);
      if (!response.ok) {
        throw new Error('Idea not found');
      }
      const data = await response.json();
      setIdea(data);
    } catch (error) {
      console.error('Error loading idea:', error);
      alert(t('errorLoading'));
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadIdea();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Polling para estado de IA
  useEffect(() => {
    if (!idea || idea.aiProcessingStatus !== 'PENDING') {
      setAiProcessing(false);
      return;
    }

    setAiProcessing(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ideas/${params.id}/status`);
        const data = await res.json();
        if (data.aiProcessingStatus !== 'PENDING') {
          const response = await fetch(`/api/ideas/${params.id}`);
          if (response.ok) {
            const updatedIdea = await response.json();
            setIdea(updatedIdea);
          }
          setAiProcessing(false);
        }
      } catch (error) {
        console.error('Error checking AI status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea?.aiProcessingStatus, params.id]);

  const handleExpand = async (type: ExpansionType) => {
    setExpanding(true);
    try {
      const response = await fetch(`/api/ideas/${params.id}/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Error expanding idea');
      }

      await loadIdea();
    } catch (error) {
      console.error('Error:', error);
      alert(t('errorExpanding'));
    } finally {
      setExpanding(false);
    }
  };

  const handleReplyToExpansion = async (expansionId: string, message: string) => {
    setReplyingToExpansion(expansionId || 'custom');
    try {
      const response = await fetch(`/api/ideas/${params.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Error responding to expansion');
      }

      await loadIdea();
    } catch (error) {
      console.error('Error:', error);
      alert(t('errorReplying'));
    } finally {
      setReplyingToExpansion(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch(`/api/ideas/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error deleting idea');
      }

      router.push('/ideas');
    } catch (error) {
      console.error('Error:', error);
      alert(t('errorDeleting'));
    }
  };

  const handleComplete = async () => {
    // Prevenir ejecuciones múltiples
    if (completing) {
      return;
    }

    if (!confirm(t('confirmComplete'))) {
      return;
    }

    setCompleting(true);
    try {
      const response = await fetch(`/api/ideas/${params.id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error completing idea');
      }

      await loadIdea();
      alert(t('completeSuccess'));
    } catch (error) {
      console.error('Error:', error);
      alert(t('errorCompleting'));
    } finally {
      setCompleting(false);
    }
  };

  const handleSummarize = async () => {
    // Prevenir ejecuciones múltiples
    if (summarizing) {
      return;
    }

    if (!confirm(t('confirmSummarize'))) {
      return;
    }

    setSummarizing(true);
    try {
      const response = await fetch(`/api/ideas/${params.id}/summarize`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        // Mostrar mensaje específico si existe
        throw new Error(data.message || 'Error generating summary');
      }

      await loadIdea();
      alert(t('summarizeSuccess'));
    } catch (error) {
      console.error('Error:', error);
      alert((error as Error).message || t('errorSummarizing'));
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  console.log('Idea status:', idea.status, 'Type:', typeof idea.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
      {/* Global AI Loading Indicator */}
      {(expanding || replyingToExpansion || completing || summarizing || aiProcessing) && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-full shadow-2xl px-6 py-4 flex items-center space-x-3 border-2 border-einstein-500 animate-slide-in">
          <div className="animate-bounce">
            <span className="text-3xl">🧠</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {completing ? t('aiCompleting') : summarizing ? t('aiSummarizing') : aiProcessing ? t('aiProcessingBackground') : t('aiThinking')}
            </p>
            {aiProcessing && (
              <p className="text-xs text-gray-600 mt-1">{t('autoUpdate')}</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        {/* Simple Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
          >
            <FaArrowLeft className="text-lg" />
            <span className="hidden sm:inline">{t('back')}</span>
          </button>
          
          <div className="flex items-center space-x-2">
            {idea.status === 'ACTIVE' && (
              <>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium shadow-md"
                >
                  <FaClipboardList />
                  <span>{summarizing ? t('summarizing') : t('summarize')}</span>
                </button>
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium shadow-md"
                >
                  <FaCheckCircle />
                  <span>{completing ? t('closing') : t('close')}</span>
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 transition-colors p-2"
            >
              <FaTrash className="text-lg" />
            </button>
          </div>
        </div>

        {/* Completed Badge */}
        {idea.status === 'COMPLETED' && (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 flex items-center space-x-3">
            <FaCheckCircle className="text-green-600 text-2xl" />
            <div>
              <p className="font-bold text-green-900">{t('completed')}</p>
              <p className="text-sm text-green-700">{t('completedDesc')}</p>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="mb-4">
          <ExportButtons idea={idea} />
        </div>

        {/* Idea Actions - Edit, Reopen, Fork */}
        <div className="mb-4">
          <IdeaActions idea={idea} onUpdate={(updatedIdea) => setIdea(updatedIdea)} />
        </div>

        {/* Chat-like Interface */}
        <div className="space-y-4 pb-64">
          {/* Welcome message - only if no expansions */}
          {(!idea.expansions || idea.expansions.length === 0) && (
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-einstein-50 to-purple-50 rounded-2xl px-6 py-4 border border-einstein-200 max-w-md text-center">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('welcomeMessage')}</span>
                  <br />
                  <span className="text-xs text-gray-600">{t('welcomeAction')}</span>
                </p>
              </div>
            </div>
          )}

          {/* Original Idea - User Message Style */}
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-gradient-to-br from-gray-100 to-gray-50 text-gray-800 rounded-2xl rounded-tl-sm px-6 py-4 shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">💡</span>
                  <span className="font-bold text-sm text-gray-600">{t('yourIdea')}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(idea.createdAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <h1 className="text-xl font-bold mb-2 text-gray-900">{idea.title}</h1>
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 mb-3">{idea.content}</p>
              
              {/* Tags */}
              {idea.tags && idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-300">
                  {idea.tags.map((ideaTag) => (
                    <Link
                      key={ideaTag.tagId}
                      href={`/ideas?tag=${encodeURIComponent(ideaTag.tag.name)}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium hover:scale-105 transition-transform cursor-pointer"
                      style={{
                        backgroundColor: `${ideaTag.tag.color}20`,
                        color: ideaTag.tag.color,
                        borderColor: ideaTag.tag.color,
                        borderWidth: '1px',
                      }}
                    >
                      {ideaTag.tag.name}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Tag Editor */}
              <div className="pt-3 border-t border-gray-300 mt-3">
                <TagEditor 
                  ideaId={idea.id} 
                  currentTags={idea.tags?.map(it => it.tag) || []}
                  onTagsUpdated={loadIdea}
                />
              </div>
            </div>
          </div>

          {/* AI Expansions - Chat bubbles */}
          {idea.expansions && idea.expansions.map((expansion) => (
            <div key={expansion.id} className="space-y-3">
              {/* User message if exists */}
              {expansion.userMessage && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">👤</span>
                      <span className="text-xs opacity-80">Tú</span>
                    </div>
                    <p className="text-sm leading-relaxed">{expansion.userMessage}</p>
                  </div>
                </div>
              )}
              
              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-sm px-6 py-4 shadow-md border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl">{EXPANSION_TYPE_LABELS[expansion.type].emoji}</span>
                    <span className="font-semibold text-sm text-gray-900">
                      {EXPANSION_TYPE_LABELS[expansion.type].label}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {formatDistanceToNow(new Date(expansion.createdAt), { addSuffix: true, locale: dateLocale })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                    {expansion.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="whitespace-pre-wrap">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Success Score - Show after SUMMARY expansion */}
              {expansion.type === 'SUMMARY' && idea.successScore && (
                <div className="mt-6">
                  <SuccessScore 
                    score={idea.successScore} 
                    analysis={idea.successAnalysis} 
                  />
                </div>
              )}
            </div>
          ))}

          {/* Action Buttons - Sticky at bottom - Only show if ACTIVE */}
          {idea.status === 'ACTIVE' && (
            <div className="fixed bottom-0 left-0 right-0 bg-white pt-4 pb-4 shadow-lg">
              <div className="max-w-3xl mx-auto px-4">
                {/* Title/Context - Badge style */}
                <div className="flex justify-center mb-3">
                  <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                    <span className="text-sm">🧠</span>
                    <span className="text-xs text-gray-600 font-medium">{t('developIdea')}</span>
                  </div>
                </div>
              
              {/* Quick action badges */}
              <div className="flex justify-center flex-wrap gap-2 mb-3">
                {[
                  { type: 'SUGGESTION' as ExpansionType, emoji: '💡', label: t('suggestions') },
                  { type: 'QUESTION' as ExpansionType, emoji: '❓', label: t('questions') },
                  { type: 'CONNECTION' as ExpansionType, emoji: '🔗', label: t('connections') },
                  { type: 'USE_CASE' as ExpansionType, emoji: '🎯', label: t('useCases') },
                  { type: 'CHALLENGE' as ExpansionType, emoji: '⚡', label: t('challenges') },
                ].map((action) => (
                  <button
                    key={action.type}
                    onClick={() => handleExpand(action.type)}
                    disabled={expanding}
                    className="group relative inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 text-gray-700 hover:text-white rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200 hover:border-transparent shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <span className="text-base">{action.emoji}</span>
                    <span className="font-semibold">{action.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Main input - larger and prominent */}
              <div className="relative">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customMessage.trim()) {
                      handleReplyToExpansion('', customMessage);
                      setCustomMessage('');
                    }
                  }}
                  className="flex space-x-3"
                >
                  <input
                    name="customMessage"
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={t('customMessagePlaceholder')}
                    disabled={expanding || replyingToExpansion !== null}
                    className="flex-1 px-5 py-4 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50 disabled:bg-gray-100 shadow-sm placeholder:text-gray-400 transition-all"
                  />
                  
                  {/* Botón de micrófono */}
                  <VoiceRecorder 
                    onTranscript={handleTranscript}
                    disabled={expanding || replyingToExpansion !== null}
                  />
                  
                  <button
                    type="submit"
                    disabled={expanding || replyingToExpansion !== null || !customMessage.trim()}
                    className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-2xl hover:from-gray-800 hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-xl">➤</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
