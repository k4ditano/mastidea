/**
 * Genera embeddings para texto
 * NOTA: Embeddings deshabilitados por ahora para minimizar costos
 * La búsqueda semántica funcionará cuando se habilite
 */
export async function generateEmbedding(_text: string): Promise<number[]> {
  // Por ahora retornamos array vacío para deshabilitar embeddings
  // Esto permite que la app funcione sin errores
  // TODO: Implementar con un servicio de embeddings gratuito o muy barato
  console.log('Embeddings deshabilitados - búsqueda semántica no disponible');
  return [];
}

/**
 * Genera embeddings para múltiples textos
 */
export async function generateEmbeddings(_texts: string[]): Promise<number[][]> {
  console.log('Embeddings deshabilitados - búsqueda semántica no disponible');
  return [];
}
