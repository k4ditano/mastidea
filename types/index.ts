export interface Idea {
  id: string;
  title: string;
  content: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  expansions?: Expansion[];
  similarIdeas?: SimilarIdea[];
  tags?: IdeaTag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface IdeaTag {
  ideaId: string;
  tagId: string;
  createdAt: string;
  tag: Tag;
}

export interface Expansion {
  id: string;
  ideaId: string;
  content: string;
  userMessage?: string | null;
  type: ExpansionType;
  aiModel: string;
  createdAt: string;
}

export type ExpansionType = 
  | 'AUTO_EXPANSION'
  | 'SUGGESTION'
  | 'QUESTION'
  | 'CONNECTION'
  | 'USE_CASE'
  | 'CHALLENGE'
  | 'SUMMARY';

export interface SimilarIdea {
  id: string;
  title: string;
  content: string;
  score: number;
  createdAt: string;
}

export const EXPANSION_TYPE_LABELS: Record<ExpansionType, { label: string; emoji: string; color: string }> = {
  AUTO_EXPANSION: {
    label: 'Primera exploración',
    emoji: '🚀',
    color: 'bg-blue-100 text-blue-700',
  },
  SUGGESTION: {
    label: 'Sugerencias',
    emoji: '💡',
    color: 'bg-yellow-100 text-yellow-700',
  },
  QUESTION: {
    label: 'Preguntas',
    emoji: '❓',
    color: 'bg-purple-100 text-purple-700',
  },
  CONNECTION: {
    label: 'Conexiones',
    emoji: '🔗',
    color: 'bg-green-100 text-green-700',
  },
  USE_CASE: {
    label: 'Casos de uso',
    emoji: '🎯',
    color: 'bg-orange-100 text-orange-700',
  },
  CHALLENGE: {
    label: 'Desafíos',
    emoji: '🧩',
    color: 'bg-red-100 text-red-700',
  },
  SUMMARY: {
    label: 'Resumen ejecutivo',
    emoji: '📋',
    color: 'bg-indigo-100 text-indigo-700',
  },
};
