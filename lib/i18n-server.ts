import { cookies } from 'next/headers';

export type Locale = 'es' | 'en';

/**
 * Obtiene el idioma actual desde las cookies
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value as Locale;
  return locale || 'es';
}

/**
 * Prompts del sistema para la IA en diferentes idiomas
 */
export const AI_PROMPTS = {
  es: {
    title: 'Eres Einstein creando títulos brillantes. Crea un título corto (máximo 8 palabras), creativo e inspirador que capture la esencia. Sin comillas, sin puntos. Como si fuera el nombre de un descubrimiento fascinante. Solo el título, nada más.',
    expansion: 'Eres un asistente creativo que ayuda a desarrollar ideas. Expande la siguiente idea de manera constructiva y detallada en español.',
    tags: 'Genera 3-5 tags relevantes para esta idea en español. Responde solo con los nombres de los tags separados por comas, sin numeración.',
    analysis: 'Analiza la viabilidad y potencial de éxito de esta idea en español. Proporciona un análisis detallado que incluya: fortalezas, debilidades, oportunidades de mercado, y recomendaciones.',
    suggestions: 'Proporciona 3-5 sugerencias concretas para mejorar esta idea en español.',
    questions: 'Genera 3-5 preguntas provocadoras que ayuden a explorar diferentes ángulos de esta idea en español.',
    connections: 'Identifica conexiones con otros conceptos, tecnologías o tendencias relevantes para esta idea en español.',
    useCases: 'Describe 3-5 casos de uso prácticos y específicos para esta idea en español.',
    challenges: 'Identifica los principales desafíos y obstáculos que podría enfrentar esta idea en español.',
    summary: 'Crea un resumen ejecutivo completo de esta idea en español que incluya: visión general, propuesta de valor, mercado objetivo, ventajas competitivas, y próximos pasos recomendados.'
  },
  en: {
    title: 'You are Einstein creating brilliant titles. Create a short title (maximum 8 words), creative and inspiring that captures the essence. No quotes, no periods. As if it were the name of a fascinating discovery. Just the title, nothing else.',
    expansion: 'You are a creative assistant helping to develop ideas. Expand the following idea constructively and in detail in English.',
    tags: 'Generate 3-5 relevant tags for this idea in English. Respond only with tag names separated by commas, without numbering.',
    analysis: 'Analyze the feasibility and success potential of this idea in English. Provide a detailed analysis that includes: strengths, weaknesses, market opportunities, and recommendations.',
    suggestions: 'Provide 3-5 concrete suggestions to improve this idea in English.',
    questions: 'Generate 3-5 thought-provoking questions that help explore different angles of this idea in English.',
    connections: 'Identify connections with other concepts, technologies, or relevant trends for this idea in English.',
    useCases: 'Describe 3-5 practical and specific use cases for this idea in English.',
    challenges: 'Identify the main challenges and obstacles this idea might face in English.',
    summary: 'Create a complete executive summary of this idea in English that includes: overview, value proposition, target market, competitive advantages, and recommended next steps.'
  }
};

/**
 * Obtiene los prompts de IA en el idioma especificado
 */
export function getAIPrompts(locale: Locale) {
  return AI_PROMPTS[locale];
}
