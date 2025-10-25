import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface SuccessScoreProps {
  score: number;
  analysis?: string | null;
  compact?: boolean;
}

export default function SuccessScore({ score, analysis, compact = false }: SuccessScoreProps) {
  // Determinar color basado en el score
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-50 border-green-200';
    if (score >= 6) return 'bg-blue-50 border-blue-200';
    if (score >= 4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excelente potencial';
    if (score >= 7) return 'Muy prometedor';
    if (score >= 5) return 'Buen potencial';
    if (score >= 3) return 'Potencial moderado';
    return 'Requiere trabajo';
  };

  // Renderizar estrellas
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(score / 2); // Score de 10 = 5 estrellas
    const hasHalfStar = (score % 2) >= 1;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="inline" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="inline" />);
      } else {
        stars.push(<FaRegStar key={i} className="inline opacity-30" />);
      }
    }

    return stars;
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getScoreBgColor(score)}`}>
        <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
          {renderStars()}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {score}/10
        </span>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${getScoreBgColor(score)}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            🎯 Valoración de Éxito
          </h3>
          <p className="text-sm text-gray-600">
            Análisis generado por IA
          </p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getScoreColor(score)} mb-1`}>
            {score}/10
          </div>
          <div className={`${getScoreColor(score)} text-lg mb-2`}>
            {renderStars()}
          </div>
          <div className={`text-sm font-medium ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </div>
        </div>
      </div>

      {analysis && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}
