'use client';

import { useEffect, useState } from 'react';
import { Expansion } from '@/types';

interface UseRealtimeUpdatesProps {
  ideaId: string;
  onNewExpansions?: (expansions: Expansion[]) => void;
}

export function useRealtimeUpdates({ ideaId, onNewExpansions }: UseRealtimeUpdatesProps) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource(`/api/ideas/${ideaId}/updates`);

      eventSource.onopen = () => {
        console.log('SSE connection established');
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_expansions' && data.expansions) {
            console.log(`Received ${data.count} new expansions`);
            onNewExpansions?.(data.expansions);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection error');
        setConnected(false);
        eventSource?.close();
        
        // Intentar reconectar después de 5 segundos
        setTimeout(() => {
          if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
            connect();
          }
        }, 5000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
        setConnected(false);
      }
    };
  }, [ideaId, onNewExpansions]);

  return { connected };
}
