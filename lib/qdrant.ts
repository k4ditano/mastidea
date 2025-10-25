import { QdrantClient } from '@qdrant/js-client-rest';
import { generateEmbedding } from './embeddings';

const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'mastidea_ideas';
const VECTOR_SIZE = 1536; // Tamaño de embeddings de text-embedding-3-small (OpenRouter)

export interface IdeaPoint {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface SimilarIdea {
  id: string;
  title: string;
  content: string;
  score: number;
  createdAt: string;
}

class QdrantService {
  private client: QdrantClient;
  private isInitialized = false;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  /**
   * Inicializa la colección si no existe
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Verificar si la colección existe
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

      if (!exists) {
        console.log(`Creando colección: ${COLLECTION_NAME}`);
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
          },
        });
        console.log('Colección creada exitosamente');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error inicializando Qdrant:', error);
      // No lanzar error para permitir que la app funcione sin Qdrant
    }
  }

  /**
   * Agrega una idea a Qdrant
   */
  async addIdea(idea: IdeaPoint) {
    try {
      await this.initialize();

      // Generar embedding del título + contenido
      const text = `${idea.title}\n\n${idea.content}`;
      const embedding = await generateEmbedding(text);

      if (embedding.length === 0) {
        console.warn('No se pudo generar embedding, idea no añadida a Qdrant');
        return;
      }

      await this.client.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: idea.id,
            vector: embedding,
            payload: {
              title: idea.title,
              content: idea.content,
              createdAt: idea.createdAt,
            },
          },
        ],
      });

      console.log(`Idea ${idea.id} añadida a Qdrant`);
    } catch (error) {
      console.error('Error añadiendo idea a Qdrant:', error);
      // No lanzar error para permitir que la app funcione sin Qdrant
    }
  }

  /**
   * Busca ideas similares
   */
  async findSimilarIdeas(query: string, limit: number = 5, excludeId?: string): Promise<SimilarIdea[]> {
    try {
      await this.initialize();

      const embedding = await generateEmbedding(query);

      if (embedding.length === 0) {
        console.warn('No se pudo generar embedding para búsqueda');
        return [];
      }

      const results = await this.client.search(COLLECTION_NAME, {
        vector: embedding,
        limit: limit + (excludeId ? 1 : 0),
        with_payload: true,
      });

      return results
        .filter(result => result.id !== excludeId)
        .slice(0, limit)
        .map(result => ({
          id: result.id as string,
          title: result.payload?.title as string,
          content: result.payload?.content as string,
          score: result.score,
          createdAt: result.payload?.createdAt as string,
        }));
    } catch (error) {
      console.error('Error buscando ideas similares:', error);
      return [];
    }
  }

  /**
   * Elimina una idea de Qdrant
   */
  async deleteIdea(ideaId: string) {
    try {
      await this.initialize();

      await this.client.delete(COLLECTION_NAME, {
        wait: true,
        points: [ideaId],
      });

      console.log(`Idea ${ideaId} eliminada de Qdrant`);
    } catch (error) {
      console.error('Error eliminando idea de Qdrant:', error);
      // No lanzar error
    }
  }

  /**
   * Actualiza una idea en Qdrant
   */
  async updateIdea(idea: IdeaPoint) {
    try {
      // En Qdrant, update = upsert
      await this.addIdea(idea);
    } catch (error) {
      console.error('Error actualizando idea en Qdrant:', error);
    }
  }
}

export const qdrantService = new QdrantService();
