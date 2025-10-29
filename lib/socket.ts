import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./prisma";

// Declarar tipos globales para TypeScript
declare global {
  var io: SocketIOServer | undefined;
}

export const initSocket = (httpServer: HTTPServer) => {
  if (global.io) return global.io;

  // Configurar orígenes permitidos para CORS
  const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL 
    ? [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_APP_URL.replace(/:\d+$/, ':3000')]
    : "*";

  global.io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    connectTimeout: 45000,
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  global.io.on("connection", (socket) => {
    console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

    // Unirse a una sala específica de una idea
    socket.on("join-idea", async (ideaId: string, userId: string) => {
      try {
        // Verificar que el usuario tiene acceso a la idea
        const idea = await prisma.idea.findUnique({
          where: { id: ideaId },
          include: {
            collaborators: {
              where: { userId },
            },
          },
        });

        if (idea && (idea.userId === userId || idea.collaborators.length > 0)) {
          socket.join(`idea:${ideaId}`);
          console.log(`[Socket.IO] Usuario ${userId} se unió a idea:${ideaId}`);
          socket.emit("joined-idea", { ideaId, success: true });
        } else {
          socket.emit("joined-idea", { ideaId, success: false, error: "No autorizado" });
        }
      } catch (error) {
        console.error("[Socket.IO] Error al unirse a idea:", error);
        socket.emit("joined-idea", { ideaId, success: false, error: "Error del servidor" });
      }
    });

    // Salir de una sala de idea
    socket.on("leave-idea", (ideaId: string) => {
      socket.leave(`idea:${ideaId}`);
      console.log(`[Socket.IO] Cliente ${socket.id} dejó idea:${ideaId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
    });
  });

  console.log("[Socket.IO] Servidor Socket.IO inicializado correctamente");
  return global.io;
};

export const getIO = (): SocketIOServer | null => {
  if (!global.io) {
    console.warn("[Socket.IO] Socket.IO no está inicializado");
  }
  return global.io || null;
};

// Función auxiliar para emitir actualizaciones de idea
export const emitIdeaUpdate = (ideaId: string, event: string, data: any) => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to(`idea:${ideaId}`).emit(event, data);
    console.log(`[Socket.IO] Emitido ${event} a idea:${ideaId}`);
  }
};
