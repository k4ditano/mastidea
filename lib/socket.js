const { Server: SocketIOServer } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Usar global para compartir entre el servidor y las API routes
if (!global.io) {
  global.io = null;
}

const initSocket = (httpServer) => {
  if (global.io) return global.io;

  global.io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
  });

  global.io.on("connection", (socket) => {
    console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

    // Unirse a una sala específica de una idea
    socket.on("join-idea", async (ideaId, userId) => {
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
    socket.on("leave-idea", (ideaId) => {
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

const getIO = () => {
  if (!global.io) {
    console.warn("[Socket.IO] Socket.IO no está inicializado");
  }
  return global.io;
};

// Función auxiliar para emitir actualizaciones de idea
const emitIdeaUpdate = (ideaId, event, data) => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to(`idea:${ideaId}`).emit(event, data);
    console.log(`[Socket.IO] Emitido ${event} a idea:${ideaId}`);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitIdeaUpdate,
};
