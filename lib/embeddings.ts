/**
 * Genera embeddings para texto usando OpenAI API con fallback a OpenRouter
 * Primero intenta con OpenAI, si falla por rate limit usa OpenRouter
 */
export async function generateEmbedding(text: string, retryCount = 0): Promise<number[]> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openaiKey && !openrouterKey) {
      console.warn('Ni OPENAI_API_KEY ni OPENROUTER_API_KEY configuradas - embeddings deshabilitados');
      return [];
    }

    // Limpiar y truncar el texto si es muy largo (max 8191 tokens)
    const cleanText = text.trim().substring(0, 30000); // ~8k tokens aprox
    
    if (!cleanText) {
      console.warn('Texto vacío para embedding');
      return [];
    }

    // Intentar primero con OpenAI (más rápido y confiable)
    if (openaiKey && retryCount === 0) {
      const result = await tryOpenAI(cleanText);
      if (result) return result;
      
      // Si falló por rate limit, intentar con OpenRouter
      console.log('🔄 Cambiando a OpenRouter como fallback...');
    }

    // Fallback a OpenRouter
    if (openrouterKey) {
      return await tryOpenRouter(cleanText);
    }

    return [];
  } catch (error) {
    console.error('Error en generateEmbedding:', error);
    return [];
  }
}

/**
 * Intenta generar embedding con OpenAI
 */
async function tryOpenAI(text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      }),
    });

    if (response.status === 429) {
      console.warn('⚠️ OpenAI rate limit alcanzado (429)');
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en OpenAI embeddings:', {
        status: response.status,
        error: errorText.substring(0, 200),
      });
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].embedding) {
      console.log(`✅ Embedding OpenAI generado: ${data.data[0].embedding.length} dimensiones`);
      return data.data[0].embedding;
    }

    return null;
  } catch (error) {
    console.error('Error en tryOpenAI:', error);
    return null;
  }
}

/**
 * Genera embedding con OpenRouter (fallback)
 */
async function tryOpenRouter(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mastidea.app',
        'X-Title': 'MastIdea',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en OpenRouter embeddings:', {
        status: response.status,
        error: errorText.substring(0, 200),
      });
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('OpenRouter respuesta no es JSON:', contentType);
      return [];
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].embedding) {
      console.log(`✅ Embedding OpenRouter generado: ${data.data[0].embedding.length} dimensiones`);
      return data.data[0].embedding;
    }

    console.warn('OpenRouter respuesta sin datos válidos');
    return [];
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Error parseando respuesta JSON de OpenRouter:', error.message);
    } else {
      console.error('Error en tryOpenRouter:', error);
    }
    return [];
  }
}

/**
 * Genera embeddings para múltiples textos con fallback
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openaiKey && !openrouterKey) {
      console.warn('Ni OPENAI_API_KEY ni OPENROUTER_API_KEY configuradas - embeddings deshabilitados');
      return [];
    }

    // Limpiar textos
    const cleanTexts = texts
      .map(t => t.trim().substring(0, 30000))
      .filter(t => t.length > 0);
    
    if (cleanTexts.length === 0) {
      console.warn('No hay textos válidos para embeddings');
      return [];
    }

    // Intentar primero con OpenAI
    if (openaiKey) {
      const result = await tryOpenAIBatch(cleanTexts);
      if (result.length > 0) return result;
      
      console.log('🔄 Cambiando a OpenRouter para batch...');
    }

    // Fallback a OpenRouter
    if (openrouterKey) {
      return await tryOpenRouterBatch(cleanTexts);
    }

    return [];
  } catch (error) {
    console.error('Error en generateEmbeddings:', error);
    return [];
  }
}

async function tryOpenAIBatch(texts: string[]): Promise<number[][]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
        encoding_format: 'float',
      }),
    });

    if (response.status === 429) {
      console.warn('⚠️ OpenAI batch rate limit alcanzado');
      return [];
    }

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      const embeddings = data.data.map((item: { embedding: number[] }) => item.embedding);
      console.log(`✅ ${embeddings.length} embeddings OpenAI generados (batch)`);
      return embeddings;
    }

    return [];
  } catch (error) {
    console.error('Error en tryOpenAIBatch:', error);
    return [];
  }
}

async function tryOpenRouterBatch(texts: string[]): Promise<number[][]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mastidea.app',
        'X-Title': 'MastIdea',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: texts,
      }),
    });

    if (!response.ok) {
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return [];
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      const embeddings = data.data.map((item: { embedding: number[] }) => item.embedding);
      console.log(`✅ ${embeddings.length} embeddings OpenRouter generados (batch)`);
      return embeddings;
    }

    return [];
  } catch (error) {
    console.error('Error en tryOpenRouterBatch:', error);
    return [];
  }
}
