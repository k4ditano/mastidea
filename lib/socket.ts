import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./prisma";

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HTTPServer) => {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
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

  return io;
};

export const getIO = (): SocketIOServer | null => {
  if (!io) {
    console.warn("[Socket.IO] Socket.IO no está inicializado");
  }
  return io;
};

// Función auxiliar para emitir actualizaciones de idea
export const emitIdeaUpdate = (ideaId: string, event: string, data: any) => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to(`idea:${ideaId}`).emit(event, data);
    console.log(`[Socket.IO] Emitido ${event} a idea:${ideaId}`);
  }
};
