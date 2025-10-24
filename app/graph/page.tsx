'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Idea } from '@/types';
import { FaArrowLeft, FaProjectDiagram } from 'react-icons/fa';
import Link from 'next/link';
import Loading from '@/components/Loading';

// Importar dinámicamente para evitar SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  status: string;
  tags: string[];
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  sharedTags: string[];
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function GraphPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?limit=1000');
      if (!response.ok) throw new Error('Error loading ideas');
      
      const data = await response.json();
      setIdeas(data.ideas);
      buildGraphData(data.ideas);
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildGraphData = (ideas: Idea[]) => {
    // Crear nodos
    const nodes: GraphNode[] = ideas.map(idea => ({
      id: idea.id,
      name: idea.title,
      val: Math.max(5, (idea.expansions?.length || 0) * 2 + 5), // Tamaño del nodo
      color: idea.status === 'COMPLETED' ? '#10b981' : 
             idea.status === 'ACTIVE' ? '#7c3aed' : '#9ca3af',
      status: idea.status,
      tags: idea.tags?.map(t => t.tag.name) || []
    }));

    // Crear enlaces basados en tags compartidos
    const links: GraphLink[] = [];
    for (let i = 0; i < ideas.length; i++) {
      for (let j = i + 1; j < ideas.length; j++) {
        const idea1 = ideas[i];
        const idea2 = ideas[j];
        
        const tags1 = idea1.tags?.map(t => t.tag.name) || [];
        const tags2 = idea2.tags?.map(t => t.tag.name) || [];
        
        const sharedTags = tags1.filter(tag => tags2.includes(tag));
        
        if (sharedTags.length > 0) {
          links.push({
            source: idea1.id,
            target: idea2.id,
            value: sharedTags.length,
            sharedTags
          });
        }
      }
    }

    setGraphData({ nodes, links });
  };

  const handleNodeClick = (node: any) => {
    router.push(`/idea/${node.id}`);
  };

  const handleNodeHover = (node: any) => {
    setSelectedNode(node ? node.id : null);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/ideas"
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2 mb-4"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </Link>
          
          <div className="flex items-center space-x-3 mb-2">
            <FaProjectDiagram className="text-3xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Grafo de Ideas</h1>
          </div>
          
          <p className="text-gray-600 text-sm">
            Explora las conexiones entre tus ideas. Los enlaces representan tags compartidos.
          </p>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Leyenda</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
              <span>Idea Activa</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Idea Completada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <span>Idea Archivada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-purple-400"></div>
              <span>Tags compartidos (grosor = cantidad)</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-purple-600">{graphData.nodes.length}</div>
            <div className="text-sm text-gray-600">Ideas totales</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-blue-600">{graphData.links.length}</div>
            <div className="text-sm text-gray-600">Conexiones</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">
              {graphData.links.reduce((sum, link) => sum + link.value, 0)}
            </div>
            <div className="text-sm text-gray-600">Tags compartidos</div>
          </div>
        </div>

        {/* Grafo */}
        {graphData.nodes.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            <ForceGraph2D
              graphData={graphData}
              nodeLabel={(node: any) => `${node.name}\nTags: ${node.tags.join(', ')}`}
              nodeColor={(node: any) => node.id === selectedNode ? '#ff6b6b' : node.color}
              nodeRelSize={6}
              nodeVal={(node: any) => node.val}
              linkWidth={(link: any) => link.value * 2}
              linkColor={() => 'rgba(124, 58, 237, 0.3)'}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={(link: any) => link.value}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              backgroundColor="#ffffff"
              enableNodeDrag={true}
              cooldownTime={3000}
              d3VelocityDecay={0.3}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaProjectDiagram className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay suficientes ideas para crear un grafo
            </h3>
            <p className="text-gray-500 mb-6">
              Crea al menos 2 ideas con tags para ver las conexiones
            </p>
            <Link
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Crear nueva idea
            </Link>
          </div>
        )}

        {/* Info adicional */}
        {graphData.nodes.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Haz click en cualquier nodo para abrir la idea. 
              Arrastra los nodos para reorganizar el grafo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
