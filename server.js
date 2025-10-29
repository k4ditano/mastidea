const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { initSocket } = require("./lib/socket");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Inicializar Socket.IO
  initSocket(httpServer);

  httpServer
    .once("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Ready on http://${hostname}:${port} as ${dev ? "development" : process.env.NODE_ENV}`
      );
      console.log("> Socket.IO enabled");
    });
});
