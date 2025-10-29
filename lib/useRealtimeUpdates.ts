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

    // Obtener URL del servidor
    const serverUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log(`[Socket.IO] Conectando a ${serverUrl}`);

    // Conectar a Socket.IO con configuración mejorada
    const socketIO = io(serverUrl, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true,
    });

    socketIO.on("connect", () => {
      console.log("[Socket.IO] Conectado exitosamente");
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

    socketIO.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Desconectado: ${reason}`);
      setConnected(false);
    });

    socketIO.on("connect_error", (error) => {
      console.error("[Socket.IO] Error de conexión:", error.message);
      setConnected(false);
    });

    socketIO.on("reconnect", (attemptNumber) => {
      console.log(`[Socket.IO] Reconectado después de ${attemptNumber} intentos`);
      setConnected(true);
      // Re-unirse a la sala después de reconectar
      socketIO.emit("join-idea", ideaId, userId);
    });

    socketIO.on("reconnect_attempt", (attemptNumber) => {
      console.log(`[Socket.IO] Intento de reconexión #${attemptNumber}`);
    });

    socketIO.on("reconnect_error", (error) => {
      console.error("[Socket.IO] Error de reconexión:", error.message);
    });

    socketIO.on("reconnect_failed", () => {
      console.error("[Socket.IO] Falló la reconexión después de todos los intentos");
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
        console.log("[Socket.IO] Limpiando conexión");
        socketIO.emit("leave-idea", ideaId);
        socketIO.removeAllListeners();
        socketIO.disconnect();
      }
    };
  }, [ideaId, userId, onNewExpansions, onCollaboratorsUpdated]);

  return { connected, socket };
}
