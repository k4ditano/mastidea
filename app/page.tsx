'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import IdeaCard from '@/components/IdeaCard';
import Loading from '@/components/Loading';
import VoiceRecorder from '@/components/VoiceRecorder';
import { Idea } from '@/types';
import { FaRocket } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const t = useTranslations('home');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  
  const quotes = [
    t('quote1'),
    t('quote2'),
    t('quote3'),
    t('quote4'),
    t('quote5'),
  ];
  
  const [randomQuote] = useState(() => 
    quotes[Math.floor(Math.random() * quotes.length)]
  );

  const handleTranscript = (text: string) => {
    setContent((prev) => prev + (prev ? ' ' : '') + text);
  };

  useEffect(() => {
    loadRecentIdeas();
  }, []);

  const loadRecentIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?limit=3');
      const data = await response.json();
      setRecentIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error loading recent ideas:', error);
      setRecentIdeas([]);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert(t('emptyIdea'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Error creating idea');
      }

      const idea = await response.json();
      // Redirigir a /ideas para ver la lista con el estado de procesamiento
      router.push('/ideas');
    } catch (error) {
      console.error('Error:', error);
      alert(t('errorCreating'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="text-6xl mb-4 animate-pulse-slow">🧠</div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Mast<span className="text-einstein-600">Idea</span>
          </h1>
          <p className="text-xl text-gray-600 italic mb-2">
            "{randomQuote}"
          </p>
          <p className="text-sm text-gray-500">— {t('quoteAuthor')}</p>
        </div>

        {/* Capture Form - Simple Chat Style */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-gray-200 animate-slide-up">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
              <span className="text-sm">💭</span>
              <span className="text-sm text-gray-600 font-medium">{t('writeYourIdea')}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('placeholder')}
                rows={8}
                className="
                  w-full px-5 py-4 rounded-2xl text-base
                  border-2 border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200
                  transition-all outline-none resize-none
                  text-gray-900 placeholder-gray-400
                "
                disabled={loading}
              />
              
              {/* Botón de micrófono flotante */}
              <div className="absolute bottom-4 right-4">
                <VoiceRecorder 
                  onTranscript={handleTranscript}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="
                w-full py-4 px-6 rounded-2xl
                bg-gradient-to-r from-gray-700 to-gray-800
                text-white font-semibold text-base
                hover:from-gray-800 hover:to-gray-900
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center space-x-2
                shadow-md hover:shadow-lg
              "
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('thinking')}</span>
                </>
              ) : (
                <>
                  <FaRocket />
                  <span>{t('developIdea')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Ideas */}
        {!loadingIdeas && recentIdeas.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t('recentIdeas')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-1">
              {recentIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </div>
        )}

        {loadingIdeas && <Loading />}
      </div>
    </div>
  );
}
