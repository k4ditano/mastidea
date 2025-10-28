"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Expansion } from "@/types";

interface UseRealtimeUpdatesProps {
  ideaId: string;
  userId?: string;
  onNewExpansions?: (expansions: Expansion[]) => void;
  onCollaboratorsUpdated?: () => void;
}

export function useRealtimeUpdates({
  ideaId,
  userId,
  onNewExpansions,
  onCollaboratorsUpdated,
}: UseRealtimeUpdatesProps) {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!ideaId || !userId) return;

    // Conectar a Socket.IO
    const socketIO = io({
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketIO.on("connect", () => {
      console.log("[Socket.IO] Conectado");
      setConnected(true);
      
      // Unirse a la sala de la idea
      socketIO.emit("join-idea", ideaId, userId);
    });

    socketIO.on("joined-idea", (data: { success: boolean; error?: string }) => {
      if (data.success) {
        console.log(`[Socket.IO] Unido a idea:${ideaId}`);
      } else {
        console.error(`[Socket.IO] Error al unirse a idea: ${data.error}`);
      }
    });

    socketIO.on("disconnect", () => {
      console.log("[Socket.IO] Desconectado");
      setConnected(false);
    });

    // Escuchar nuevas expansiones
    socketIO.on("new_expansions", (data: { expansions: Expansion[]; count: number }) => {
      console.log(`[Socket.IO] Recibidas ${data.count} nuevas expansiones`);
      onNewExpansions?.(data.expansions);
    });

    // Escuchar actualizaciones de colaboradores
    socketIO.on("collaborators_updated", () => {
      console.log("[Socket.IO] Colaboradores actualizados");
      onCollaboratorsUpdated?.();
    });

    // Escuchar actualización completa de idea
    socketIO.on("idea_updated", () => {
      console.log("[Socket.IO] Idea actualizada");
      onNewExpansions?.([]); // Trigger reload sin datos específicos
    });

    setSocket(socketIO);

    return () => {
      if (socketIO) {
        socketIO.emit("leave-idea", ideaId);
        socketIO.disconnect();
      }
    };
  }, [ideaId, userId, onNewExpansions, onCollaboratorsUpdated]);

  return { connected, socket };
}
