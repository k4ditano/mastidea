const { Server: SocketIOServer } = require("socket.io");
const { prisma } = require("./prisma");

const initSocket = (httpServer) => {
  console.log("[Socket.IO JS] initSocket llamado");
  if (globalThis.io) {
    console.log("[Socket.IO JS] Socket.IO ya estaba inicializado");
    return globalThis.io;
  }

  // Configurar orígenes permitidos para CORS
  const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL 
    ? [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_APP_URL.replace(/:\d+$/, ':3000')]
    : "*";

  globalThis.io = new SocketIOServer(httpServer, {
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

  globalThis.io.on("connection", (socket) => {
    console.log(`[Socket.IO JS] Cliente conectado: ${socket.id}`);

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

  console.log("[Socket.IO JS] Servidor Socket.IO inicializado correctamente");
  console.log("[Socket.IO JS] Guardado en globalThis.io");
  return globalThis.io;
};

const getIO = () => {
  if (!globalThis.io) {
    console.warn("[Socket.IO JS] Socket.IO no está inicializado");
  }
  return globalThis.io || null;
};

// Función auxiliar para emitir actualizaciones de idea
const emitIdeaUpdate = (ideaId, event, data) => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to(`idea:${ideaId}`).emit(event, data);
    console.log(`[Socket.IO JS] Emitido ${event} a idea:${ideaId}`);
  } else {
    console.error(`[Socket.IO JS] No se pudo emitir ${event} - Socket.IO no disponible`);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitIdeaUpdate,
};
