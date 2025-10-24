'use client';

import { ExpansionType, EXPANSION_TYPE_LABELS } from '@/types';

interface ExpansionButtonsProps {
  onExpand: (type: ExpansionType) => void;
  loading: boolean;
}

export default function ExpansionButtons({ onExpand, loading }: ExpansionButtonsProps) {
  const buttons: Array<{ type: ExpansionType; description: string }> = [
    { type: 'SUGGESTION', description: 'Mejoras y complementos' },
    { type: 'QUESTION', description: 'Preguntas provocadoras' },
    { type: 'CONNECTION', description: 'Conexiones con otros campos' },
    { type: 'USE_CASE', description: 'Casos de uso prácticos' },
    { type: 'CHALLENGE', description: 'Desafíos potenciales' },
  ];

  return (
    <div className="bg-gradient-to-br from-einstein-50 to-purple-50 rounded-xl p-6 border border-einstein-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">💭</span>
        ¿Cómo quieres explorar esta idea?
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {buttons.map((button) => {
          const typeInfo = EXPANSION_TYPE_LABELS[button.type];
          return (
            <button
              key={button.type}
              onClick={() => onExpand(button.type)}
              disabled={loading}
              className="
                group relative overflow-hidden
                bg-white rounded-lg p-4
                border-2 border-gray-200
                hover:border-einstein-400 hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                text-left
              "
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{typeInfo.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-einstein-600 transition-colors">
                    {typeInfo.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {button.description}
                  </p>
                </div>
              </div>
              
              {loading && (
                <div className="absolute inset-0 bg-white/95 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-bounce">
                      <span className="text-3xl">🧠</span>
                    </div>
                    <span className="text-xs text-einstein-600 font-medium">Pensando...</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
