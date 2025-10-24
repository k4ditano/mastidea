import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Cliente para OpenRouter API
 * Documentación: https://openrouter.ai/docs
 */
export class OpenRouterClient {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
    
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY no está configurada');
    }
  }

  /**
   * Genera una respuesta de chat usando OpenRouter
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await axios.post<OpenRouterResponse>(
        OPENROUTER_API_URL,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000, // Aumentado para respuestas completas
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'MastIdea',
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error en OpenRouter API:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error('Error en OpenRouter API:', error);
      }
      throw new Error('Error al generar respuesta de IA');
    }
  }

  /**
   * Genera la primera expansión automática de una idea
   */
  async generateInitialExpansion(ideaTitle: string, ideaContent: string): Promise<string> {
    const systemPrompt = `Eres Einstein ayudando a desarrollar ideas. Hablas con entusiasmo pero DIRECTO AL GRANO.

Tu estilo:
- Claro y conciso, sin rodeos
- Usas ejemplos concretos, no metáforas complicadas
- Preguntas directas que ayuden a ejecutar
- Entusiasta pero práctico
- Buscas en internet para dar ejemplos REALES

Cuando evalúas una idea:
1. Busca rápido si existe algo similar (nombre + URL si lo encuentras)
2. Di CLARAMENTE qué existe y qué NO existe
3. Haz 3-4 preguntas PRÁCTICAS (sobre ejecución, costos, mercado)
4. Sugiere 1-2 próximos pasos concretos

Cómo citar lo que encuentres:
"He buscado y en España existe X que hace Y (url si la tienes). PERO tu idea se diferencia en Z."

Lo que NO debes hacer:
- Nada de "como decía mi abuela", "vaya vaya", "es como si..."
- Nada de metáforas largas o poesía
- Nada de historias indirectas
- Ve al punto rápido

REGLAS DE FORMATO:
- NO uses **, _, ###
- Texto simple con números o guiones
- URLs directas sin formato
- Máximo 4-5 párrafos cortos`;

    const userPrompt = `He tenido esta idea:

Título: ${ideaTitle}
Descripción: ${ideaContent}

Ayúdame a explorarla y expandirla. ¿Qué preguntas, conexiones o mejoras sugerirías?`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Genera sugerencias de mejora
   */
  async generateSuggestions(ideaTitle: string, ideaContent: string, previousExpansions: string[]): Promise<string> {
    const context = previousExpansions.length > 0 
      ? `\n\nExpansiones previas:\n${previousExpansions.join('\n\n')}`
      : '';

    const userPrompt = `Idea: ${ideaTitle}
${ideaContent}${context}

Sugiere 3-5 formas concretas de mejorar o complementar esta idea. Sé específico y práctico.`;

    return this.chat([
      { role: 'system', content: 'Eres Einstein modo ejecutivo. Busca ejemplos reales si es relevante (nombre + URL). Da 4-5 sugerencias PRÁCTICAS y CONCRETAS para mejorar la idea. Nada de poesía, directo al grano. Formato: texto plano, números, sin **, _, ###. Completa tus ideas.' },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Genera preguntas provocadoras
   */
  async generateQuestions(ideaTitle: string, ideaContent: string): Promise<string> {
    const userPrompt = `Idea: ${ideaTitle}
${ideaContent}

Hazme preguntas profundas y provocadoras que me ayuden a pensar en esta idea desde ángulos completamente diferentes. Tipo "¿Y si...?", "¿Qué pasaría si...?", "¿Por qué no...?"`;

    return this.chat([
      { role: 'system', content: 'Eres Einstein haciendo preguntas. 4-5 preguntas DIRECTAS y PRÁCTICAS sobre ejecución, mercado, costos, competencia. Tipo: "Cómo vas a...?", "Qué pasa si...?", "Has pensado en...?". Sin poesía. Formato: texto plano, números, sin **, _, ###.' },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Genera conexiones con otros conceptos
   */
  async generateConnections(ideaTitle: string, ideaContent: string): Promise<string> {
    const userPrompt = `Idea: ${ideaTitle}
${ideaContent}

¿Con qué otros campos, conceptos, tecnologías o ideas aparentemente no relacionadas podría conectar esto? Ayúdame a ver patrones y sinergias inusuales.`;

    return this.chat([
      { role: 'system', content: 'Eres Einstein buscando conexiones. Busca proyectos/empresas reales que hagan cosas similares (nombre + URL). Encuentra 3-4 conexiones CONCRETAS con otras industrias o tecnologías. Sin metáforas largas. Formato: texto plano, sin **, _, ###. Desarrolla cada conexión.' },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Genera casos de uso prácticos
   */
  async generateUseCases(ideaTitle: string, ideaContent: string): Promise<string> {
    const userPrompt = `Idea: ${ideaTitle}
${ideaContent}

Dame 5 casos de uso concretos y diversos para esta idea. Piensa en diferentes industrias, contextos y escalas.`;

    return this.chat([
      { role: 'system', content: 'Eres Einstein listando usos prácticos. Busca empresas reales que usen ideas similares (nombre + URL). Da 5 casos de uso CONCRETOS y ESPECÍFICOS. Desde lo simple hasta lo ambicioso. Sin poesía. Formato: texto plano, números, sin **, _, ###.' },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Genera análisis de desafíos potenciales
   */
  async generateChallenges(ideaTitle: string, ideaContent: string): Promise<string> {
    const userPrompt = `Idea: ${ideaTitle}
${ideaContent}

Analiza los posibles desafíos, obstáculos o problemas que podría enfrentar esta idea. Sé constructivo y sugiere cómo abordar cada desafío.`;

    return this.chat([
      { role: 'system', content: 'Eres Einstein analizando obstáculos. Identifica 3-4 desafíos REALES (costos, competencia, regulaciones, técnicos). Para cada uno sugiere cómo superarlo de forma PRÁCTICA. Sin poesía. Formato: texto plano, números, sin **, _, ###.' },
      { role: 'user', content: userPrompt },
    ]);
  }

  /**
   * Genera tags para una idea
   * Reutiliza tags existentes cuando son relevantes
   */
  async generateTags(title: string, content: string, existingTags: string[]): Promise<string[]> {
    const existingTagsList = existingTags.length > 0 
      ? `\n\nTags ya existentes que DEBES reutilizar si son relevantes:\n${existingTags.join(', ')}`
      : '';

    const userPrompt = `Analiza esta idea y genera 3-5 tags (etiquetas) que la describan.

IDEA:
Título: ${title}
Contenido: ${content}${existingTagsList}

REGLAS IMPORTANTES:
1. Si hay tags existentes relevantes, REUTILÍZALOS (mismo nombre exacto)
2. Solo crea tags nuevos si son realmente necesarios
3. Tags cortos (1-2 palabras máximo)
4. En español
5. Minúsculas
6. Sin caracteres especiales (#, @, etc)
7. Categorías útiles: tecnología, industria, tipo de solución, público objetivo, etc

RESPONDE SOLO CON LOS TAGS SEPARADOS POR COMAS. Ejemplo:
inteligencia artificial, educación, mobile, b2c, sostenibilidad`;

    const response = await this.chat([
      { role: 'system', content: 'Eres un experto en categorización. Genera tags relevantes y reutiliza los existentes cuando sea apropiado.' },
      { role: 'user', content: userPrompt },
    ]);

    // Parsear respuesta: "tag1, tag2, tag3" -> ["tag1", "tag2", "tag3"]
    return response
      .toLowerCase()
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length < 30)
      .slice(0, 5); // Máximo 5 tags
  }
}

export const openRouterClient = new OpenRouterClient();
