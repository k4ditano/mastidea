/**
 * Genera embeddings para texto usando OpenRouter
 * Usa el modelo text-embedding-3-small que es GRATIS
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY no configurada - embeddings deshabilitados');
      return [];
    }

    // Limpiar y truncar el texto si es muy largo (max 8191 tokens)
    const cleanText = text.trim().substring(0, 30000); // ~8k tokens aprox
    
    if (!cleanText) {
      console.warn('Texto vacío para embedding');
      return [];
    }

    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mastidea.app',
        'X-Title': 'MastIdea',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small', // GRATIS en OpenRouter
        input: cleanText,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error generando embedding:', error);
      return [];
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].embedding) {
      console.log(`Embedding generado: ${data.data[0].embedding.length} dimensiones`);
      return data.data[0].embedding;
    }

    console.warn('Respuesta de embedding sin datos válidos');
    return [];
  } catch (error) {
    console.error('Error en generateEmbedding:', error);
    return [];
  }
}

/**
 * Genera embeddings para múltiples textos
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY no configurada - embeddings deshabilitados');
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

    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mastidea.app',
        'X-Title': 'MastIdea',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: cleanTexts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error generando embeddings batch:', error);
      return [];
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      const embeddings = data.data.map((item: { embedding: number[] }) => item.embedding);
      console.log(`${embeddings.length} embeddings generados`);
      return embeddings;
    }

    console.warn('Respuesta de embeddings batch sin datos válidos');
    return [];
  } catch (error) {
    console.error('Error en generateEmbeddings:', error);
    return [];
  }
}
